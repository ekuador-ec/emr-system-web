import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PRESENCE_STATUS_LABELS, USER_ROLE_LABELS } from "@/domain/modules/users/models/User";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { UserAvatar } from "@/presentation/modules/messaging/components/UserAvatar";
import { NewChatPicker } from "@/presentation/modules/messaging/components/NewChatPicker";
import {
  useConversations,
  useMessagingContacts,
  useOpenDirectConversation,
} from "@/presentation/modules/messaging/hooks/useConversations";
import { useMessagingUIStore } from "@/presentation/modules/messaging/stores/useMessagingUIStore";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import {
  formatRelativeShort,
  fullName,
} from "@/presentation/modules/messaging/utils/formatMessageTime";
import {
  buildPresenceMap,
  presenceOf,
  type PresenceByUserId,
} from "@/presentation/modules/messaging/utils/presenceMap";
import "@/presentation/modules/messaging/components/Messaging.css";

export function FloatingChatHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const {
    isHubOpen,
    setHubOpen,
    hubTab,
    setHubTab,
    openBubble,
  } = useMessagingUIStore();

  const conversationsQuery = useConversations(user?.id);
  const contactsQuery = useMessagingContacts(Boolean(user?.id));
  const openDirect = useOpenDirectConversation(user?.id);
  const { addToast } = useToastStore();

  const conversations = conversationsQuery.data ?? [];
  const contacts = contactsQuery.data ?? [];
  const onlineContacts = useMemo(
    () => contacts.filter((c) => c.presenceStatus !== "offline"),
    [contacts],
  );
  const presenceByUserId = useMemo(() => buildPresenceMap(contacts), [contacts]);
  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations],
  );

  useEffect(() => {
    if (!isHubOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setHubOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isHubOpen, setHubOpen]);

  if (!user) return null;

  const handleSelectConversation = (conversationId: string) => {
    setHubOpen(false);
    openBubble(conversationId);
  };

  const handleSelectContact = async (contactId: string) => {
    try {
      const conversationId = await openDirect.mutateAsync(contactId);
      setHubOpen(false);
      openBubble(conversationId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo iniciar la conversacion";
      addToast({ type: "error", message, duration: 5000 });
    }
  };

  return (
    <>
      <div ref={panelRef} className="msg-float-container">
        {isHubOpen && (
          <div className="msg-float-hub">
            <div className="msg-float-hub-header">
              <strong style={{ fontSize: "var(--font-size-sm)" }}>Mensajeria</strong>
              <button
                type="button"
                onClick={() => {
                  setHubOpen(false);
                  navigate("/mensajes");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-primary)",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 600,
                }}
              >
                Ver todos
              </button>
            </div>

            <div className="msg-float-hub-tabs">
              <button
                type="button"
                className={`msg-float-hub-tab${hubTab === "chats" ? " active" : ""}`}
                onClick={() => setHubTab("chats")}
              >
                Chats {totalUnread > 0 && `(${totalUnread})`}
              </button>
              <button
                type="button"
                className={`msg-float-hub-tab${hubTab === "users" ? " active" : ""}`}
                onClick={() => setHubTab("users")}
              >
                Usuarios ({onlineContacts.length})
              </button>
            </div>

            <div className="msg-float-hub-body">
              {hubTab === "chats" ? (
                <ChatsPanel
                  conversations={conversations}
                  currentUserId={user.id}
                  presenceByUserId={presenceByUserId}
                  onSelect={handleSelectConversation}
                  onNewChat={() => {
                    setHubOpen(false);
                    setIsPickerOpen(true);
                  }}
                />
              ) : (
                <UsersPanel
                  contacts={contacts}
                  onSelect={handleSelectContact}
                  isOpening={openDirect.isPending}
                />
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          className="msg-float-trigger"
          onClick={() => setHubOpen(!isHubOpen)}
          title="Mensajeria"
          aria-label="Abrir mensajeria"
        >
          <Icon name="icon-messages" size={22} />
          {totalUnread > 0 && (
            <span className="msg-float-trigger-badge">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </button>
      </div>

      <NewChatPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        currentUserId={user.id}
        onChatOpened={(id) => {
          setIsPickerOpen(false);
          openBubble(id);
        }}
      />
    </>
  );
}

interface ChatsPanelProps {
  conversations: ReturnType<typeof useConversations>["data"] extends infer T
    ? T extends Array<infer U>
      ? U[]
      : never
    : never;
  currentUserId: string;
  presenceByUserId: PresenceByUserId;
  onSelect: (conversationId: string) => void;
  onNewChat: () => void;
}

function ChatsPanel({
  conversations,
  currentUserId,
  presenceByUserId,
  onSelect,
  onNewChat,
}: ChatsPanelProps) {
  if (!conversations || conversations.length === 0) {
    return (
      <div style={{ padding: "var(--space-4)", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
          No tienes conversaciones aun.
        </p>
        <button
          type="button"
          onClick={onNewChat}
          style={{
            marginTop: 12,
            background: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
            border: "none",
            padding: "8px 14px",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontSize: "var(--font-size-sm)",
          }}
        >
          Iniciar nuevo chat
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{ padding: "0 var(--space-2) var(--space-2)", textAlign: "right" }}>
        <button
          type="button"
          onClick={onNewChat}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--color-primary)",
            fontSize: "var(--font-size-xs)",
            fontWeight: 600,
          }}
        >
          + Nuevo chat
        </button>
      </div>
      {conversations.map((conv) => {
        const other = conv.participants.find((p) => p.userId !== currentUserId);
        const name = fullName(other?.firstName ?? null, other?.lastName ?? null);
        const otherPresence = presenceOf(presenceByUserId, other?.userId);
        return (
          <button
            key={conv.id}
            type="button"
            className="msg-conv-item"
            onClick={() => onSelect(conv.id)}
          >
            <UserAvatar
              firstName={other?.firstName ?? null}
              lastName={other?.lastName ?? null}
              avatarUrl={other?.avatarUrl ?? null}
              presenceStatus={otherPresence}
              size="sm"
            />
            <div className="msg-conv-item-body">
              <div className="msg-conv-item-top">
                <span className="msg-conv-item-name">{name}</span>
                <span className="msg-conv-item-time">
                  {formatRelativeShort(conv.lastMessageAt ?? conv.updatedAt)}
                </span>
              </div>
              <div className="msg-conv-item-bottom">
                <span className={`msg-conv-item-preview${conv.unreadCount > 0 ? " unread" : ""}`}>
                  {conv.lastMessagePreview ?? "Sin mensajes"}
                </span>
                {conv.unreadCount > 0 && (
                  <span className="msg-conv-item-badge">
                    {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </>
  );
}

interface UsersPanelProps {
  contacts: ReturnType<typeof useMessagingContacts>["data"] extends infer T
    ? T extends Array<infer U>
      ? U[]
      : never
    : never;
  onSelect: (contactId: string) => void;
  isOpening: boolean;
}

function UsersPanel({ contacts, onSelect, isOpening }: UsersPanelProps) {
  if (!contacts || contacts.length === 0) {
    return (
      <div className="msg-picker-empty">No hay otros usuarios disponibles.</div>
    );
  }
  return (
    <>
      {contacts.map((contact) => (
        <button
          key={contact.id}
          type="button"
          className="msg-picker-item"
          onClick={() => onSelect(contact.id)}
          disabled={isOpening}
        >
          <UserAvatar
            firstName={contact.firstName}
            lastName={contact.lastName}
            avatarUrl={contact.avatarUrl}
            presenceStatus={contact.presenceStatus}
            size="sm"
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="msg-picker-item-name">
              {fullName(contact.firstName, contact.lastName)}
            </div>
            <div className="msg-picker-item-meta">
              {contact.role ? USER_ROLE_LABELS[contact.role] : "Usuario"}
              {contact.presenceStatus !== "offline" ? (
                <span
                  className={`msg-picker-item-presence msg-picker-item-presence--${contact.presenceStatus}`}
                  style={{ marginLeft: 8 }}
                >
                  {PRESENCE_STATUS_LABELS[contact.presenceStatus]}
                </span>
              ) : (
                <span style={{ marginLeft: 8 }}>
                  {contact.lastSeen ? formatRelativeShort(contact.lastSeen) : "Desconectado"}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </>
  );
}
