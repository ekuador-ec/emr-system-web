import { useCallback, useEffect, useRef, useState } from "react";
import { ChatBubble } from "@/presentation/modules/ai/components/ChatBubble";
import { ChatComposer } from "@/presentation/modules/ai/components/ChatComposer";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import {
  useAiConversation,
  useUpdateAiConversationPreference,
} from "@/presentation/modules/ai/hooks/useAiConversations";
import { useStreamAiChat } from "@/presentation/modules/ai/hooks/useStreamAiChat";
import { useAiMessageDraft } from "@/presentation/modules/ai/hooks/useAiMessageDraft";
import { useAiAssistantStore } from "@/presentation/modules/ai/stores/useAiAssistantStore";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import type { AiModelPreference } from "@/domain/modules/ai/models/Summary";

interface ChatPanelProps {
  conversationId: string | null;
  emptyTitle?: string;
  emptyHint?: string;
  allowModelChange?: boolean;
}

const OPTIMISTIC_PREFIX = "optimistic-";

export function ChatPanel({
  conversationId,
  emptyTitle = "Hola, en que puedo ayudarte?",
  emptyHint = "Pregunta lo que necesites profundizar.",
  allowModelChange = true,
}: ChatPanelProps) {
  const { user } = useAuth();
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

  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const isNearBottomRef = useRef(true);

  const handleScroll = () => {
    const el = messagesRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    isNearBottomRef.current = isAtBottom;
    setShowScrollBottomBtn(!isAtBottom);
  };

  const scrollToBottom = () => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
    isNearBottomRef.current = true;
    setShowScrollBottomBtn(false);
  };

  useEffect(() => {
    if (!messagesRef.current) return;
    if (isNearBottomRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
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


  const welcomeName = user?.firstName ? `, ${user.firstName}` : "";
  const displayTitle = emptyTitle === "Hola, en que puedo ayudarte?"
    ? `Hola${welcomeName}`
    : emptyTitle;
  const displaySubtitle = emptyTitle === "Hola, en que puedo ayudarte?"
    ? "¿Cómo puedo ayudarte hoy?"
    : "";

  if (!conversationId) {
    return (
      <div className="ai-chat-empty">
        <div className="ai-chat-empty__orb-container">
          <div className="ai-chat-empty__orb-glow" />
          <div className="ai-chat-empty__orb" />
        </div>
        <div className="ai-chat-empty__title">
          {displayTitle}
          {displaySubtitle && (
            <div style={{ fontSize: "1.4rem", fontWeight: 600, opacity: 0.85, marginTop: "4px" }}>
              {displaySubtitle}
            </div>
          )}
        </div>
        <div className="ai-chat-empty__hint">{emptyHint}</div>
      </div>
    );
  }

  const activePreference: AiModelPreference =
    conversation?.modelPreference ?? globalPreference;


  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        position: "relative",
      }}
    >
      <div
        ref={messagesRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 16px 0 16px",
          minHeight: 0,
        }}
      >
        <div style={{ maxWidth: "840px", margin: "0 auto", width: "100%" }}>
          {conversationQuery.isLoading ? (
            <div style={{ color: "var(--color-text-secondary)", padding: "var(--space-3)" }}>
              Cargando mensajes...
            </div>
          ) : messages.length === 0 && !chat.isStreaming ? (
            <div className="ai-chat-empty" style={{ height: "auto", padding: "var(--space-6) 0" }}>
              <div className="ai-chat-empty__orb-container">
                <div className="ai-chat-empty__orb-glow" />
                <div className="ai-chat-empty__orb" />
              </div>
              <div className="ai-chat-empty__title">
                {displayTitle}
                {displaySubtitle && (
                  <div style={{ fontSize: "1.4rem", fontWeight: 600, opacity: 0.85, marginTop: "4px" }}>
                    {displaySubtitle}
                  </div>
                )}
              </div>
              <div className="ai-chat-empty__hint">{emptyHint}</div>
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
      </div>

      <div style={{ padding: "12px 16px 14px 16px", position: "relative" }}>
        <div style={{ maxWidth: "840px", margin: "0 auto", width: "100%", position: "relative" }}>
          {showScrollBottomBtn && (
            <button
              type="button"
              onClick={scrollToBottom}
              className="ai-chat-scroll-bottom"
              title="Bajar al final"
              aria-label="Bajar al final"
            >
              <Icon name="icon-chevron-down" size={22} />
            </button>
          )}
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
          <div className="ai-chat-disclaimer">
            El asistente de IA proporciona respuestas de carácter referencial y puede cometer errores. Todo criterio clínico sugerido debe ser validado por un profesional médico y respaldado mediante los exámenes de diagnóstico correspondientes.
          </div>
        </div>
      </div>
    </div>
  );
}
