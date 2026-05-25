import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PRESENCE_STATUS_LABELS, USER_ROLE_LABELS } from "@/domain/modules/users/models/User";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { UserAvatar } from "@/presentation/modules/messaging/components/UserAvatar";
import { NewChatPicker } from "@/presentation/modules/messaging/components/NewChatPicker";
import WcSearchInput from "@/presentation/modules/shared/components/ui/webcomponents/Searchs/wcSearchInput";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
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
    isSoundEnabled,
    setSoundEnabled,
  } = useMessagingUIStore();

  const conversationsQuery = useConversations(user?.id);
  const contactsQuery = useMessagingContacts(Boolean(user?.id));
  const openDirect = useOpenDirectConversation(user?.id);
  const { addToast } = useToastStore();

  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredConversations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((conv) => {
      const other = conv.participants.find((p) => p.userId !== user?.id);
      const name = fullName(other?.firstName ?? null, other?.lastName ?? null).toLowerCase();
      const preview = (conv.lastMessagePreview ?? "").toLowerCase();
      return name.includes(term) || preview.includes(term);
    });
  }, [conversations, searchTerm, user?.id]);

  const filteredContacts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter((contact) => {
      const name = fullName(contact.firstName, contact.lastName).toLowerCase();
      const role = contact.role ? USER_ROLE_LABELS[contact.role].toLowerCase() : "usuario";
      return name.includes(term) || role.includes(term);
    });
  }, [contacts, searchTerm]);

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
              <div className="msg-float-hub-header-actions">
                <WcButtonIcon
                  variant="ghost"
                  shape="circle"
                  size="sm"
                  icon={isSoundEnabled ? "icon-bell" : "icon-bell-off"}
                  onClick={() => setSoundEnabled(!isSoundEnabled)}
                  title={
                    isSoundEnabled
                      ? "Silenciar sonido de mensajes"
                      : "Activar sonido de mensajes"
                  }
                  aria-label={
                    isSoundEnabled
                      ? "Silenciar sonido de mensajes"
                      : "Activar sonido de mensajes"
                  }
                  aria-pressed={isSoundEnabled}
                  className={`msg-float-hub-sound-toggle${isSoundEnabled ? "" : " is-muted"}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setHubOpen(false);
                    navigate("/mensajes");
                  }}
                  className="msg-float-hub-header-link"
                >
                  Ver todos
                  <Icon name="icon-chevron-right" size={12} />
                </button>
              </div>
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

            <div className="msg-float-hub-search">
              <WcSearchInput
                value={searchTerm}
                onValueChange={setSearchTerm}
                placeholder={
                  hubTab === "chats"
                    ? "Buscar chats o mensajes..."
                    : "Buscar usuarios por nombre..."
                }
              />
            </div>

            <div className="msg-float-hub-body">
              {hubTab === "chats" ? (
                <ChatsPanel
                  conversations={filteredConversations}
                  currentUserId={user.id}
                  presenceByUserId={presenceByUserId}
                  onSelect={handleSelectConversation}
                  onNewChat={() => {
                    setHubOpen(false);
                    setIsPickerOpen(true);
                  }}
                  onlineContacts={onlineContacts}
                  onSelectContact={handleSelectContact}
                />
              ) : (
                <UsersPanel
                  contacts={filteredContacts}
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
  onlineContacts: ReturnType<typeof useMessagingContacts>["data"] extends infer T
    ? T extends Array<infer U>
      ? U[]
      : never
    : never;
  onSelectContact: (contactId: string) => void;
}

function ChatsPanel({
  conversations,
  currentUserId,
  presenceByUserId,
  onSelect,
  onNewChat,
  onlineContacts,
  onSelectContact,
}: ChatsPanelProps) {
  return (
    <>
      {/* Active Users Horizontal Slider */}
      {onlineContacts && onlineContacts.length > 0 && (
        <div className="msg-active-slider">
          <div className="msg-active-slider-header">
            <span>Conectados ahora</span>
            <span className="msg-active-slider-badge"></span>
          </div>
          <div className="msg-active-slider-list">
            {onlineContacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                className="msg-active-slider-item"
                onClick={() => onSelectContact(contact.id)}
                title={`Chat directo con ${fullName(contact.firstName, contact.lastName)}`}
              >
                <div className="msg-active-slider-avatar-wrapper">
                  <UserAvatar
                    firstName={contact.firstName}
                    lastName={contact.lastName}
                    avatarUrl={contact.avatarUrl}
                    presenceStatus={contact.presenceStatus}
                    size="sm"
                  />
                </div>
                <span className="msg-active-slider-name">
                  {contact.firstName ?? "Usuario"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="msg-conv-list-subheader">
        <span>Conversaciones</span>
        <button
          type="button"
          onClick={onNewChat}
          className="msg-new-chat-btn"
        >
          + Nuevo chat
        </button>
      </div>

      {!conversations || conversations.length === 0 ? (
        <div className="msg-conv-empty-state">
          <Icon name="icon-messages" size={32} />
          <p>No tienes conversaciones aún.</p>
          <button
            type="button"
            onClick={onNewChat}
            className="msg-conv-empty-action-btn"
          >
            Iniciar una conversación
          </button>
        </div>
      ) : (
        <div className="msg-conv-list-items">
          {conversations.map((conv) => {
            const other = conv.participants.find((p) => p.userId !== currentUserId);
            const name = fullName(other?.firstName ?? null, other?.lastName ?? null);
            const otherPresence = presenceOf(presenceByUserId, other?.userId);
            
            // Outgoing checks logic
            const isLastMessageOutgoing = conv.lastMessageSenderId === currentUserId;
            let isReadByOther = false;
            if (isLastMessageOutgoing && conv.lastMessageAt && other?.lastReadAt) {
              isReadByOther = new Date(other.lastReadAt).getTime() >= new Date(conv.lastMessageAt).getTime();
            }

            return (
              <button
                key={conv.id}
                type="button"
                className={`msg-conv-item${conv.unreadCount > 0 ? " unread" : ""}`}
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
                      {isLastMessageOutgoing && conv.lastMessagePreview && (
                        <span className={`msg-conv-ticks ${isReadByOther ? "read" : "delivered"}`} title={isReadByOther ? "Leído" : "Entregado"}>
                          {isReadByOther ? "✓✓ " : "✓ "}
                        </span>
                      )}
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
        </div>
      )}
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
    <div className="msg-users-list">
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
            <div className="msg-picker-item-top">
              <span className="msg-picker-item-name">
                {fullName(contact.firstName, contact.lastName)}
              </span>
              <span className={`msg-picker-item-presence msg-picker-item-presence--${contact.presenceStatus}`}>
                {PRESENCE_STATUS_LABELS[contact.presenceStatus]}
              </span>
            </div>
            <div className="msg-picker-item-meta">
              <span className={`msg-user-role-badge ${contact.role ?? "user"}`}>
                {contact.role ? USER_ROLE_LABELS[contact.role] : "Usuario"}
              </span>
              {contact.presenceStatus === "offline" && contact.lastSeen && (
                <span className="msg-picker-item-lastseen">
                  Última vez: {formatRelativeShort(contact.lastSeen)}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
