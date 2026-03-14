import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdatePassword } from "@/presentation/hooks/useUpdatePassword";
import { useToastStore } from "@/presentation/components/Toaster";
import { updatePasswordSchema, type UpdatePasswordFormData } from "@/presentation/schemas/auth.schema";
import { Icon } from "@/presentation/components/Sidebar/icons/Icon";

interface UserUpdatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserUpdatePasswordModal({ isOpen, onClose }: UserUpdatePasswordModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { mutateAsync: updatePassword, isPending } = useUpdatePassword();
  const { addToast } = useToastStore();
  
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" }
  });

  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && dialog && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog) {
      if (dialog.open) {
        dialog.close();
      }
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: UpdatePasswordFormData) => {
    try {
      await updatePassword(data.password);
      addToast({ type: "success", message: "Contraseña actualizada exitosamente" });
    } catch (error) {
      addToast({ type: "error", message: error instanceof Error ? error.message : "Error al actualizar contraseña" });
    } finally {
      onClose();
    }
  };

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleDialogClick}
      style={{
        padding: "0",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "var(--color-surface)",
        color: "var(--color-text)",
        maxWidth: "400px",
        width: "90vw",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        margin: "auto"
      }}
    >
      <div style={{ padding: "var(--space-6)" }}>
        <h2 style={{ marginTop: 0, marginBottom: "var(--space-2)", fontSize: "1.25rem", fontWeight: "bold" }}>Actualizar Contraseña</h2>
        <p style={{ marginTop: 0, marginBottom: "var(--space-6)", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          Ingresa y confirma tu nueva contraseña.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-secondary)", display: "flex" }}>
                  <Icon name="icon-lock" size={16} />
                </span>
                Nueva Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" {...register("password")} disabled={isPending} style={{ width: "100%", padding: "8px", paddingRight: "36px", borderRadius: "6px", border: "1px solid var(--color-border)", backgroundColor: passwordValue ? "var(--color-surface-hover)" : "var(--color-surface)", color: "var(--color-text)" }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                  tabIndex={-1}
                >
                  <Icon name={showPassword ? 'icon-eye-off' : 'icon-eye'} size={20} />
                </button>
              </div>
              {errors.password && <span style={{ color: "var(--color-error)", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>{errors.password.message}</span>}
            </div>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-secondary)", display: "flex" }}>
                  <Icon name="icon-lock" size={16} />
                </span>
                Confirmar Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} placeholder="Repite la contraseña" {...register("confirmPassword")} disabled={isPending} style={{ width: "100%", padding: "8px", paddingRight: "36px", borderRadius: "6px", border: "1px solid var(--color-border)", backgroundColor: confirmPasswordValue ? "var(--color-surface-hover)" : "var(--color-surface)", color: "var(--color-text)" }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                  tabIndex={-1}
                >
                  <Icon name={showPassword ? 'icon-eye-off' : 'icon-eye'} size={20} />
                </button>
              </div>
              {errors.confirmPassword && <span style={{ color: "var(--color-error)", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>{errors.confirmPassword.message}</span>}
            </div>
          </div>
          <div style={{ marginTop: "var(--space-6)", display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isPending} style={{ borderRadius: "6px" }}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isPending} style={{ borderRadius: "6px", cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1 }}>{isPending ? "Actualizando..." : "Actualizar"}</button>
          </div>
        </form>
      </div>
    </dialog>
  );
}