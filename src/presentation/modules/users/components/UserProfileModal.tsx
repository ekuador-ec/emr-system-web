import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { useUpdateProfile } from "@/presentation/modules/users/hooks/useUpdateProfile";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { profileSchema, type ProfileFormValues } from "@/presentation/modules/users/schemas/user.schema";
import { UserUpdatePasswordTab } from "./UserUpdatePasswordModal";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import "@/presentation/modules/shared/components/ui/webcomponents/wcButton";
import "@/presentation/modules/shared/components/ui/webcomponents/wcTabs";
import "@/presentation/modules/shared/components/ui/webcomponents/wcButtonCircle";
import "@/presentation/modules/shared/components/ui/webcomponents/wcWarning";


interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const wcTabsRef = useRef<HTMLElement>(null);
  const wcWarningRef = useRef<any>(null);
  const { user } = useAuth();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
  const { addToast } = useToastStore();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isPasswordDirty, setIsPasswordDirty] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
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
      if (wcTabsRef.current && 'reset' in wcTabsRef.current) {
        (wcTabsRef.current as any).reset();
      }
      setSelectedFile(null);
      setRemoveAvatar(false);
      setIsPasswordDirty(false);
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

  const handleCancel = () => {
    const hasChanges = isDirty || selectedFile || removeAvatar;
    
    if (hasChanges) {
      wcWarningRef.current?.open(
        () => onClose(),
        () => {} // Do nothing if cancel
      );
    } else {
      onClose();
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;

    try {
      await updateProfile({
        userId: user.id,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone?.trim() || null,
        identificationNumber: data.identificationNumber?.trim() || null,
        medicalSpecialty: data.medicalSpecialty?.trim() || null,
        professionalCode: data.professionalCode?.trim() || null,
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
      const hasChanges = isDirty || selectedFile || removeAvatar || isPasswordDirty;
      
      if (hasChanges) {
        wcWarningRef.current?.open(
          () => onClose(),
          () => {}
        );
      } else {
        onClose();
      }
    }
  };

  if (!user) return null;

  return (
    <>
      <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleDialogClick}
      className="user-profile-modal"
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
      <div className="user-profile-modal-content" style={{ padding: "var(--space-6)" }}>
         <h2 style={{ marginTop: 0, marginBottom: "var(--space-4)", fontSize: "1.5rem", fontWeight: "bold" }}>Configuración de cuenta</h2>
         
         <wc-tabs ref={wcTabsRef}>
          <wc-button variant="tab" slot="tab">
            <Icon name="icon-user" size={16} />
            Perfil
          </wc-button>
          <wc-button variant="tab" slot="tab">
            <Icon name="icon-lock" size={16} />
            Contraseña
          </wc-button>

          <div slot="panel">
            <h3 style={{ marginTop: 0, marginBottom: "var(--space-2)", fontSize: "1.125rem", fontWeight: "bold" }}>Perfil de Usuario</h3>
            <p style={{ marginTop: 0, marginBottom: "var(--space-6)", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              Gestiona tu información personal y foto de perfil.
            </p>
            <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: "flex", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-surface-hover)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid var(--color-border)"
                }}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ fontSize: "2.5rem", color: "var(--color-text-secondary)", fontWeight: "600" }}>
                    {user.firstName?.charAt(0) || user.email.charAt(0)}
                  </span>
                )}
              </div>
              <div style={{ position: "absolute", bottom: "-8px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "var(--space-6)" }}>
                <wc-button-circle
                  variant="primary"
                  icon="icon-camera"
                  title="Cambiar foto"
                  disabled={isPending}
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                />
                {previewUrl && (
                  <wc-button-circle
                    variant="danger"
                    icon="icon-trash"
                    title="Eliminar foto"
                    disabled={isPending}
                    onClick={handleRemoveAvatar}
                  />
                )}
              </div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div>
                <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text)", lineHeight: 1.2, margin: 0, marginBottom: "2px" }}>
                  {user.firstName} {user.lastName}
                </p>
                
                <p style={{ fontSize: "1rem", fontWeight: 500, color: "var(--color-text-secondary)", lineHeight: 1.2, margin: 0, marginBottom: "var(--space-1)" }}>
                  {
                    user.role === 'admin' ? 'Administrador' : 
                    user.role === 'receptionist' ? 'Recepcionista' : 
                    user.role === 'lab_technician' ? 'Técnico Lab.' : 
                    user.role === 'pharmacist' ? 'Farmacéutico/a' : 
                    user.role === 'doctor' ? 'Médico': 
                    user.role === 'nurse' ? 'Enfermero/a' : ''
                  }
                </p>

                <p style={{color: "var(--color-text-secondary)", fontSize: "0.875rem", lineHeight: "1.3", margin: 0 }}>{user.email}</p>
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
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  {...register("firstName")}
                  disabled={isPending}
                  placeholder="Ej: Erick"
                  style={{ width: "100%", padding: "8px", paddingRight: errors.firstName ? "32px" : "8px", borderRadius: "6px", border: errors.firstName ? "1px solid var(--color-danger)" : "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
                />
                {errors.firstName && (
                  <span style={{ position: "absolute", right: "8px", color: "var(--color-danger)", display: "flex", alignItems: "center" }}>
                    <Icon name="icon-alert-circle" size={18} />
                  </span>
                )}
              </div>
              {errors.firstName && <span style={{ color: "var(--color-danger)", fontSize: "0.75rem" }}>{errors.firstName.message}</span>}
            </div>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-secondary)", display: "flex" }}>
                  <Icon name="icon-user" size={16} />
                </span>
                Apellido
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  {...register("lastName")}
                  placeholder="Ej: Nuñez"
                  disabled={isPending}
                  style={{ width: "100%", padding: "8px", paddingRight: errors.lastName ? "32px" : "8px", borderRadius: "6px", border: errors.lastName ? "1px solid var(--color-danger)" : "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
                />
                {errors.lastName && (
                  <span style={{ position: "absolute", right: "8px", color: "var(--color-danger)", display: "flex", alignItems: "center" }}>
                    <Icon name="icon-alert-circle" size={18} />
                  </span>
                )}
              </div>
              {errors.lastName && <span style={{ color: "var(--color-danger)", fontSize: "0.75rem" }}>{errors.lastName.message}</span>}
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
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    {...register("phone")}
                    disabled={isPending}
                    placeholder="Ej: 0998619379"
                    style={{ width: "100%", padding: "8px", paddingRight: errors.phone ? "32px" : "8px", borderRadius: "6px", border: errors.phone ? "1px solid var(--color-danger)" : "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
                  />
                  {errors.phone && (
                    <span style={{ position: "absolute", right: "8px", color: "var(--color-danger)", display: "flex", alignItems: "center" }}>
                      <Icon name="icon-alert-circle" size={18} />
                    </span>
                  )}
                </div>
                {errors.phone && <span style={{ color: "var(--color-danger)", fontSize: "0.75rem" }}>{errors.phone.message}</span>}
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--color-text-secondary)", display: "flex" }}>
                    <Icon name="icon-id-card" size={16} />
                  </span>
                  Cédula/Nro. Identificación
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    {...register("identificationNumber")}
                    disabled={isPending}
                    placeholder="Ej: 1754303699"
                    style={{ width: "100%", padding: "8px", paddingRight: errors.identificationNumber ? "32px" : "8px", borderRadius: "6px", border: errors.identificationNumber ? "1px solid var(--color-danger)" : "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
                  />
                  {errors.identificationNumber && (
                    <span style={{ position: "absolute", right: "8px", color: "var(--color-danger)", display: "flex", alignItems: "center" }}>
                      <Icon name="icon-alert-circle" size={18} />
                    </span>
                  )}
                </div>
                {errors.identificationNumber && <span style={{ color: "var(--color-danger)", fontSize: "0.75rem" }}>{errors.identificationNumber.message}</span>}
              </div>
          </div>
            
          {(user.role === "admin" || user.role === "doctor" || user.role === "nurse") && (
            <div style={{ marginTop: "var(--space-4)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--color-text-secondary)", display: "flex" }}>
                    <Icon name="icon-stethoscope" size={16} />
                  </span>
                  Especialidad
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                  {...register("medicalSpecialty")}
                  disabled={isPending}
                  placeholder="Ej: Pediatría"
                  style={{ width: "100%", padding: "8px", paddingRight: errors.medicalSpecialty ? "32px" : "8px", borderRadius: "6px", border: errors.medicalSpecialty ? "1px solid var(--color-danger)" : "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
                />
                  {errors.medicalSpecialty && (
                    <span style={{ position: "absolute", right: "8px", color: "var(--color-danger)", display: "flex", alignItems: "center" }}>
                      <Icon name="icon-alert-circle" size={18} />
                    </span>
                  )}
                </div>
                {errors.medicalSpecialty && <span style={{ color: "var(--color-danger)", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>{errors.medicalSpecialty.message}</span>}
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--color-text-secondary)", display: "flex" }}>
                    <Icon name="icon-briefcase" size={16} />
                  </span>
                  Código profesional
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    {...register("professionalCode")}
                    disabled={isPending}
                    placeholder="Ej: MSP-12345"
                    style={{ width: "100%", padding: "8px", paddingRight: errors.professionalCode ? "32px" : "8px", borderRadius: "6px", border: errors.professionalCode ? "1px solid var(--color-danger)" : "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
                  />
                  {errors.professionalCode && (
                    <span style={{ position: "absolute", right: "8px", color: "var(--color-danger)", display: "flex", alignItems: "center" }}>
                      <Icon name="icon-alert-circle" size={18} />
                    </span>
                  )}
                </div>
                {errors.professionalCode && <span style={{ color: "var(--color-danger)", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>{errors.professionalCode.message}</span>}
              </div>
            </div>
          )}

          <div style={{ marginTop: "var(--space-8)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
            <wc-button
              variant="secondary"
              disabled={isPending}
              onClick={handleCancel}
            >
              Cancelar
            </wc-button>
            <wc-button
              variant="primary"
              disabled={isPending || (!isDirty && !selectedFile && !removeAvatar)}
              onClick={handleSubmit(onSubmit)}
            >
              {isPending ? "Guardando..." : "Guardar cambios"}
            </wc-button>
          </div>
        </form>
      </div>
          <div slot="panel">
            <UserUpdatePasswordTab onClose={onClose} isOpen={isOpen} onDirtyChange={setIsPasswordDirty} />
          </div>
          
        </wc-tabs>
      </div>

      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <wc-warning
        ref={wcWarningRef}
        title="Descartar cambios"
        message="¿Estás seguro de que deseas cancelar? Perderás todos los cambios realizados."
        confirm-text="Descartar"
        cancel-text="Seguir editando"
      />

      <style>
        {`
          .user-profile-modal::backdrop {
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
          }

          /* Tablets */
          @media (max-width: 768px) {
            .user-profile-modal {
              width: 95vw;
              max-width: 95vw;
            }
            
            .user-profile-modal-content {
              padding: var(--space-5);
            }

            .user-profile-modal-content h2 {
              font-size: 1.375rem;
            }
          }

          /* Mobile */
          @media (max-width: 640px) {
            .user-profile-modal {
              width: 98vw;
              max-width: 100%;
            }

            .user-profile-modal-content {
              padding: var(--space-4);
            }

            .user-profile-modal-content h2 {
              font-size: 1.25rem;
              margin-bottom: var(--space-3);
            }

            .user-profile-modal-content h3 {
              font-size: 1rem;
            }

            /* Avatar section - stack vertically */
            .user-profile-modal-content > form > div:first-child {
              flex-direction: column;
              align-items: center;
              text-align: center;
              gap: var(--space-4);
              margin-bottom: var(--space-4);
            }

            .user-profile-modal-content > form > div:first-child > div:last-child {
              width: 100%;
            }

            /* Grid to single column */
            [style*="display: grid"][style*="grid-template-columns"] {
              grid-template-columns: 1fr !important;
              gap: var(--space-3) !important;
            }

            input, textarea {
              font-size: 16px;
              padding: 10px;
              border-radius: 6px;
            }

            label {
              font-size: 0.8rem;
            }
          }

          /* Small mobile */
          @media (max-width: 480px) {
            .user-profile-modal {
              width: 99vw;
              max-width: 100%;
            }

            .user-profile-modal-content {
              padding: var(--space-3);
            }

            .user-profile-modal-content h2 {
              font-size: 1.125rem;
              margin-bottom: var(--space-2);
            }

            .user-profile-modal-content h3 {
              font-size: 0.95rem;
              margin-bottom: var(--space-1);
            }

            p {
              font-size: 0.8rem;
              line-height: 1.4;
            }

            input, textarea {
              font-size: 16px;
              padding: 8px;
            }

            label {
              font-size: 0.75rem;
              margin-bottom: 4px;
            }

            /* Avatar smaller */
            .user-profile-modal-content > form > div:first-child > div:first-child {
              width: 80px !important;
              height: 80px !important;
              font-size: 2rem;
            }

            /* Buttons responsive */
            wc-button {
              width: 100%;
            }
          }
        `}
      </style>
      </dialog>
    </>
  );
}
