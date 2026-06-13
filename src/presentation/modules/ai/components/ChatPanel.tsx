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
  const displayTitle =
    emptyTitle === "Hola, en que puedo ayudarte?" ? `Hola${welcomeName}` : emptyTitle;
  const displaySubtitle =
    emptyTitle === "Hola, en que puedo ayudarte?" ? "¿Cómo puedo ayudarte hoy?" : "";

  const activePreference: AiModelPreference = conversation?.modelPreference ?? globalPreference;

  const composer = (
    <ChatComposer
      value={draft}
      onChange={setDraft}
      onSubmit={handleSend}
      onAbort={chat.abort}
      isStreaming={chat.isStreaming}
      disabled={!conversationId}
      preference={activePreference}
      onChangePreference={allowModelChange ? handleChangePreference : undefined}
      isUpdatingPreference={updatePrefMutation.isPending}
      textareaRef={textareaRef}
      placeholder={conversationId ? undefined : "Iniciando conversación..."}
    />
  );

  const hasConversationContent = messages.length > 0 || chat.isStreaming;

  if (!hasConversationContent) {
    return (
      <div className="ai-chat-welcome">
        <div className="ai-chat-welcome__inner">
          <h1 className="ai-chat-welcome__title">{displayTitle}</h1>
          {displaySubtitle && <p className="ai-chat-welcome__subtitle">{displaySubtitle}</p>}
          <div className="ai-chat-welcome__composer">{composer}</div>
          <p className="ai-chat-welcome__hint">{emptyHint}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-chat-thread">
      <div ref={messagesRef} onScroll={handleScroll} className="ai-chat-thread__messages">
        <div className="ai-chat-thread__inner">
          {messages.map((m) => (
            <ChatBubble
              key={m.id}
              role={m.role}
              content={m.content}
              isOptimistic={m.id.startsWith(OPTIMISTIC_PREFIX)}
            />
          ))}
          {chat.isStreaming && (
            <ChatBubble role="assistant" content={chat.streamingDraft || ""} isStreaming />
          )}
          {chat.error && <div className="ai-chat-thread__error">{chat.error}</div>}
        </div>
      </div>

      <div className="ai-chat-input-dock">
        <div className="ai-chat-input-dock__inner">
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
          {composer}
          <div className="ai-chat-disclaimer">
            El asistente de IA proporciona respuestas de carácter referencial y puede cometer errores. Todo criterio clínico sugerido debe ser validado por un profesional médico y respaldado mediante los exámenes de diagnóstico correspondientes.
          </div>
        </div>
      </div>
    </div>
  );
}
