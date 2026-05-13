import { Icon } from "../Sidebar/icons/Icon";
import WcButton from "../ui/webcomponents/Buttons/wcButton";
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "warning" | "danger" | "info" | "primary";
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  type = "primary",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      color: "var(--color-danger, #EF4444)",
      glowBg: "var(--color-danger-light, rgba(254, 226, 226, 0.4))",
      icon: "icon-alert-triangle",
    },
    warning: {
      color: "var(--color-warning, #F59E0B)",
      glowBg: "var(--color-warning-light, rgba(254, 243, 199, 0.4))",
      icon: "icon-alert-circle",
    },
    info: {
      color: "var(--color-info, #3B82F6)",
      glowBg: "var(--color-info-light, rgba(219, 234, 254, 0.4))",
      icon: "icon-info",
    },
    primary: {
      color: "var(--color-primary, #000034)",
      glowBg: "var(--color-primary-light, rgba(219, 234, 254, 0.4))",
      icon: "icon-info",
    },
  };

  const config = typeConfig[type] || typeConfig.primary;

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog-content">
        <div
          className="confirm-dialog-body"
          style={{
            background: `radial-gradient(ellipse at top center, ${config.glowBg} 0%, transparent 70%)`,
          }}
        >
          <div className="confirm-dialog-icon-wrapper" style={{ backgroundColor: config.color }}>
            <Icon name={config.icon} size={24} />
          </div>

          <h3 className="confirm-dialog-title">{title}</h3>

          <p className="confirm-dialog-message">{message}</p>
        </div>

        <div className="confirm-dialog-actions">
          <WcButton variant="terciary" onClick={onCancel}>
            {cancelText}
          </WcButton>
          <WcButton variant={type === "danger" ? "danger" : "primary"} onClick={onConfirm}>
            {confirmText}
          </WcButton>
        </div>
      </div>
    </div>
  );
}
