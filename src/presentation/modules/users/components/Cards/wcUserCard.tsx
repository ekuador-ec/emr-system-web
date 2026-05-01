import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import WcTag from "@/presentation/modules/shared/components/ui/webcomponents/Tags/wcTag";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import "@/presentation/modules/users/components/Cards/wcUserCard.css";

export type WcUserCardProps = {
  fullName: string;
  email: string;
  roleLabel: string;
  statusLabel: string;
  statusTone: WcUserCardStatusTone;
  phone: string;
  whatsappUrl?: string | null;
  lastSeen: string;
  avatarUrl?: string;
  canManage: boolean;
  isDeleted?: boolean;
  isTogglingStatus?: boolean;
  isRestoring?: boolean;
  statusActionLabel: string;
  statusActionIcon: string;
  onToggleStatus: () => void;
  onDelete: () => void;
  onRestore?: () => void;
};

export type WcUserCardStatusTone =
  | "active"
  | "inactive"
  | "suspended"
  | "deleted"
  | "neutral";

function getAvatarFallback(fullName: string): string {
  return fullName.trim().charAt(0).toUpperCase() || "U";
}

function getStatusVariant(
  statusTone: WcUserCardStatusTone,
): "success" | "accent" | "warning" | "danger" | "neutral" | "info" {
  if (statusTone === "active") {
    return "success";
  }

  if (statusTone === "suspended") {
    return "warning";
  }

  if (statusTone === "deleted") {
    return "danger";
  }

  if (statusTone === "neutral") {
    return "info";
  }

  return "neutral";
}

function WcUserCard(props: WcUserCardProps) {
  const fallback = getAvatarFallback(props.fullName);
  const statusTone = props.statusTone;
  const phoneValue = props.phone === "--" ? "No registrado" : props.phone;
  const lastSeenValue = props.lastSeen === "--" ? "Sin registro" : props.lastSeen;
  const hasWhatsAppLink =
    typeof props.whatsappUrl === "string" &&
    props.whatsappUrl.length > 0 &&
    props.phone !== "--";

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
        <WcTag variant="accent" size="sm" className="wc-user-card__tag">
          {props.roleLabel}
        </WcTag>
        <WcTag
          variant={getStatusVariant(statusTone)}
          size="sm"
          className="wc-user-card__tag"
        >
          {props.statusLabel}
        </WcTag>
      </div>

      <div className="wc-user-card__info">
        <div className="wc-user-card__info-item">
          <span className="wc-user-card__info-label">Telefono</span>
          <span className="wc-user-card__info-value">
            {hasWhatsAppLink ? (
              <span className="wc-user-card__phone">
                <span>{phoneValue}</span>
                <a
                  href={props.whatsappUrl ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wc-user-card__phone-whatsapp-link"
                  title={`Abrir chat de WhatsApp para ${phoneValue}`}
                  aria-label={`Abrir chat de WhatsApp para ${phoneValue}`}
                >
                  <Icon name="icon-clip" size={10} />
                </a>
              </span>
            ) : (
              phoneValue
            )}
          </span>
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
            {props.isDeleted && props.onRestore ? (
              <WcButtonIcon
                variant="primary"
                shape="square"
                size="sm"
                className="wc-user-card__action wc-user-card__action--status"
                icon="icon-user-plus-solid"
                title="Restaurar usuario"
                aria-label="Restaurar usuario"
                disabled={props.isRestoring}
                onClick={props.onRestore}
              />
            ) : (
              <>
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
                  className="wc-user-card__action wc-user-card__action--inactivate"
                  icon="icon-trash"
                  title="Inactivar usuario"
                  aria-label="Inactivar usuario"
                  onClick={props.onDelete}
                />
              </>
            )}
          </div>
        ) : (
          <span className="wc-user-card__empty-actions">Sin acciones</span>
        )}
      </footer>
    </article>
  );
}

export default WcUserCard;
