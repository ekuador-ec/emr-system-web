import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { USER_ROLE_LABELS, type UserRole } from "@/domain/modules/users/models/User";

interface EvolutionAuditCellProps {
  name: string | null;
  role: UserRole | null;
  timestamp: string | null;
  fallbackName?: string;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function EvolutionAuditCell({
  name,
  role,
  timestamp,
  fallbackName = "No disponible",
}: EvolutionAuditCellProps) {
  if (!name && !timestamp) {
    return <span className="evolution-audit-cell__empty">—</span>;
  }

  const roleLabel = role ? USER_ROLE_LABELS[role] : null;
  const dateLabel = timestamp ? formatDate(timestamp) : null;
  const timeLabel = timestamp ? formatTime(timestamp) : null;

  return (
    <div className="evolution-audit-cell">
      <div className="evolution-audit-cell__row evolution-audit-cell__row--name">
        <Icon name="icon-user-solid" size={12} className="evolution-audit-cell__icon" />
        <span className="evolution-audit-cell__name">{name ?? fallbackName}</span>
      </div>
      {roleLabel ? (
        <div className="evolution-audit-cell__row evolution-audit-cell__row--role">
          <Icon name="icon-id-card-solid" size={12} className="evolution-audit-cell__icon" />
          <span className="evolution-audit-cell__role">{roleLabel}</span>
        </div>
      ) : null}
      {dateLabel ? (
        <div className="evolution-audit-cell__row">
          <Icon name="icon-calendar-solid" size={12} className="evolution-audit-cell__icon" />
          <span className="evolution-audit-cell__date">{dateLabel}</span>
          {timeLabel ? (
            <>
              <span className="evolution-audit-cell__sep" aria-hidden="true">
                ·
              </span>
              <span className="evolution-audit-cell__time">{timeLabel}</span>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
