import { useMemo, useState } from "react";
import { USER_ROLE_LABELS } from "@/domain/modules/users/models/User";
import type { MessagingContact } from "@/domain/modules/messaging/models/Conversation";
import {
  useMessagingContacts,
  useOpenDirectConversation,
} from "@/presentation/modules/messaging/hooks/useConversations";
import { UserAvatar } from "@/presentation/modules/messaging/components/UserAvatar";
import { WcModal } from "@/presentation/modules/shared/components/ui/webcomponents/Modals/WcModal";
import WcSearchInput from "@/presentation/modules/shared/components/ui/webcomponents/Searchs/wcSearchInput";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { fullName } from "@/presentation/modules/messaging/utils/formatMessageTime";

interface NewChatPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onChatOpened: (conversationId: string) => void;
}

export function NewChatPicker({
  isOpen,
  onClose,
  currentUserId,
  onChatOpened,
}: NewChatPickerProps) {
  const [search, setSearch] = useState("");
  const contactsQuery = useMessagingContacts(isOpen);
  const openMutation = useOpenDirectConversation(currentUserId);
  const { addToast } = useToastStore();

  const filtered = useMemo(() => {
    const list = contactsQuery.data ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter((c) => {
      const name = `${c.firstName ?? ""} ${c.lastName ?? ""}`.toLowerCase();
      return name.includes(term);
    });
  }, [contactsQuery.data, search]);

  const handlePick = async (contact: MessagingContact) => {
    try {
      const conversationId = await openMutation.mutateAsync(contact.id);
      onChatOpened(conversationId);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo iniciar la conversacion";
      addToast({ type: "error", message, duration: 5000 });
    }
  };

  return (
    <WcModal
      isOpen={isOpen}
      onClose={onClose}
      title="Iniciar nuevo chat"
      subtitle="Selecciona el usuario con el que deseas conversar"
      maxWidth="480px"
    >
      <div className="msg-picker-search">
        <WcSearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="Buscar usuario por nombre"
          autoFocus
        />
      </div>

      <div className="msg-picker-list">
        {contactsQuery.isLoading && (
          <div className="msg-picker-empty">Cargando contactos...</div>
        )}
        {contactsQuery.isError && (
          <div className="msg-picker-empty">
            No se pudieron cargar los contactos. Intenta de nuevo.
          </div>
        )}
        {!contactsQuery.isLoading && filtered.length === 0 && (
          <div className="msg-picker-empty">
            {search ? "No se encontraron usuarios." : "No hay otros usuarios activos."}
          </div>
        )}
        {filtered.map((contact) => (
          <button
            key={contact.id}
            type="button"
            className="msg-picker-item"
            onClick={() => handlePick(contact)}
            disabled={openMutation.isPending}
          >
            <UserAvatar
              firstName={contact.firstName}
              lastName={contact.lastName}
              avatarUrl={contact.avatarUrl}
              isOnline={contact.isOnline}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="msg-picker-item-name">
                {fullName(contact.firstName, contact.lastName)}
              </div>
              <div className="msg-picker-item-meta">
                {contact.role ? USER_ROLE_LABELS[contact.role] : "Usuario"}
                {contact.isOnline && (
                  <span style={{ color: "var(--color-success)", marginLeft: 8 }}>
                    En linea
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </WcModal>
  );
}
