import { useMemo, useState } from "react";
import type { Conversation } from "@/domain/modules/messaging/models/Conversation";
import { ConversationListItem } from "@/presentation/modules/messaging/components/ConversationListItem";
import WcSearchInput from "@/presentation/modules/shared/components/ui/webcomponents/Searchs/wcSearchInput";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import type { PresenceByUserId } from "@/presentation/modules/messaging/utils/presenceMap";

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  activeConversationId: string | null;
  onSelect: (conversationId: string) => void;
  presenceByUserId: PresenceByUserId;
  onNewChat: () => void;
  isLoading: boolean;
}

export function ConversationList({
  conversations,
  currentUserId,
  activeConversationId,
  onSelect,
  presenceByUserId,
  onNewChat,
  isLoading,
}: ConversationListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((conv) => {
      const other = conv.participants.find((p) => p.userId !== currentUserId);
      const name = `${other?.firstName ?? ""} ${other?.lastName ?? ""}`.toLowerCase();
      const preview = (conv.lastMessagePreview ?? "").toLowerCase();
      return name.includes(term) || preview.includes(term);
    });
  }, [conversations, search, currentUserId]);

  return (
    <div className="msg-conv-list-wrapper">
      <div className="msg-conv-list-header">
        <h3>Conversaciones</h3>
        <WcButtonIcon
          icon="icon-message-plus"
          variant="primary"
          shape="circle"
          size="sm"
          onClick={onNewChat}
          aria-label="Nuevo chat"
          title="Nuevo chat"
        />
      </div>

      <div className="msg-conv-search">
        <WcSearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="Buscar por nombre o mensaje"
        />
      </div>

      <div className="msg-conv-list">
        {isLoading && conversations.length === 0 && (
          <div className="msg-conv-empty">Cargando...</div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="msg-conv-empty">
            {conversations.length === 0
              ? "No tienes conversaciones todavia. Inicia una nueva con el boton +."
              : "No se encontraron conversaciones."}
          </div>
        )}
        {filtered.map((conv) => (
          <ConversationListItem
            key={conv.id}
            conversation={conv}
            currentUserId={currentUserId}
            isActive={conv.id === activeConversationId}
            onSelect={onSelect}
            presenceByUserId={presenceByUserId}
          />
        ))}
      </div>
    </div>
  );
}
