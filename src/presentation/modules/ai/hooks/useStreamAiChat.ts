import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AiMessage } from "@/domain/modules/ai/models/Conversation";
import type { SseChatEvents } from "@/domain/modules/ai/repositories/AiServiceRepository";
import { streamAiChatMessageUseCase } from "@/infrastructure/modules/ai/config";
import { aiConversationByIdKey } from "@/presentation/modules/ai/hooks/useAiConversations";
import { useAiAssistantStore } from "@/presentation/modules/ai/stores/useAiAssistantStore";

interface UseStreamAiChatResult {
  send: (message: string) => Promise<void>;
  abort: () => void;
  isStreaming: boolean;
  streamingDraft: string;
  error: string | null;
}

const OPTIMISTIC_PREFIX = "optimistic-";

function makeOptimisticMessage(conversationId: string, content: string): AiMessage {
  return {
    id: `${OPTIMISTIC_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    conversationId,
    role: "user",
    content,
    provider: null,
    model: null,
    tokensInput: null,
    tokensOutput: null,
    createdAt: new Date().toISOString(),
  };
}

export function useStreamAiChat(conversationId: string | null | undefined): UseStreamAiChatResult {
  const queryClient = useQueryClient();
  const controllerRef = useRef<AbortController | null>(null);
  const [error, setError] = useState<string | null>(null);

  const streamingDraft = useAiAssistantStore((s) => s.streamingDraft);
  const isStreaming = useAiAssistantStore((s) => s.isStreaming);
  const appendChunk = useAiAssistantStore((s) => s.appendStreamingChunk);
  const setStreaming = useAiAssistantStore((s) => s.setStreaming);
  const resetStreaming = useAiAssistantStore((s) => s.resetStreaming);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  const send = useCallback(
    async (message: string) => {
      if (!conversationId) return;
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      const controller = new AbortController();
      controllerRef.current = controller;
      setError(null);
      resetStreaming();
      setStreaming(true);

      const optimistic = makeOptimisticMessage(conversationId, message);
      appendOptimisticUserMessage(queryClient, conversationId, optimistic);

      const events: SseChatEvents = {
        onDelta: (delta) => appendChunk(delta),
        onCompleted: ({ userMessage, assistantMessage }) => {
          replaceOptimisticWithReal(
            queryClient,
            conversationId,
            optimistic.id,
            userMessage,
            assistantMessage,
          );
          resetStreaming();
        },
        onError: (err) => {
          rollbackOptimistic(queryClient, conversationId, optimistic.id);
          setError(err.message);
          resetStreaming();
        },
      };

      try {
        await streamAiChatMessageUseCase.execute(
          { conversationId, message },
          events,
          controller.signal,
        );
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          rollbackOptimistic(queryClient, conversationId, optimistic.id);
          resetStreaming();
          return;
        }
        rollbackOptimistic(queryClient, conversationId, optimistic.id);
        const msg = err instanceof Error ? err.message : "Error desconocido";
        setError(msg);
        resetStreaming();
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null;
      }
    },
    [conversationId, queryClient, appendChunk, resetStreaming, setStreaming],
  );

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    resetStreaming();
  }, [resetStreaming]);

  return { send, abort, isStreaming, streamingDraft, error };
}

interface ConversationCache {
  conversation: unknown;
  messages: AiMessage[];
}

function appendOptimisticUserMessage(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  optimistic: AiMessage,
): void {
  queryClient.setQueryData(
    aiConversationByIdKey(conversationId),
    (current: ConversationCache | undefined) => {
      if (!current) return current;
      return { ...current, messages: [...current.messages, optimistic] };
    },
  );
}

function replaceOptimisticWithReal(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  optimisticId: string,
  userMessage: AiMessage,
  assistantMessage: AiMessage,
): void {
  queryClient.setQueryData(
    aiConversationByIdKey(conversationId),
    (current: ConversationCache | undefined) => {
      if (!current) return current;
      const filtered = current.messages.filter((m) => m.id !== optimisticId);
      const existing = new Set(filtered.map((m) => m.id));
      const additions: AiMessage[] = [];
      if (!existing.has(userMessage.id)) additions.push(userMessage);
      if (!existing.has(assistantMessage.id)) additions.push(assistantMessage);
      if (additions.length === 0) return current;
      return { ...current, messages: [...filtered, ...additions] };
    },
  );
}

function rollbackOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  optimisticId: string,
): void {
  queryClient.setQueryData(
    aiConversationByIdKey(conversationId),
    (current: ConversationCache | undefined) => {
      if (!current) return current;
      const filtered = current.messages.filter((m) => m.id !== optimisticId);
      if (filtered.length === current.messages.length) return current;
      return { ...current, messages: filtered };
    },
  );
}
