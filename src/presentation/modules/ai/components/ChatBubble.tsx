import type { AiMessage } from "@/domain/modules/ai/models/Conversation";
import { MarkdownRenderer } from "@/presentation/modules/ai/components/MarkdownRenderer";

interface ChatBubbleProps {
  role: AiMessage["role"];
  content: string;
  isStreaming?: boolean;
}

export function ChatBubble({ role, content, isStreaming }: ChatBubbleProps) {
  const isUser = role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        margin: "var(--space-2) 0",
      }}
    >
      <div
        style={{
          maxWidth: "85%",
          padding: "var(--space-2) var(--space-3)",
          borderRadius: "var(--radius-md, 12px)",
          backgroundColor: isUser ? "var(--color-primary)" : "var(--color-bg)",
          color: isUser ? "var(--color-on-primary, white)" : "var(--color-text)",
          border: isUser ? "none" : "1px solid var(--color-border)",
          fontSize: "0.9rem",
          lineHeight: 1.5,
        }}
      >
        {isUser ? (
          <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>
        ) : (
          <>
            <MarkdownRenderer source={content} />
            {isStreaming && (
              <span
                aria-label="generando respuesta"
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "var(--color-primary)",
                  borderRadius: "50%",
                  marginLeft: "4px",
                  animation: "ai-pulse 1.2s infinite ease-in-out",
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
