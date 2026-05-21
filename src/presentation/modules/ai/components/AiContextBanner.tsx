import { useState } from "react";
import type { AiConversation } from "@/domain/modules/ai/models/Conversation";
import { useLatestAiSummary } from "@/presentation/modules/ai/hooks/useAiSummary";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { MarkdownRenderer } from "@/presentation/modules/ai/components/MarkdownRenderer";

interface AiContextBannerProps {
  conversation: AiConversation;
}

const KIND_LABEL: Record<string, string> = {
  medical_record: "Historia clinica",
  evolution: "Evolucion medica",
  general: "Consulta general",
};

export function AiContextBanner({ conversation }: AiContextBannerProps) {
  const isContextBound = conversation.kind !== "general" && !!conversation.entityId;
  const summaryQuery = useLatestAiSummary(
    conversation.kind === "general" ? "medical_record" : conversation.kind,
    isContextBound ? conversation.entityId : null,
  );
  const [expanded, setExpanded] = useState(false);

  if (!isContextBound) {
    return null;
  }

  const summary = summaryQuery.data ?? null;

  return (
    <div
      style={{
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-bg)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          gap: "var(--space-3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", minWidth: 0 }}>
          <Icon
            name={conversation.kind === "evolution" ? "icon-medical-evolution" : "icon-medical-record"}
            size={16}
          />
          <span
            style={{
              fontSize: "0.78rem",
              padding: "2px 8px",
              borderRadius: 999,
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
          >
            {KIND_LABEL[conversation.kind] ?? conversation.kind}
          </span>
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "var(--color-text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {conversation.title ?? "Sin titulo"}
          </span>
        </div>
        {summary && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: "0.78rem",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <Icon name="icon-card-info" size={14} />
            {expanded ? "Ocultar resumen" : "Ver resumen previo"}
          </button>
        )}
      </div>
      {expanded && summary && (
        <div
          style={{
            padding: "8px 16px 16px 16px",
            borderTop: "1px dashed var(--color-border)",
            maxHeight: "240px",
            overflowY: "auto",
            background: "var(--color-surface)",
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--color-text-secondary)",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Resumen de referencia ({new Date(summary.createdAt).toLocaleString()})
          </div>
          <MarkdownRenderer source={summary.content} />
        </div>
      )}
    </div>
  );
}
