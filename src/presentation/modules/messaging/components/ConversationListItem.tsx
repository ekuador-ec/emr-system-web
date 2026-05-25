import type { Conversation } from "@/domain/modules/messaging/models/Conversation";
import { UserAvatar } from "@/presentation/modules/messaging/components/UserAvatar";
import {
  formatRelativeShort,
  fullName,
} from "@/presentation/modules/messaging/utils/formatMessageTime";
import {
  presenceOf,
  type PresenceByUserId,
} from "@/presentation/modules/messaging/utils/presenceMap";

interface ConversationListItemProps {
  conversation: Conversation;
  currentUserId: string;
  isActive: boolean;
  onSelect: (conversationId: string) => void;
  presenceByUserId: PresenceByUserId;
}

export function ConversationListItem({
  conversation,
  currentUserId,
  isActive,
  onSelect,
  presenceByUserId,
}: ConversationListItemProps) {
  const other = conversation.participants.find((p) => p.userId !== currentUserId);
  const name = fullName(other?.firstName ?? null, other?.lastName ?? null);
  const presenceStatus = presenceOf(presenceByUserId, other?.userId);
  const preview = conversation.lastMessagePreview ?? "Sin mensajes todavia";
  const time = formatRelativeShort(conversation.lastMessageAt ?? conversation.updatedAt);
  const hasUnread = conversation.unreadCount > 0;

  return (
    <button
      type="button"
      className={`msg-conv-item${isActive ? " active" : ""}${hasUnread ? " unread" : ""}`}
      onClick={() => onSelect(conversation.id)}
    >
      <UserAvatar
        firstName={other?.firstName ?? null}
        lastName={other?.lastName ?? null}
        avatarUrl={other?.avatarUrl ?? null}
        presenceStatus={presenceStatus}
      />
      <div className="msg-conv-item-body">
        <div className="msg-conv-item-top">
          <span className="msg-conv-item-name">{name}</span>
          <span className="msg-conv-item-time">{time}</span>
        </div>
        <div className="msg-conv-item-bottom">
          <span className={`msg-conv-item-preview${hasUnread ? " unread" : ""}`}>
            {preview}
          </span>
          {hasUnread && (
            <span className="msg-conv-item-badge">
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
