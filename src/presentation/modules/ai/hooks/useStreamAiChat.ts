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

      const events: SseChatEvents = {
        onDelta: (delta) => appendChunk(delta),
        onCompleted: ({ userMessage, assistantMessage }) => {
          appendCompletedMessages(queryClient, conversationId, userMessage, assistantMessage);
          resetStreaming();
        },
        onError: (err) => {
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
          resetStreaming();
          return;
        }
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

function appendCompletedMessages(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  userMessage: AiMessage,
  assistantMessage: AiMessage,
): void {
  queryClient.setQueryData(
    aiConversationByIdKey(conversationId),
    (current: { conversation: unknown; messages: AiMessage[] } | undefined) => {
      if (!current) return current;
      const existingIds = new Set(current.messages.map((m) => m.id));
      const additions = [userMessage, assistantMessage].filter((m) => !existingIds.has(m.id));
      if (additions.length === 0) return current;
      return { ...current, messages: [...current.messages, ...additions] };
    },
  );
}
