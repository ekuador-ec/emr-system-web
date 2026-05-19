import { useCallback, useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { ChatBubble } from "@/presentation/modules/ai/components/ChatBubble";
import { useAiConversation } from "@/presentation/modules/ai/hooks/useAiConversations";
import { useStreamAiChat } from "@/presentation/modules/ai/hooks/useStreamAiChat";
import { useAiMessageDraft } from "@/presentation/modules/ai/hooks/useAiMessageDraft";

interface ChatPanelProps {
  conversationId: string | null;
  emptyHint?: string;
}

export function ChatPanel({ conversationId, emptyHint }: ChatPanelProps) {
  const conversationQuery = useAiConversation(conversationId);
  const chat = useStreamAiChat(conversationId);
  const { draft, setDraft, clear: clearDraft } = useAiMessageDraft(conversationId);

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [conversationQuery.data?.messages.length, chat.streamingDraft]);

  const messages = conversationQuery.data?.messages ?? [];

  const handleSend = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || !conversationId || chat.isStreaming) return;
    clearDraft();
    await chat.send(trimmed);
    textareaRef.current?.focus();
  }, [draft, conversationId, chat, clearDraft]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  if (!conversationId) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-8)",
          color: "var(--color-text-secondary)",
          textAlign: "center",
          gap: "var(--space-3)",
          height: "100%",
        }}
      >
        <Icon name="icon-messages" size={36} />
        <div style={{ fontSize: "0.95rem", maxWidth: "420px" }}>
          {emptyHint ?? "Selecciona una conversacion existente o inicia una nueva para comenzar."}
        </div>
      </div>
    );
  }

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
          padding: "var(--space-3) var(--space-2)",
          minHeight: 0,
        }}
      >
        {conversationQuery.isLoading ? (
          <div style={{ color: "var(--color-text-secondary)", padding: "var(--space-3)" }}>
            Cargando mensajes...
          </div>
        ) : messages.length === 0 && !chat.isStreaming ? (
          <div
            style={{
              color: "var(--color-text-secondary)",
              padding: "var(--space-3)",
              fontSize: "0.85rem",
            }}
          >
            Empieza a preguntar lo que necesites profundizar.
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <ChatBubble key={m.id} role={m.role} content={m.content} />
            ))}
            {chat.isStreaming && chat.streamingDraft && (
              <ChatBubble role="assistant" content={chat.streamingDraft} isStreaming />
            )}
            {chat.isStreaming && !chat.streamingDraft && (
              <div
                style={{
                  padding: "var(--space-2)",
                  color: "var(--color-text-secondary)",
                  fontSize: "0.85rem",
                }}
              >
                Procesando respuesta...
              </div>
            )}
          </>
        )}
        {chat.error && (
          <div
            style={{
              margin: "var(--space-2) 0",
              padding: "var(--space-2)",
              color: "var(--color-danger)",
              fontSize: "0.85rem",
            }}
          >
            {chat.error}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          alignItems: "flex-end",
          padding: "var(--space-3) var(--space-2) 0 var(--space-2)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu pregunta..."
          disabled={chat.isStreaming}
          rows={1}
          style={{
            flex: 1,
            minHeight: "44px",
            maxHeight: "160px",
            resize: "vertical",
            padding: "var(--space-2) var(--space-3)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md, 8px)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text)",
            fontFamily: "inherit",
            fontSize: "0.9rem",
            lineHeight: 1.5,
          }}
        />
        <WcButton
          variant="primary"
          onClick={() => void handleSend()}
          disabled={chat.isStreaming || draft.trim().length === 0}
        >
          <Icon name="icon-send" size={16} />
          Enviar
        </WcButton>
      </div>
    </div>
  );
}
