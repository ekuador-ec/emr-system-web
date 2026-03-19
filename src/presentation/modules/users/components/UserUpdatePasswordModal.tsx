import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdatePassword } from "@/presentation/modules/auth/hooks/useUpdatePassword";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { updatePasswordSchema, type UpdatePasswordFormData } from "@/presentation/modules/auth/schemas/auth.schema";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import "@/presentation/modules/shared/components/ui/webcomponents/wcButton";
import "@/presentation/modules/shared/components/ui/webcomponents/wcWarning";

interface UserUpdatePasswordTabProps {
  onClose: () => void;
  isOpen?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function UserUpdatePasswordTab({ onClose, isOpen, onDirtyChange }: UserUpdatePasswordTabProps) {
  const { mutateAsync: updatePassword, isPending } = useUpdatePassword();
  const { addToast } = useToastStore();
  const wcWarningRef = useRef<any>(null);
  
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors, isDirty } } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" }
  });

  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");

  useEffect(() => {
    if (isOpen === false) {
      reset();
      setShowPassword(false);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const onSubmit = async (data: UpdatePasswordFormData) => {
    try {
      await updatePassword(data.password.trim());
      addToast({ type: "success", message: "Contraseña actualizada exitosamente" });
    } catch (error) {
      addToast({ type: "error", message: error instanceof Error ? error.message : "Error al actualizar contraseña" });
    } finally {
      onClose();
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      wcWarningRef.current?.open(
        () => onClose(),
        () => {} // Do nothing if cancel
      );
    } else {
      onClose();
    }
  };

  return (
      <div>
        <div style={{ marginBottom: "var(--space-6)" }}>
          <h3 style={{ marginTop: 0, marginBottom: "var(--space-1)", fontSize: "1.25rem", fontWeight: "600" }}>Seguridad</h3>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
            Actualiza tu contraseña para mantener tu cuenta segura.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)", fontSize: "0.875rem", fontWeight: 500 }}>
                <span style={{ color: "var(--color-text-secondary)", display: "flex" }}>
                  <Icon name="icon-lock" size={18} />
                </span>
                Nueva Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  {...register("password")}
                  disabled={isPending}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    paddingRight: "40px",
                    borderRadius: "6px",
                    border: errors.password ? "1px solid var(--color-danger)" : "1px solid var(--color-border)",
                    backgroundColor: passwordValue ? "var(--color-surface-hover)" : "var(--color-surface)",
                    color: "var(--color-text)",
                    fontSize: "0.875rem",
                    transition: "all 0.2s ease"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                  tabIndex={-1}
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <Icon name={showPassword ? 'icon-eye-off' : 'icon-eye'} size={20} />
                </button>
              </div>
              {errors.password && <span style={{ color: "var(--color-danger)", fontSize: "0.75rem", display: "block", marginTop: "6px", fontWeight: 500 }}>{errors.password.message}</span>}
            </div>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)", fontSize: "0.875rem", fontWeight: 500 }}>
                <span style={{ color: "var(--color-text-secondary)", display: "flex" }}>
                  <Icon name="icon-lock" size={18} />
                </span>
                Confirmar Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Repite la contraseña"
                  {...register("confirmPassword")}
                  disabled={isPending}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    paddingRight: "40px",
                    borderRadius: "6px",
                    border: errors.confirmPassword ? "1px solid var(--color-danger)" : "1px solid var(--color-border)",
                    backgroundColor: confirmPasswordValue ? "var(--color-surface-hover)" : "var(--color-surface)",
                    color: "var(--color-text)",
                    fontSize: "0.875rem",
                    transition: "all 0.2s ease"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                  tabIndex={-1}
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <Icon name={showPassword ? 'icon-eye-off' : 'icon-eye'} size={20} />
                </button>
              </div>
              {errors.confirmPassword && <span style={{ color: "var(--color-danger)", fontSize: "0.75rem", display: "block", marginTop: "6px", fontWeight: 500 }}>{errors.confirmPassword.message}</span>}
            </div>
          </div>
          
          <div style={{ marginTop: "var(--space-8)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
            <wc-button variant="secondary" onClick={handleCancel} disabled={isPending}>Cancelar</wc-button>
            <wc-button variant="primary" disabled={isPending} onClick={handleSubmit(onSubmit)}>
              {isPending ? "Actualizando..." : "Actualizar Contraseña"}
            </wc-button>
          </div>
        </form>

        <wc-warning
          ref={wcWarningRef}
          title="Descartar cambios"
          message="¿Estás seguro de que deseas cancelar? Perderás todos los cambios realizados."
          confirm-text="Descartar"
          cancel-text="Seguir editando"
        />
      </div>
  );
}