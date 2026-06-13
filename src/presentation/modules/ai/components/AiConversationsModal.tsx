import { useMemo, useState } from "react";
import type { AiConversation } from "@/domain/modules/ai/models/Conversation";
import { WcModal } from "@/presentation/modules/shared/components/ui/webcomponents/Modals/WcModal";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcSearchInput from "@/presentation/modules/shared/components/ui/webcomponents/Searchs/wcSearchInput";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { AiConversationList } from "@/presentation/modules/ai/components/AiConversationList";

interface AiConversationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: AiConversation[];
  activeConversationId: string | null;
  onSelect: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
  onNew: () => void;
  isLoading?: boolean;
  isCreating?: boolean;
}

export function AiConversationsModal({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelect,
  onDelete,
  onNew,
  isLoading,
  isCreating,
}: AiConversationsModalProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((c) => (c.title ?? "").toLowerCase().includes(term));
  }, [conversations, search]);

  return (
    <WcModal
      isOpen={isOpen}
      onClose={onClose}
      title="Conversaciones"
      maxWidth="520px"
      contentClassName="ai-conv-modal__content"
    >
      <div className="ai-conv-modal__toolbar">
        <WcSearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="Buscar conversación..."
          wrapperClassName="ai-conv-modal__search"
        />
        <WcButton
          variant="primary"
          onClick={onNew}
          disabled={isCreating}
          className="ai-conv-modal__new"
        >
          <Icon name="icon-message-plus" size={16} />
          Nuevo chat
        </WcButton>
      </div>

      <div className="ai-conv-modal__list">
        {!isLoading && filtered.length === 0 && search.trim().length > 0 ? (
          <div className="ai-conv-modal__empty">
            No se encontraron conversaciones para "{search.trim()}".
          </div>
        ) : (
          <AiConversationList
            conversations={filtered}
            activeConversationId={activeConversationId}
            onSelect={(id) => {
              onSelect(id);
              onClose();
            }}
            onDelete={onDelete}
            isLoading={isLoading}
          />
        )}
      </div>
    </WcModal>
  );
}
