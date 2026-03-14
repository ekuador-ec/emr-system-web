import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/presentation/hooks/useAuth";
import { useUpdateProfile } from "@/presentation/hooks/useUpdateProfile";
import { useToastStore } from "@/presentation/components/Toaster";
import { profileSchema, type ProfileFormValues } from "@/presentation/schemas/user.schema";
import { UserUpdatePasswordModal } from "./UserUpdatePasswordModal";
import { Icon } from "@/presentation/components/Sidebar/icons/Icon";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { user } = useAuth();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
  const { addToast } = useToastStore();
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      identificationNumber: "",
      medicalSpecialty: "",
      professionalCode: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || "",
        identificationNumber: user.identificationNumber || "",
        medicalSpecialty: user.medicalSpecialty || "",
        professionalCode: user.professionalCode || "",
      });
      setPreviewUrl(user.avatarUrl);
    }
  }, [user, reset]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && dialog && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog && dialog.open) {
      dialog.close();
      setSelectedFile(null);
      setRemoveAvatar(false);
      setPreviewUrl(user?.avatarUrl || null);
      if (user) {
         reset({ ...user, phone: user.phone || "", identificationNumber: user.identificationNumber || "", medicalSpecialty: user.medicalSpecialty || "", professionalCode: user.professionalCode || ""});
      }
    }
  }, [isOpen, user, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setRemoveAvatar(false);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoveAvatar(true);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;

    try {
      await updateProfile({
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        identificationNumber: data.identificationNumber || null,
        medicalSpecialty: data.medicalSpecialty || null,
        professionalCode: data.professionalCode || null,
        avatarFile: selectedFile || undefined,
        previousAvatarUrl: user.avatarUrl,
        removeAvatar,
      });

      addToast({
        type: "success",
        message: "Perfil actualizado exitosamente",
      });
      onClose();
    } catch (error) {
      addToast({
        type: "error",
        message: error instanceof Error ? error.message : "Error al actualizar el perfil",
      });
    }
  };

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  if (!user) return null;

  return (
    <>
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
        maxWidth: "500px",
        width: "90vw",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        margin: "auto"
      }}
    >
      <div style={{ padding: "var(--space-6)" }}>
         <h2 style={{ marginTop: 0, marginBottom: "var(--space-1)", fontSize: "1.5rem", fontWeight: "bold" }}>Perfil</h2>
         <p style={{
           marginTop: 0,
           marginBottom: "var(--space-6)",
           fontSize: "0.875rem",
           color: "var(--color-text-secondary)"
         }}>
           Gestiona tu información personal, foto de perfil y actualiza tu contraseña desde aquí.
         </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: "flex", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "var(--color-surface-hover)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--color-border)"
              }}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: "2rem", color: "var(--color-text-secondary)" }}>
                  {user.firstName?.charAt(0) || user.email.charAt(0)}
                </span>
              )}
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
              <div style={{ display: "flex", flexDirection: "column"}}>
                <label style={{fontSize: "0.900rem" }}>{user.role === 'admin' ? 'Administrador' : user.role === 'doctor' ? 'Médico' : 'Enfermero/a'}</label>
                <label style={{color: "var(--color-text-secondary)", fontSize: "0.700rem" }}>{user.email}</label>
              </div>

            <div style={{ display: "flex", marginTop: "var(--space-0)", gap: "var(--space-3)" }}>
              <button
                type="button" 
                className="btn-primary"
                onClick={() => document.getElementById('avatar-upload')?.click()}  
                disabled={isPending}
                style={{ borderRadius: "6px", cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1 }}
              >
                Cambiar foto
              </button>

              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }} 
                onChange={handleFileChange} 
              />

              {previewUrl && (                  
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleRemoveAvatar}
                    style={{ borderRadius: "6px" }}
                >
                    Eliminar foto
                </button>
              )}

            </div>

            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-secondary)", display: "flex" }}>
                  <Icon name="icon-user" size={16} />
                </span>
                Nombre
              </label>
              <input
                {...register("firstName")}
                disabled={isPending}
                placeholder="Ej: Erick"
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
              />
              {errors.firstName && <span style={{ color: "var(--color-error)", fontSize: "0.75rem" }}>{errors.firstName.message}</span>}
            </div>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-secondary)", display: "flex" }}>
                  <Icon name="icon-user" size={16} />
                </span>
                Apellido
              </label>
              <input
                {...register("lastName")}
                placeholder="Ej: Nuñez"
                disabled={isPending}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
              />
              {errors.lastName && <span style={{ color: "var(--color-error)", fontSize: "0.75rem" }}>{errors.lastName.message}</span>}
            </div>
          </div>

          <div style={{ marginTop: "var(--space-4)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--color-text-secondary)", display: "flex" }}>
                    <Icon name="icon-phone" size={16} />
                  </span>
                  Teléfono
                </label>
                <input
                  {...register("phone")}
                  disabled={isPending}
                  placeholder="Ej: 0998619379"
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
                />
              {errors.phone && <span style={{ color: "var(--color-error)", fontSize: "0.75rem" }}>{errors.phone.message}</span>}
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--color-text-secondary)", display: "flex" }}>
                    <Icon name="icon-id-card" size={16} />
                  </span>
                  Cédula/Nro. Identificación
                </label>
                <input
                  {...register("identificationNumber")}
                  disabled={isPending}
                  placeholder="Ej: 1754303699"
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
                />
              {errors.identificationNumber && <span style={{ color: "var(--color-error)", fontSize: "0.75rem" }}>{errors.identificationNumber.message}</span>}
            </div>
          </div>
            
          {(user.role === "admin" || user.role === "doctor" || user.role === "nurse") && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-secondary)", display: "flex" }}>
                  <Icon name="icon-stethoscope" size={16} />
                </span>
                Especialidad / Código Profesional
              </label>
                <input
                {...register("medicalSpecialty")}
                disabled={isPending}
                placeholder="Ej: Pediatría"
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
              />
            </div>
          )}

          <div style={{ marginTop: "var(--space-6)", display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isPending}
              style={{ borderRadius: "6px" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isPending || (!isDirty && !selectedFile && !removeAvatar)}
              style={{ borderRadius: "6px", cursor: (isPending || (!isDirty && !selectedFile && !removeAvatar)) ? "not-allowed" : "pointer", opacity: (isPending || (!isDirty && !selectedFile && !removeAvatar)) ? 0.8 : 1 }}
            >
              {isPending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>

        <hr style={{ margin: "var(--space-6) 0", border: "none", borderTop: "1px solid var(--color-border)" }} />
        
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div style={{ textAlign: "left" }}>
            <h3 style={{ marginTop: 0, marginBottom: "var(--space-1)", fontSize: "1.125rem" }}>Contraseña</h3>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Mantén tu cuenta segura actualizando tu contraseña regularmente.</p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              onClose();
              setIsPasswordModalOpen(true);
            }}
            style={{ borderRadius: "6px", alignSelf: "center" }}
          >
            Cambiar contraseña
          </button>
        </div>
      </div>

      <style>
        {`
          dialog::backdrop {
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
          }
          dialog .btn-secondary:hover {
            background-color: var(--color-surface-hover) !important;
            color: var(--color-text) !important;
          }
        `}
      </style>
      </dialog>

      <UserUpdatePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </>
  );
}
