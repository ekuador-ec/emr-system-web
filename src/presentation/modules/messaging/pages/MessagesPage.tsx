import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { WcModuleHeader } from "@/presentation/modules/shared/components/ui/webcomponents/Headers/WcModuleHeader";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { ConversationList } from "@/presentation/modules/messaging/components/ConversationList";
import { ChatWindow } from "@/presentation/modules/messaging/components/ChatWindow";
import { NewChatPicker } from "@/presentation/modules/messaging/components/NewChatPicker";
import {
  useConversation,
  useConversations,
  useMessagingContacts,
} from "@/presentation/modules/messaging/hooks/useConversations";
import { useMessagingUIStore } from "@/presentation/modules/messaging/stores/useMessagingUIStore";
import { buildPresenceMap } from "@/presentation/modules/messaging/utils/presenceMap";
import "@/presentation/modules/messaging/components/Messaging.css";

export function MessagesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationsQuery = useConversations(user?.id);
  const contactsQuery = useMessagingContacts(Boolean(user?.id));

  const {
    activeConversationId,
    setActiveConversation,
    isNewChatPickerOpen,
    setNewChatPickerOpen,
  } = useMessagingUIStore();

  const presenceByUserId = useMemo(
    () => buildPresenceMap(contactsQuery.data),
    [contactsQuery.data],
  );

  useEffect(() => {
    const fromUrl = searchParams.get("c");
    if (fromUrl && fromUrl !== activeConversationId) {
      setActiveConversation(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    return () => {
      setActiveConversation(null);
    };
  }, [setActiveConversation]);

  const handleSelect = (conversationId: string) => {
    setActiveConversation(conversationId);
    const next = new URLSearchParams(searchParams);
    next.set("c", conversationId);
    setSearchParams(next, { replace: true });
  };

  const handleChatOpenedFromPicker = (conversationId: string) => {
    handleSelect(conversationId);
  };

  const activeConversationFromList = useMemo(() => {
    if (!activeConversationId) return null;
    return (conversationsQuery.data ?? []).find((c) => c.id === activeConversationId) ?? null;
  }, [conversationsQuery.data, activeConversationId]);

  const activeConversationFallback = useConversation(
    activeConversationId && !activeConversationFromList ? activeConversationId : null,
  );

  const activeConversation = activeConversationFromList ?? activeConversationFallback.data ?? null;
  const isLoadingActive =
    Boolean(activeConversationId) && !activeConversation && activeConversationFallback.isLoading;

  if (!user) {
    return (
      <div className="msg-page">
        <div className="msg-chat-empty">Cargando sesion...</div>
      </div>
    );
  }

  return (
    <div className="msg-page">
      <WcModuleHeader
        moduleName="Mensajes"
        moduleIcon="icon-messages"
        title="Centro de mensajes"
        description="Conversa con otros usuarios del sistema en tiempo real. Los mensajes se conservan por 30 dias."
      />

      <div className={`msg-layout${activeConversation ? " has-active" : ""}`}>
        <ConversationList
          conversations={conversationsQuery.data ?? []}
          currentUserId={user.id}
          activeConversationId={activeConversationId}
          onSelect={handleSelect}
          presenceByUserId={presenceByUserId}
          onNewChat={() => setNewChatPickerOpen(true)}
          isLoading={conversationsQuery.isLoading}
        />

        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            currentUserId={user.id}
            presenceByUserId={presenceByUserId}
            onClose={() => {
              setActiveConversation(null);
              const next = new URLSearchParams(searchParams);
              next.delete("c");
              setSearchParams(next, { replace: true });
            }}
          />
        ) : isLoadingActive ? (
          <div className="msg-chat-window">
            <div className="msg-chat-empty">Cargando conversacion...</div>
          </div>
        ) : (
          <div className="msg-chat-window">
            <div className="msg-chat-empty">
              <div className="msg-chat-empty-icon">
                <Icon name="icon-messages" size={28} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: "var(--color-text)" }}>
                  Selecciona una conversacion
                </p>
                <p style={{ margin: 4, fontSize: "var(--font-size-sm)" }}>
                  O inicia una nueva con el boton + en la lista de la izquierda.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <NewChatPicker
        isOpen={isNewChatPickerOpen}
        onClose={() => setNewChatPickerOpen(false)}
        currentUserId={user.id}
        onChatOpened={handleChatOpenedFromPicker}
      />
    </div>
  );
}
