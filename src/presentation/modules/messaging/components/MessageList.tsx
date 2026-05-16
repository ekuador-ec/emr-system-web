import { useEffect, useMemo, useRef } from "react";
import type { Conversation } from "@/domain/modules/messaging/models/Conversation";
import type { Message } from "@/domain/modules/messaging/models/Message";
import {
  MessageBubble,
  type MessageReadStatus,
} from "@/presentation/modules/messaging/components/MessageBubble";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import {
  formatDayHeading,
  isSameDay,
} from "@/presentation/modules/messaging/utils/formatMessageTime";

interface MessageListProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  isFetchingMore: boolean;
}

interface RenderItem {
  type: "heading" | "bubble";
  key: string;
  heading?: string;
  message?: Message;
  showAvatar?: boolean;
  isOutgoing?: boolean;
  readStatus?: MessageReadStatus;
}

function isPendingMessage(message: Message): boolean {
  return message.id.startsWith("optimistic-");
}

export function MessageList({
  conversation,
  messages,
  currentUserId,
  isLoading,
  hasMore,
  onLoadMore,
  isFetchingMore,
}: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  const participantsById = useMemo(() => {
    const map = new Map<string, Conversation["participants"][number]>();
    conversation.participants.forEach((p) => map.set(p.userId, p));
    return map;
  }, [conversation.participants]);

  const minOtherReadAtMs = useMemo(() => {
    const others = conversation.participants.filter((p) => p.userId !== currentUserId);
    if (others.length === 0) return 0;
    return others.reduce((min, p) => {
      const ts = p.lastReadAt ? new Date(p.lastReadAt).getTime() : 0;
      return Math.min(min, ts);
    }, Number.POSITIVE_INFINITY);
  }, [conversation.participants, currentUserId]);

  const items = useMemo<RenderItem[]>(() => {
    const result: RenderItem[] = [];
    let previous: Message | null = null;
    messages.forEach((msg) => {
      const showHeading = !previous || !isSameDay(previous.createdAt, msg.createdAt);
      if (showHeading) {
        result.push({
          type: "heading",
          key: `h-${msg.createdAt}`,
          heading: formatDayHeading(msg.createdAt),
        });
      }
      const showAvatar = !previous || previous.senderId !== msg.senderId || showHeading;
      const isOutgoing = msg.senderId === currentUserId;

      let readStatus: MessageReadStatus | undefined;
      if (isOutgoing) {
        if (isPendingMessage(msg)) {
          readStatus = "pending";
        } else {
          const messageTs = new Date(msg.createdAt).getTime();
          readStatus = messageTs <= minOtherReadAtMs ? "read" : "sent";
        }
      }

      result.push({
        type: "bubble",
        key: msg.id,
        message: msg,
        showAvatar,
        isOutgoing,
        readStatus,
      });
      previous = msg;
    });
    return result;
  }, [messages, currentUserId, minOtherReadAtMs]);

  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.id === lastMessageIdRef.current) return;
    lastMessageIdRef.current = last.id;
    const el = listRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="msg-list">
        <div className="msg-chat-empty">Cargando mensajes...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="msg-list">
        <div className="msg-chat-empty">
          <p style={{ margin: 0, fontSize: "var(--font-size-sm)" }}>
            Aun no hay mensajes en esta conversacion.
          </p>
          <p style={{ margin: 0, fontSize: "var(--font-size-xs)" }}>
            Escribe algo para iniciar el chat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="msg-list" ref={listRef}>
      {hasMore && (
        <div className="msg-load-more">
          <WcButton variant="terciary" onClick={onLoadMore} disabled={isFetchingMore}>
            {isFetchingMore ? "Cargando..." : "Cargar mensajes anteriores"}
          </WcButton>
        </div>
      )}

      {items.map((item) => {
        if (item.type === "heading") {
          return (
            <div key={item.key} className="msg-day-heading">
              {item.heading}
            </div>
          );
        }
        const msg = item.message!;
        return (
          <MessageBubble
            key={item.key}
            message={msg}
            sender={participantsById.get(msg.senderId) ?? null}
            isOutgoing={Boolean(item.isOutgoing)}
            isPending={item.readStatus === "pending"}
            showAvatar={Boolean(item.showAvatar)}
            readStatus={item.readStatus}
          />
        );
      })}
    </div>
  );
}
