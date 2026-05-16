import type { Message } from "@/domain/modules/messaging/models/Message";
import type { ConversationParticipantSummary } from "@/domain/modules/messaging/models/Conversation";
import { UserAvatar } from "@/presentation/modules/messaging/components/UserAvatar";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import {
  formatMessageTime,
  fullName,
} from "@/presentation/modules/messaging/utils/formatMessageTime";

export type MessageReadStatus = "pending" | "sent" | "read";

interface MessageBubbleProps {
  message: Message;
  sender: ConversationParticipantSummary | null;
  isOutgoing: boolean;
  isPending?: boolean;
  showAvatar: boolean;
  readStatus?: MessageReadStatus;
}

export function MessageBubble({
  message,
  sender,
  isOutgoing,
  isPending = false,
  showAvatar,
  readStatus,
}: MessageBubbleProps) {
  const senderName = !isOutgoing && showAvatar && sender
    ? fullName(sender.firstName, sender.lastName)
    : null;

  return (
    <div
      className={`msg-bubble-row${isOutgoing ? " outgoing" : ""}${isPending ? " pending" : ""}${showAvatar ? " has-tail" : ""}`}
    >
      <UserAvatar
        firstName={sender?.firstName ?? null}
        lastName={sender?.lastName ?? null}
        avatarUrl={sender?.avatarUrl ?? null}
        showStatusDot={false}
        size="sm"
        placeholder={!showAvatar}
      />
      <div className="msg-bubble">
        {senderName && <div className="msg-bubble-sender">{senderName}</div>}
        <div className="msg-bubble-text">{message.content}</div>
        <div className="msg-bubble-meta">
          <span className="msg-bubble-time">{formatMessageTime(message.createdAt)}</span>
          {isOutgoing && readStatus && <MessageReadIndicator status={readStatus} />}
        </div>
      </div>
    </div>
  );
}

function MessageReadIndicator({ status }: { status: MessageReadStatus }) {
  if (status === "pending") {
    return (
      <span className="msg-bubble-status pending" title="Enviando...">
        <Icon name="icon-clock" size={12} />
      </span>
    );
  }
  if (status === "read") {
    return (
      <span className="msg-bubble-status read" title="Leido">
        <Icon name="icon-check-double" size={14} />
      </span>
    );
  }
  return (
    <span className="msg-bubble-status sent" title="Enviado">
      <Icon name="icon-check" size={14} />
    </span>
  );
}
