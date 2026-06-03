import { useMemo, useState } from "react";
import type { AiConversation } from "@/domain/modules/ai/models/Conversation";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";

interface AiConversationListProps {
  conversations: AiConversation[];
  activeConversationId: string | null;
  onSelect: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
  isLoading?: boolean;
}

interface ConversationGroup {
  key: string;
  label: string;
  items: AiConversation[];
}

function kindIcon(kind: AiConversation["kind"]): string {
  if (kind === "medical_record") return "icon-medical-record";
  if (kind === "evolution") return "icon-medical-evolution";
  return "icon-ia-chat";
}

function kindLabel(kind: AiConversation["kind"]): string {
  if (kind === "medical_record") return "Historia clinica";
  if (kind === "evolution") return "Evolucion";
  return "Consulta general";
}

function groupConversations(items: AiConversation[]): ConversationGroup[] {
  const groups: Record<string, AiConversation[]> = {
    general: [],
    medical_record: [],
    evolution: [],
  };
  for (const c of items) {
    const bucket = groups[c.kind];
    if (bucket) bucket.push(c);
  }
  const result: ConversationGroup[] = [];
  if (groups["general"]?.length) {
    result.push({ key: "general", label: "Consultas generales", items: groups["general"] });
  }
  if (groups["medical_record"]?.length) {
    result.push({ key: "medical_record", label: "Historias clinicas", items: groups["medical_record"] });
  }
  if (groups["evolution"]?.length) {
    result.push({ key: "evolution", label: "Evoluciones", items: groups["evolution"] });
  }
  return result;
}

function formatRelative(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString();
}

export function AiConversationList({
  conversations,
  activeConversationId,
  onSelect,
  onDelete,
  isLoading,
}: AiConversationListProps) {
  const groups = useMemo(() => groupConversations(conversations), [conversations]);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading) {
    return (
      <div style={{ padding: "var(--space-4)", color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
        Cargando conversaciones...
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div
        style={{
          padding: "var(--space-4)",
          color: "var(--color-text-secondary)",
          fontSize: "0.85rem",
          textAlign: "center",
        }}
      >
        Sin conversaciones aun. Inicia una con el boton de arriba.
      </div>
    );
  }

  return (
    <div className="ai-conversation-list">
      {groups.map((group) => {
        const isCollapsed = collapsedGroups[group.key] ?? false;
        return (
        <div key={group.key} className="ai-conversation-list__group">
          <button
            type="button"
            className="ai-conversation-list__group-toggle"
            aria-expanded={!isCollapsed}
            onClick={() => toggleGroup(group.key)}
          >
            <span className="ai-conversation-list__group-caret">
              <Icon name="icon-chevron-down" size={14} />
            </span>
            <span className="ai-conversation-list__group-label">{group.label}</span>
            <span className="ai-conversation-list__group-count">{group.items.length}</span>
          </button>
          {!isCollapsed && (
          <ul className="ai-conversation-list__items">
            {group.items.map((c) => {
              const isActive = c.id === activeConversationId;
              return (
                <li key={c.id}>
                  <div
                    className={`ai-conversation-list__item ${isActive ? "ai-conversation-list__item--active" : ""}`}
                    onClick={() => onSelect(c.id)}
                  >
                    <div className="ai-conversation-list__item-icon">
                      <Icon name={kindIcon(c.kind)} size={16} />
                    </div>
                    <div className="ai-conversation-list__item-content">
                      <div className="ai-conversation-list__item-title">
                        {c.title ?? kindLabel(c.kind)}
                      </div>
                      <div className="ai-conversation-list__item-meta">
                        <span>{formatRelative(c.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="ai-conversation-list__item-delete">
                      <WcButtonIcon
                        icon="icon-trash"
                        title="Eliminar conversacion"
                        size="sm"
                        variant="ghost"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onDelete(c.id);
                        }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          )}
        </div>
        );
      })}
    </div>
  );
}

