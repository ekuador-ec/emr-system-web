import { Icon } from "../Sidebar/icons/Icon";
import WcButton from "../ui/webcomponents/Buttons/wcButton";

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

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        backgroundColor: "var(--color-surface, #ffffff)",
        borderRadius: "var(--radius-lg, 8px)",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        width: "100%",
        maxWidth: "400px",
        overflow: "hidden",
        border: "1px solid var(--color-border)",
        animation: "dialogIn 0.2s ease-out forwards",
      }}>
        <div style={{
          padding: "var(--space-6) var(--space-6) var(--space-4)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: `var(--color-${type}-light)`,
            color: `var(--color-${type})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "var(--space-4)",
          }}>
            <Icon 
              name={type === "danger" ? "icon-alert-triangle" : type === "warning" ? "icon-alert-circle" : "icon-info"} 
              size={24} 
            />
          </div>
          
          <h3 style={{ 
            margin: "0 0 var(--space-2) 0", 
            fontSize: "1.125rem", 
            color: "var(--color-text)",
            fontWeight: 600 
          }}>
            {title}
          </h3>
          
          <p style={{ 
            margin: 0, 
            color: "var(--color-text-secondary)", 
            fontSize: "0.875rem",
            lineHeight: 1.5 
          }}>
            {message}
          </p>
        </div>

        <div style={{
          padding: "var(--space-4) var(--space-6)",
          backgroundColor: "var(--color-bg)",
          display: "flex",
          justifyContent: "flex-end",
          gap: "var(--space-3)",
          borderTop: "1px solid var(--color-border)",
        }}>
          <WcButton variant="terciary" onClick={onCancel}>
            {cancelText}
          </WcButton>
          <WcButton variant={type === "danger" ? "danger" : "primary"} onClick={onConfirm}>
            {confirmText}
          </WcButton>
        </div>
      </div>
      <style>
        {`
          @keyframes dialogIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
