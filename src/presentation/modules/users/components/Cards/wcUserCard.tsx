import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import "@/presentation/modules/users/components/Cards/wcUserCard.css";

export type WcUserCardProps = {
  fullName: string;
  email: string;
  roleLabel: string;
  statusLabel: string;
  phone: string;
  lastSeen: string;
  avatarUrl?: string;
  canManage: boolean;
  isTogglingStatus?: boolean;
  statusActionLabel: string;
  statusActionIcon: string;
  onToggleStatus: () => void;
  onDelete: () => void;
};

type StatusTone = "active" | "inactive" | "suspended" | "deleted" | "neutral";

function getAvatarFallback(fullName: string): string {
  return fullName.trim().charAt(0).toUpperCase() || "U";
}

function getStatusTone(statusLabel: string): StatusTone {
  const normalized = statusLabel.trim().toLowerCase();

  if (normalized === "activo") return "active";
  if (normalized === "inactivo") return "inactive";
  if (normalized === "suspendido") return "suspended";
  if (normalized === "eliminado") return "deleted";

  return "neutral";
}

function WcUserCard(props: WcUserCardProps) {
  const fallback = getAvatarFallback(props.fullName);
  const statusTone = getStatusTone(props.statusLabel);
  const phoneValue = props.phone === "--" ? "No registrado" : props.phone;
  const lastSeenValue = props.lastSeen === "--" ? "Sin registro" : props.lastSeen;

  return (
    <article className={`wc-user-card wc-user-card--${statusTone}`}>
      <header className="wc-user-card__identity">
        <div className="wc-user-card__avatar-wrap">
          {props.avatarUrl ? (
            <img
              src={props.avatarUrl}
              alt={props.fullName}
              className="wc-user-card__avatar"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="wc-user-card__avatar wc-user-card__avatar--fallback">
              {fallback}
            </div>
          )}
        </div>
        <div className="wc-user-card__identity-text">
          <p className="wc-user-card__name">{props.fullName}</p>
          <p className="wc-user-card__email">{props.email}</p>
        </div>
      </header>

      <div className="wc-user-card__chips">
        <span className="wc-user-card__chip wc-user-card__chip--role">{props.roleLabel}</span>
        <span className={`wc-user-card__chip wc-user-card__chip--status wc-user-card__chip--${statusTone}`}>
          {props.statusLabel}
        </span>
      </div>

      <div className="wc-user-card__info">
        <div className="wc-user-card__info-item">
          <span className="wc-user-card__info-label">Telefono</span>
          <span className="wc-user-card__info-value">{phoneValue}</span>
        </div>
        <div className="wc-user-card__info-item">
          <span className="wc-user-card__info-label">Ultima conexion</span>
          <span className="wc-user-card__info-value">{lastSeenValue}</span>
        </div>
      </div>

      <footer className="wc-user-card__actions">
        <span className="wc-user-card__actions-label">Acciones</span>
        {props.canManage ? (
          <div className="wc-user-card__actions-group">
            <WcButtonIcon
              variant="primary"
              shape="square"
              size="sm"
              className="wc-user-card__action wc-user-card__action--status"
              icon={props.statusActionIcon}
              title={props.statusActionLabel}
              aria-label={props.statusActionLabel}
              disabled={props.isTogglingStatus}
              onClick={props.onToggleStatus}
            />
            <WcButtonIcon
              variant="danger"
              shape="square"
              size="sm"
              className="wc-user-card__action wc-user-card__action--delete"
              icon="icon-trash"
              title="Eliminar usuario"
              aria-label="Eliminar usuario"
              onClick={props.onDelete}
            />
          </div>
        ) : (
          <span className="wc-user-card__empty-actions">Sin acciones</span>
        )}
      </footer>
    </article>
  );
}

export default WcUserCard;
