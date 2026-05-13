import { create } from "zustand";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import "./Toaster.css";

type ToastPlacement = "top-right" | "bottom-right";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
  placement?: ToastPlacement;
}

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));

    if (toast.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, toast.duration || 3000);
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

function ToastItem({
  toast,
  removeToast,
}: {
  toast: ToastMessage;
  removeToast: (id: string) => void;
}) {
  const duration = toast.duration !== undefined ? toast.duration : 3000;

  const typeConfig = {
    success: {
      color: "var(--color-success, #10B981)",
      lightBg: "calc(var(--color-success-light, #d1fae5))",
      glowBg: "var(--color-success-light, rgba(209, 250, 229, 0.4))",
      icon: "icon-check-solid",
      title: "Éxito",
    },
    error: {
      color: "var(--color-danger, #EF4444)",
      lightBg: "calc(var(--color-danger-light, #fee2e2))",
      glowBg: "var(--color-danger-light, rgba(254, 226, 226, 0.4))",
      icon: "icon-warning-solid",
      title: "Error",
    },
    warning: {
      color: "var(--color-warning, #F59E0B)",
      lightBg: "calc(var(--color-warning-light, #fef3c7))",
      glowBg: "var(--color-warning-light, rgba(254, 243, 199, 0.4))",
      icon: "icon-alert-triangle",
      title: "Advertencia",
    },
    info: {
      color: "var(--color-primary, #3B82F6)",
      lightBg: "calc(var(--color-primary-light, #dbeafe))",
      glowBg: "var(--color-primary-light, rgba(219, 234, 254, 0.4))",
      icon: "icon-info-circle",
      title: "Información",
    },
  };

  const config = typeConfig[toast.type];

  return (
    <div className="toast-item">
      <div
        className="toast-item-content"
        style={{
          background: `linear-gradient(90deg, ${config.glowBg} -40%, transparent 40%)`, // soft glassmorphism gradient
        }}
      >
        <div className="toast-icon-wrapper" style={{ backgroundColor: config.color }}>
          <Icon name={config.icon} size={18} />
        </div>

        <div className="toast-text-wrapper">
          <h4 className="toast-title">{config.title}</h4>
          <p className="toast-message">{toast.message}</p>
        </div>

        <button
          onClick={() => removeToast(toast.id)}
          className="toast-close-btn"
          aria-label="Cerrar notificación"
        >
          <Icon name="icon-x" size={16} />
        </button>
      </div>

      {duration > 0 && (
        <div
          className="toast-progress-bar"
          style={{
            backgroundColor: config.color,
            animation: `progressShrink ${duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  const topToasts = toasts.filter((toast) => toast.placement === "top-right");
  const bottomToasts = toasts.filter((toast) => toast.placement !== "top-right");

  const renderToastStack = (stackToasts: ToastMessage[], position: ToastPlacement) => {
    if (stackToasts.length === 0) {
      return null;
    }

    const positionClass =
      position === "top-right" ? "toaster-container--top-right" : "toaster-container--bottom-right";

    return (
      <div className={`toaster-container ${positionClass}`}>
        {stackToasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
        ))}
      </div>
    );
  };

  return (
    <>
      {renderToastStack(topToasts, "top-right")}
      {renderToastStack(bottomToasts, "bottom-right")}
    </>
  );
}
