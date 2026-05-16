import { useEffect, useMemo } from "react";
import type { Conversation } from "@/domain/modules/messaging/models/Conversation";
import { USER_ROLE_LABELS } from "@/domain/modules/users/models/User";
import { UserAvatar } from "@/presentation/modules/messaging/components/UserAvatar";
import { MessageList } from "@/presentation/modules/messaging/components/MessageList";
import { MessageComposer } from "@/presentation/modules/messaging/components/MessageComposer";
import {
  selectFlatMessages,
  useMessages,
  useSendMessage,
} from "@/presentation/modules/messaging/hooks/useMessages";
import {
  useMarkConversationRead,
  useToggleConversationMute,
} from "@/presentation/modules/messaging/hooks/useConversations";
import { useTypingChannel } from "@/presentation/modules/messaging/hooks/useTypingChannel";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import {
  formatRelativeShort,
  fullName,
} from "@/presentation/modules/messaging/utils/formatMessageTime";

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: string;
  onlineUserIds: Set<string>;
  onClose?: () => void;
  onMinimize?: () => void;
  compact?: boolean;
}

export function ChatWindow({
  conversation,
  currentUserId,
  onlineUserIds,
  onClose,
  onMinimize,
  compact = false,
}: ChatWindowProps) {
  const otherParticipant = useMemo(
    () => conversation.participants.find((p) => p.userId !== currentUserId) ?? null,
    [conversation, currentUserId],
  );

  const otherIsOnline = otherParticipant ? onlineUserIds.has(otherParticipant.userId) : false;
  const otherName = fullName(otherParticipant?.firstName ?? null, otherParticipant?.lastName ?? null);
  const otherRole = otherParticipant?.role ? USER_ROLE_LABELS[otherParticipant.role] : null;

  const myParticipant = conversation.participants.find((p) => p.userId === currentUserId);
  const isMuted = myParticipant?.muted ?? false;

  const messagesQuery = useMessages(conversation.id);
  const sendMutation = useSendMessage(currentUserId);
  const markReadMutation = useMarkConversationRead(currentUserId);
  const toggleMute = useToggleConversationMute(currentUserId);
  const { remoteTypingUserIds, notifyTyping } = useTypingChannel(conversation.id, currentUserId);

  const flatMessages = selectFlatMessages(messagesQuery.data);

  useEffect(() => {
    if (conversation.unreadCount > 0) {
      markReadMutation.mutate(conversation.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  useEffect(() => {
    if (flatMessages.length === 0) return;
    if (conversation.unreadCount > 0) {
      markReadMutation.mutate(conversation.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatMessages.length]);

  const handleSend = async (content: string) => {
    await sendMutation.mutateAsync({ conversationId: conversation.id, content });
  };

  const someoneIsTyping = remoteTypingUserIds.length > 0;

  return (
    <div className="msg-chat-window">
      <div className="msg-chat-header" onClick={compact ? onMinimize : undefined}>
        <UserAvatar
          firstName={otherParticipant?.firstName ?? null}
          lastName={otherParticipant?.lastName ?? null}
          avatarUrl={otherParticipant?.avatarUrl ?? null}
          isOnline={otherIsOnline}
          size={compact ? "sm" : "md"}
        />
        <div className="msg-chat-header-info">
          <h4 className="msg-chat-header-name">
            <span className="msg-chat-header-name-text">{otherName}</span>
          </h4>
          {otherRole && <p className="msg-chat-header-role">{otherRole}</p>}
          <p className={`msg-chat-header-status${otherIsOnline ? " online" : ""}`}>
            {someoneIsTyping
              ? "Escribiendo..."
              : otherIsOnline
                ? "En linea"
                : otherParticipant?.lastReadAt
                  ? `Visto ${formatRelativeShort(otherParticipant.lastReadAt)}`
                  : "Desconectado"}
          </p>
        </div>
        <div className="msg-chat-header-actions">
          {!compact && (
            <WcButtonIcon
              icon={isMuted ? "icon-bell-off" : "icon-bell"}
              variant="ghost"
              shape="circle"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleMute.mutate({ conversationId: conversation.id, muted: !isMuted });
              }}
              title={isMuted ? "Activar notificaciones" : "Silenciar conversacion"}
              aria-label={isMuted ? "Activar notificaciones" : "Silenciar conversacion"}
            />
          )}
          {onMinimize && (
            <WcButtonIcon
              icon="icon-minimize"
              variant="ghost"
              shape="circle"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMinimize();
              }}
              title="Minimizar"
              aria-label="Minimizar"
            />
          )}
          {onClose && (
            <WcButtonIcon
              icon="icon-x"
              variant="ghost"
              shape="circle"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              title="Cerrar"
              aria-label="Cerrar"
            />
          )}
        </div>
      </div>

      <MessageList
        conversation={conversation}
        messages={flatMessages}
        currentUserId={currentUserId}
        isLoading={messagesQuery.isLoading}
        hasMore={messagesQuery.hasNextPage ?? false}
        onLoadMore={() => messagesQuery.fetchNextPage()}
        isFetchingMore={messagesQuery.isFetchingNextPage}
      />

      {someoneIsTyping && !compact && (
        <div className="msg-typing">
          {otherName} esta escribiendo...
        </div>
      )}

      <MessageComposer
        conversationId={conversation.id}
        onSend={handleSend}
        onTyping={notifyTyping}
        isSending={sendMutation.isPending}
        autoFocus={!compact}
      />
    </div>
  );
}
