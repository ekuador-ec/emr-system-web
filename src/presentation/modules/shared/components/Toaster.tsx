import { create } from "zustand";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
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

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        zIndex: 9999,
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          style={{
            minWidth: "250px",
            padding: "12px 16px",
            borderRadius: "8px",
            backgroundColor:
              toast.type === "success"
                ? "var(--color-success, #10B981)"
                : toast.type === "error"
                ? "var(--color-error, #EF4444)"
                : toast.type === "warning"
                ? "var(--color-warning, #F59E0B)"
                : "var(--color-info, #3B82F6)",
            color: "#fff",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            animation: "slideIn 0.3s ease-out forwards",
          }}
        >
          <span>{toast.message}</span>
          <button
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              marginLeft: "10px",
              fontWeight: "bold"
            }}
          >
            ✕
          </button>
        </div>
      ))}
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
