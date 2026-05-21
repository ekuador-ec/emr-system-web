import type { AiMessage } from "@/domain/modules/ai/models/Conversation";
import { MarkdownRenderer } from "@/presentation/modules/ai/components/MarkdownRenderer";
import "@/presentation/modules/ai/components/ChatBubble.css";

interface ChatBubbleProps {
  role: AiMessage["role"];
  content: string;
  isStreaming?: boolean;
  isOptimistic?: boolean;
  meta?: string;
}

export function ChatBubble({ role, content, isStreaming, isOptimistic, meta }: ChatBubbleProps) {
  const isUser = role === "user";
  return (
    <div className={`ai-chat-bubble-row ai-chat-bubble-row--${isUser ? "user" : "assistant"}`}>
      <div
        className={[
          "ai-chat-bubble",
          isUser ? "ai-chat-bubble--user" : "ai-chat-bubble--assistant",
          isOptimistic ? "ai-chat-bubble--optimistic" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {isUser ? content : <MarkdownRenderer source={content} />}
        {isStreaming && !isUser && (
          <div className="ai-typing" aria-label="Generando respuesta">
            <span className="ai-typing__dot" />
            <span className="ai-typing__dot" />
            <span className="ai-typing__dot" />
          </div>
        )}
        {meta && <div className="ai-chat-bubble__meta">{meta}</div>}
      </div>
    </div>
  );
}
