import { useCallback, useEffect, useRef } from "react";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { ChatBubble } from "@/presentation/modules/ai/components/ChatBubble";
import { ChatComposer } from "@/presentation/modules/ai/components/ChatComposer";
import {
  useAiConversation,
  useUpdateAiConversationPreference,
} from "@/presentation/modules/ai/hooks/useAiConversations";
import { useStreamAiChat } from "@/presentation/modules/ai/hooks/useStreamAiChat";
import { useAiMessageDraft } from "@/presentation/modules/ai/hooks/useAiMessageDraft";
import { useAiAssistantStore } from "@/presentation/modules/ai/stores/useAiAssistantStore";
import type { AiModelPreference } from "@/domain/modules/ai/models/Summary";

interface ChatPanelProps {
  conversationId: string | null;
  emptyTitle?: string;
  emptyHint?: string;
  emptySuggestions?: string[];
  allowModelChange?: boolean;
}

const OPTIMISTIC_PREFIX = "optimistic-";

export function ChatPanel({
  conversationId,
  emptyTitle = "Hola, en que puedo ayudarte?",
  emptyHint = "Pregunta lo que necesites profundizar.",
  emptySuggestions,
  allowModelChange = true,
}: ChatPanelProps) {
  const conversationQuery = useAiConversation(conversationId);
  const chat = useStreamAiChat(conversationId);
  const { draft, setDraft, clear: clearDraft } = useAiMessageDraft(conversationId);
  const updatePrefMutation = useUpdateAiConversationPreference();

  const globalPreference = useAiAssistantStore((s) => s.preference);
  const setGlobalPreference = useAiAssistantStore((s) => s.setPreference);

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const conversation = conversationQuery.data?.conversation ?? null;
  const messages = conversationQuery.data?.messages ?? [];

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages.length, chat.streamingDraft, chat.isStreaming]);

  const handleSend = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || !conversationId || chat.isStreaming) return;
    clearDraft();
    await chat.send(trimmed);
    textareaRef.current?.focus();
  }, [draft, conversationId, chat, clearDraft]);

  const handleChangePreference = useCallback(
    async (preference: AiModelPreference) => {
      if (!conversationId) {
        setGlobalPreference(preference);
        return;
      }
      try {
        await updatePrefMutation.mutateAsync({ conversationId, modelPreference: preference });
        setGlobalPreference(preference);
      } catch {
        // toast is optional; if the user sees no effect on the dropdown they'll retry
      }
    },
    [conversationId, updatePrefMutation, setGlobalPreference],
  );

  const handleSuggestion = (text: string) => {
    setDraft(text);
    textareaRef.current?.focus();
  };

  if (!conversationId) {
    return (
      <div className="ai-chat-empty">
        <div className="ai-chat-empty__icon">
          <Icon name="icon-stethoscope" size={26} />
        </div>
        <div className="ai-chat-empty__title">{emptyTitle}</div>
        <div className="ai-chat-empty__hint">{emptyHint}</div>
      </div>
    );
  }

  const activePreference: AiModelPreference =
    conversation?.modelPreference ?? globalPreference;

  const realMessageCount = messages.filter((m) => !m.id.startsWith(OPTIMISTIC_PREFIX)).length;
  const showSuggestions =
    realMessageCount === 0 && !chat.isStreaming && (emptySuggestions?.length ?? 0) > 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}
    >
      <div
        ref={messagesRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 16px 0 16px",
          minHeight: 0,
        }}
      >
        {conversationQuery.isLoading ? (
          <div style={{ color: "var(--color-text-secondary)", padding: "var(--space-3)" }}>
            Cargando mensajes...
          </div>
        ) : messages.length === 0 && !chat.isStreaming ? (
          <div className="ai-chat-empty" style={{ height: "auto", padding: "var(--space-6) 0" }}>
            <div className="ai-chat-empty__icon">
              <Icon name="icon-stethoscope" size={26} />
            </div>
            <div className="ai-chat-empty__title">{emptyTitle}</div>
            <div className="ai-chat-empty__hint">{emptyHint}</div>
            {showSuggestions && (
              <div className="ai-chat-suggestions">
                {emptySuggestions!.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="ai-chat-suggestion"
                    onClick={() => handleSuggestion(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <ChatBubble
                key={m.id}
                role={m.role}
                content={m.content}
                isOptimistic={m.id.startsWith(OPTIMISTIC_PREFIX)}
              />
            ))}
            {chat.isStreaming && (
              <ChatBubble
                role="assistant"
                content={chat.streamingDraft || ""}
                isStreaming
              />
            )}
          </>
        )}
        {chat.error && (
          <div
            style={{
              margin: "var(--space-2) 0",
              padding: "var(--space-2) var(--space-3)",
              color: "var(--color-danger)",
              backgroundColor: "color-mix(in srgb, var(--color-danger) 8%, transparent)",
              border: "1px solid color-mix(in srgb, var(--color-danger) 30%, transparent)",
              borderRadius: 8,
              fontSize: "0.85rem",
            }}
          >
            {chat.error}
          </div>
        )}
      </div>

      <div style={{ padding: "12px 16px 14px 16px" }}>
        <ChatComposer
          value={draft}
          onChange={setDraft}
          onSubmit={handleSend}
          onAbort={chat.abort}
          isStreaming={chat.isStreaming}
          preference={activePreference}
          onChangePreference={allowModelChange ? handleChangePreference : undefined}
          isUpdatingPreference={updatePrefMutation.isPending}
          textareaRef={textareaRef}
        />
      </div>
    </div>
  );
}
