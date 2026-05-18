import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { ChatWindow } from "@/presentation/modules/messaging/components/ChatWindow";
import { UserAvatar } from "@/presentation/modules/messaging/components/UserAvatar";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import {
  useConversation,
  useConversations,
  useMessagingContacts,
} from "@/presentation/modules/messaging/hooks/useConversations";
import { useMessagingUIStore } from "@/presentation/modules/messaging/stores/useMessagingUIStore";
import { fullName } from "@/presentation/modules/messaging/utils/formatMessageTime";
import {
  buildPresenceMap,
  presenceOf,
} from "@/presentation/modules/messaging/utils/presenceMap";
import "@/presentation/modules/messaging/components/Messaging.css";

const DECK_PEEK_PX = 14;
const DECK_FAN_PX = 60;
const ICON_SIZE_PX = 52;
const MOBILE_BREAKPOINT_QUERY = "(max-width: 768px)";

function useIsMobileBubbles(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    const handler = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

export function FloatingChatBubbles() {
  const { user } = useAuth();
  const { bubbles, activeConversationId } = useMessagingUIStore();
  const isMobile = useIsMobileBubbles();

  if (!user) return null;

  const visibleBubbles = bubbles.filter((b) => b.conversationId !== activeConversationId);
  if (visibleBubbles.length === 0) return null;

  const expandedBubble = visibleBubbles.find((b) => !b.isMinimized) ?? null;
  const minimizedBubbles = visibleBubbles.filter((b) => b.isMinimized);
  const hasExpanded = expandedBubble !== null;

  const stackClass = [
    "msg-bubbles-stack",
    isMobile ? "msg-bubbles-stack--mobile-left" : "",
    hasExpanded ? "msg-bubbles-stack--expanded" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={stackClass} aria-label="Burbujas de chat">
      {expandedBubble && (
        <ExpandedBubbleWindow
          conversationId={expandedBubble.conversationId}
          currentUserId={user.id}
        />
      )}
      {minimizedBubbles.length > 0 && (
        <MinimizedBubblesDeck
          bubbles={minimizedBubbles.map((b) => b.conversationId)}
          currentUserId={user.id}
          anchor={isMobile ? "left" : "right"}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}

interface DeckProps {
  bubbles: string[];
  currentUserId: string;
  anchor: "left" | "right";
  isMobile: boolean;
}

function MinimizedBubblesDeck({ bubbles, currentUserId, anchor, isMobile }: DeckProps) {
  const [isFanned, setIsFanned] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFanned) return;
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        setIsFanned(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isFanned]);

  const offset = isFanned ? DECK_FAN_PX : DECK_PEEK_PX;
  const totalWidth = ICON_SIZE_PX + Math.max(0, bubbles.length - 1) * offset;
  const requireFanFirst = isMobile && !isFanned && bubbles.length > 1;

  return (
    <div
      ref={containerRef}
      className={`msg-bubble-deck msg-bubble-deck--${anchor}${isFanned ? " fanned" : ""}`}
      style={{ width: totalWidth, height: ICON_SIZE_PX }}
      onMouseEnter={() => setIsFanned(true)}
      onMouseLeave={() => setIsFanned(false)}
      onClick={() => setIsFanned(true)}
    >
      {bubbles.map((conversationId, idx) => {
        const offsetPx = idx * offset;
        const positionStyle =
          anchor === "left" ? { left: offsetPx } : { right: offsetPx };
        return (
          <div
            key={conversationId}
            className="msg-bubble-deck-item"
            style={{
              ...positionStyle,
              zIndex: bubbles.length - idx,
            }}
          >
            <MinimizedBubbleIcon
              conversationId={conversationId}
              currentUserId={currentUserId}
              showCloseAlways={isFanned}
              requireFanFirst={requireFanFirst}
            />
          </div>
        );
      })}
    </div>
  );
}

interface BubbleProps {
  conversationId: string;
  currentUserId: string;
  showCloseAlways?: boolean;
  requireFanFirst?: boolean;
}

function useBubbleConversation(conversationId: string, currentUserId: string) {
  const conversationFromList = useConversations(currentUserId).data?.find(
    (c) => c.id === conversationId,
  );
  const conversationQuery = useConversation(
    conversationFromList ? null : conversationId,
  );
  const conversation = conversationFromList ?? conversationQuery.data ?? null;

  const contactsQuery = useMessagingContacts(true);
  const presenceByUserId = useMemo(
    () => buildPresenceMap(contactsQuery.data),
    [contactsQuery.data],
  );

  return { conversation, presenceByUserId };
}

function MinimizedBubbleIcon({
  conversationId,
  currentUserId,
  showCloseAlways = false,
  requireFanFirst = false,
}: BubbleProps) {
  const { conversation, presenceByUserId } = useBubbleConversation(conversationId, currentUserId);
  const { toggleBubbleMinimized, closeBubble } = useMessagingUIStore();

  if (!conversation) return null;

  const other = conversation.participants.find((p) => p.userId !== currentUserId);
  const otherPresence = presenceOf(presenceByUserId, other?.userId);
  const name = fullName(other?.firstName ?? null, other?.lastName ?? null);

  const handleActivate = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (requireFanFirst) {
      return;
    }
    e.stopPropagation();
    toggleBubbleMinimized(conversationId);
  };

  return (
    <div
      className={`msg-bubble-icon${showCloseAlways ? " show-close" : ""}`}
      title={name}
      onClick={handleActivate}
      role="button"
      tabIndex={0}
      aria-label={
        requireFanFirst
          ? `Mostrar chats abiertos`
          : `Abrir chat con ${name}`
      }
    >
      <UserAvatar
        firstName={other?.firstName ?? null}
        lastName={other?.lastName ?? null}
        avatarUrl={other?.avatarUrl ?? null}
        presenceStatus={otherPresence}
        size="md"
      />
      {conversation.unreadCount > 0 && (
        <span className="msg-bubble-icon-unread">
          {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
        </span>
      )}
      <span
        className="msg-bubble-icon-close"
        role="button"
        tabIndex={-1}
        aria-label="Cerrar burbuja"
        onClick={(e) => {
          e.stopPropagation();
          closeBubble(conversationId);
        }}
      >
        <Icon name="icon-x" size={10} />
      </span>
    </div>
  );
}

function ExpandedBubbleWindow({ conversationId, currentUserId }: BubbleProps) {
  const { conversation, presenceByUserId } = useBubbleConversation(conversationId, currentUserId);
  const { closeBubble, toggleBubbleMinimized } = useMessagingUIStore();
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (windowRef.current && windowRef.current.contains(target)) return;

      if (
        target.closest(
          ".msg-bubbles-stack, .msg-float-container, .wc-modal-overlay, .msg-composer-emoji-popover",
        )
      ) {
        return;
      }

      toggleBubbleMinimized(conversationId);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [conversationId, toggleBubbleMinimized]);

  if (!conversation) return null;

  return (
    <div className="msg-bubble-window" ref={windowRef}>
      <ChatWindow
        conversation={conversation}
        currentUserId={currentUserId}
        presenceByUserId={presenceByUserId}
        onClose={() => closeBubble(conversationId)}
        onMinimize={() => toggleBubbleMinimized(conversationId)}
        compact
      />
    </div>
  );
}
