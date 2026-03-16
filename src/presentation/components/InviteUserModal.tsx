import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToastStore } from "@/presentation/components/Toaster";
import { inviteUserSchema, type InviteUserFormValues } from "@/presentation/schemas/admin.schema";
import type { UserRole, InviteUserPayload } from "@/domain/models/User";
import { USER_ROLE_LABELS } from "@/domain/models/User";
import { Icon } from "@/presentation/components/Sidebar/icons/Icon";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (payload: InviteUserPayload) => Promise<void>;
  isInviting: boolean;
}

export function InviteUserModal({ isOpen, onClose, onInvite, isInviting }: InviteUserModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { addToast } = useToastStore();
  
  const roles: UserRole[] = ['admin', 'doctor', 'nurse', 'receptionist', 'lab_technician', 'pharmacist'];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "doctor",
    },
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && dialog && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog && dialog.open) {
      dialog.close();
      reset();
    }
  }, [isOpen, reset]);

  const handleClose = () => {
    if (isDirty) {
      const confirmClose = window.confirm("Tienes cambios sin guardar. ¿Estás seguro de que deseas cerrar el formulario?");
      if (!confirmClose) return;
    }
    onClose();
  };

  const onSubmit = async (data: InviteUserFormValues) => {
    try {
      await onInvite({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        role: data.role,
      });
      addToast({
        type: "success",
        message: "Invitación enviada exitosamente",
      });
      reset();
      onClose();
    } catch (error) {
       // La página principal (`UsersManagementPage.tsx`) pasará el prop `onInvite`.
       // Si allí ocurre un error, queremos que el toast se muestre aquí,
       // o delegar el manejo. En la pág. original se guardaba en un estado global `error`.
       // Con Zustand/useToastStore, esto notifica globalmente.
       addToast({
        type: "error",
        message: error instanceof Error ? error.message : "Error al enviar la invitación",
      });
    }
  };

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      onCancel={(e) => {
        // Intercept native Escape key logic
        e.preventDefault();
        handleClose();
      }}
      style={{
        padding: "0",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "var(--color-surface)",
        color: "var(--color-text)",
        maxWidth: "500px",
        width: "90vw",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        margin: "auto", 
      }}
    >
      <div style={{ padding: "var(--space-6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-2)" }}>
           <h2 style={{ marginTop: 0, marginBottom: 0, display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
             <span style={{ color: "var(--color-primary)", display: "flex" }}>
               <Icon name="icon-user-plus" size={24} />
             </span>
             Invitar Nuevo Usuario
           </h2>
           <button
             type="button"
             onClick={handleClose}
             style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", padding: "var(--space-1)", display: "flex" }}
             aria-label="Cerrar modal"
             disabled={isInviting}
           >
             <Icon name="icon-x" size={20} />
           </button>
        </div>
        
        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-6)" }}>
          <b>Tip:</b> El nuevo usuario recibirá un correo con un enlace temporal para configurar su contraseña y acceder al sistema.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
            <div>
              <label htmlFor="invite-firstName" style={{ display: "block", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>Nombre</label>
              <input
                id="invite-firstName"
                placeholder="Juan"
                {...register("firstName")}
                disabled={isInviting}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${errors.firstName ? 'var(--color-danger)' : 'var(--color-border)'}`, backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
              />
              {errors.firstName && <span style={{ color: "var(--color-danger)", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>{errors.firstName.message}</span>}
            </div>
            <div>
              <label htmlFor="invite-lastName" style={{ display: "block", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>Apellido</label>
              <input
                id="invite-lastName"
                placeholder="Pérez"
                {...register("lastName")}
                disabled={isInviting}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${errors.lastName ? 'var(--color-danger)' : 'var(--color-border)'}`, backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
              />
              {errors.lastName && <span style={{ color: "var(--color-danger)", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>{errors.lastName.message}</span>}
            </div>
          </div>
          
          <div style={{ marginBottom: "var(--space-4)" }}>
             <label htmlFor="invite-email" style={{ display: "block", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>Correo Electrónico</label>
             <input
               id="invite-email"
               type="email"
               placeholder="usuario@email.com"
               {...register("email")}
               disabled={isInviting}
               style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${errors.email ? 'var(--color-danger)' : 'var(--color-border)'}`, backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
             />
             {errors.email && <span style={{ color: "var(--color-danger)", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>{errors.email.message}</span>}
          </div>

          <div style={{ marginBottom: "var(--space-6)" }}>
             <label htmlFor="invite-role" style={{ display: "block", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>Rol en el Sistema</label>
             <select
               id="invite-role"
               {...register("role")}
               disabled={isInviting}
               style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${errors.role ? 'var(--color-danger)' : 'var(--color-border)'}`, backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
             >
               {roles.map((r) => (
                 <option key={r} value={r}>
                   {USER_ROLE_LABELS[r]}
                 </option>
               ))}
             </select>
             {errors.role && <span style={{ color: "var(--color-danger)", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>{errors.role.message}</span>}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isInviting}
              className="btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}
            >
              <Icon name="icon-x" size={16} />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isInviting}
              className="btn-primary"
              style={{ opacity: isInviting ? 0.7 : 1, display: "flex", alignItems: "center", gap: "var(--space-2)" }}
            >
              <Icon name="icon-user-plus" size={16} />
              {isInviting ? "Invitando..." : "Invitar Usuario"}
            </button>
          </div>
        </form>
      </div>

      <style>
        {`
          dialog::backdrop {
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
          }
        `}
      </style>
    </dialog>
  );
}
