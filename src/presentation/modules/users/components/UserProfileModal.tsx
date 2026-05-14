import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { useUpdateProfile } from "@/presentation/modules/users/hooks/useUpdateProfile";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { profileSchema, type ProfileFormValues } from "@/presentation/modules/users/schemas/user.schema";
import { UserUpdatePasswordTab } from "./UserUpdatePasswordModal";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import { WcTabsFolder } from "@/presentation/modules/shared/components/ui/webcomponents/Tabs/wcTabsFolder";
import WcWarning from "@/presentation/modules/shared/components/ui/webcomponents/Warnings/wcWarning";
import type { WcWarningHandle } from "@/presentation/modules/shared/components/ui/webcomponents/Warnings/wcWarning";
import { ImageCropperModal } from "@/presentation/modules/shared/components/ui/ImageCropperModal";


interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const wcWarningRef = useRef<WcWarningHandle | null>(null);
  const { user } = useAuth();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
  const { addToast } = useToastStore();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isPasswordDirty, setIsPasswordDirty] = useState(false);
  const [tabsKey, setTabsKey] = useState(0);
  
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);

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
      setTabsKey((previous) => previous + 1);
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
      setRawImageSrc(URL.createObjectURL(file));
      setCropperOpen(true);
      // Reset input value to allow selecting the same file again if canceled
      e.target.value = "";
    }
  };

  const handleCropSave = (croppedFile: File, previewUrl: string) => {
    setSelectedFile(croppedFile);
    setPreviewUrl(previewUrl);
    setRemoveAvatar(false);
    setCropperOpen(false);
    setRawImageSrc(null);
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
        () => {},
        () => onClose(),
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
      e.preventDefault();
      const hasChanges = isDirty || selectedFile || removeAvatar || isPasswordDirty;
      
      if (hasChanges) {
        wcWarningRef.current?.open(
          () => {},
          () => onClose(),
        );
      } else {
        onClose();
      }
    }
  };

  if (!user) return null;

  const profileTabContent = (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: "var(--space-1)", fontSize: "1.05rem", fontWeight: "bold" }}>Perfil de Usuario</h3>
      <p style={{ marginTop: 0, marginBottom: "var(--space-4)", fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
        Gestiona tu información personal y foto de perfil.
      </p>
      <form className="user-profile-form" onSubmit={handleSubmit(onSubmit)}>
        <div
          style={{
            display: "flex",
            gap: "var(--space-4)",
            marginBottom: "var(--space-4)",
            paddingBottom: "var(--space-2)",
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: "84px",
                height: "84px",
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
                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isPending ? 0.5 : 1 }}
                />
              ) : (
                <span style={{ fontSize: "2rem", color: "var(--color-text-secondary)", fontWeight: "600" }}>
                  {user.firstName?.charAt(0) || user.email.charAt(0)}
                </span>
              )}
              {isPending && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <Icon name="icon-loader" size={24} className="spin-animation" style={{ color: "var(--color-primary)" }} />
                </div>
              )}
            </div>
            <div style={{ position: "absolute", bottom: "-6px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "var(--space-3)" }}>
              <WcButtonIcon
                variant="primary"
                shape="circle"
                icon="icon-camera"
                title="Cambiar foto"
                disabled={isPending}
                onClick={() => document.getElementById("avatar-upload")?.click()}
              />
              {previewUrl && (
                <WcButtonIcon
                  variant="danger"
                  shape="circle"
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
              <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text)", lineHeight: 1.2, margin: 0, marginBottom: "2px" }}>
                {user.firstName} {user.lastName}
              </p>

              <p style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--color-text-secondary)", lineHeight: 1.2, margin: 0, marginBottom: "var(--space-1)" }}>
                {
                  user.role === "admin" ? "Administrador" :
                  user.role === "receptionist" ? "Recepcionista" :
                  user.role === "lab_technician" ? "Técnico Lab." :
                  user.role === "pharmacist" ? "Farmacéutico/a" :
                  user.role === "doctor" ? "Médico" :
                  user.role === "nurse" ? "Enfermero/a" : ""
                }
              </p>

              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.8125rem", lineHeight: "1.3", margin: 0 }}>{user.email}</p>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
          <div>
            <label className="form-label">
              <span className="form-label-icon">
                <Icon name="icon-user" size={16} />
              </span>
              Nombre
            </label>
            <div className="input-wrapper">
              <input
                {...register("firstName")}
                disabled={isPending}
                placeholder="Ej: Erick"
                spellCheck={false}
                className={`input-field ${errors.firstName ? "error" : ""}`}
              />
              {errors.firstName && (
                <span className="input-error-icon">
                  <Icon name="icon-alert-circle" size={16} />
                </span>
              )}
            </div>
            {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
          </div>
          <div>
            <label className="form-label">
              <span className="form-label-icon">
                <Icon name="icon-user" size={16} />
              </span>
              Apellido
            </label>
            <div className="input-wrapper">
              <input
                {...register("lastName")}
                placeholder="Ej: Nuñez"
                disabled={isPending}
                spellCheck={false}
                className={`input-field ${errors.lastName ? "error" : ""}`}
              />
              {errors.lastName && (
                <span className="input-error-icon">
                  <Icon name="icon-alert-circle" size={16} />
                </span>
              )}
            </div>
            {errors.lastName && <span className="form-error">{errors.lastName.message}</span>}
          </div>
        </div>

        <div style={{ marginTop: "var(--space-4)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
          <div>
            <label className="form-label">
              <span className="form-label-icon">
                <Icon name="icon-phone" size={16} />
              </span>
              Teléfono
            </label>
            <div className="input-wrapper">
              <input
                {...register("phone")}
                disabled={isPending}
                placeholder="Ej: 0998619379"
                spellCheck={false}
                className={`input-field ${errors.phone ? "error" : ""}`}
              />
              {errors.phone && (
                <span className="input-error-icon">
                  <Icon name="icon-alert-circle" size={16} />
                </span>
              )}
            </div>
            {errors.phone && <span className="form-error">{errors.phone.message}</span>}
          </div>
          <div>
            <label className="form-label">
              <span className="form-label-icon">
                <Icon name="icon-id-card" size={16} />
              </span>
              Cédula/Nro. Identificación
            </label>
            <div className="input-wrapper">
              <input
                {...register("identificationNumber")}
                disabled={isPending}
                placeholder="Ej: 1754303699"
                spellCheck={false}
                className={`input-field ${errors.identificationNumber ? "error" : ""}`}
              />
              {errors.identificationNumber && (
                <span className="input-error-icon">
                  <Icon name="icon-alert-circle" size={16} />
                </span>
              )}
            </div>
            {errors.identificationNumber && (
              <span className="form-error">{errors.identificationNumber.message}</span>
            )}
          </div>
        </div>

        {(user.role === "admin" || user.role === "doctor" || user.role === "nurse") && (
          <div style={{ marginTop: "var(--space-4)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <label className="form-label">
                <span className="form-label-icon">
                  <Icon name="icon-stethoscope" size={16} />
                </span>
                Especialidad
              </label>
              <div className="input-wrapper">
                <input
                  {...register("medicalSpecialty")}
                  disabled={isPending}
                  placeholder="Ej: Pediatría"
                  spellCheck={false}
                  className={`input-field ${errors.medicalSpecialty ? "error" : ""}`}
                />
                {errors.medicalSpecialty && (
                  <span className="input-error-icon">
                    <Icon name="icon-alert-circle" size={16} />
                  </span>
                )}
              </div>
              {errors.medicalSpecialty && (
                <span className="form-error">{errors.medicalSpecialty.message}</span>
              )}
            </div>

            <div>
              <label className="form-label">
                <span className="form-label-icon">
                  <Icon name="icon-briefcase" size={16} />
                </span>
                Código profesional
              </label>
              <div className="input-wrapper">
                <input
                  {...register("professionalCode")}
                  disabled={isPending}
                  placeholder="Ej: MSP-12345"
                  spellCheck={false}
                  className={`input-field ${errors.professionalCode ? "error" : ""}`}
                />
                {errors.professionalCode && (
                  <span className="input-error-icon">
                    <Icon name="icon-alert-circle" size={16} />
                  </span>
                )}
              </div>
              {errors.professionalCode && (
                <span className="form-error">{errors.professionalCode.message}</span>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: "var(--space-8)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
          <WcButton
            variant="secondary"
            disabled={isPending}
            onClick={handleCancel}
          >
            Cancelar
          </WcButton>
          <WcButton
            variant="primary"
            disabled={isPending || (!isDirty && !selectedFile && !removeAvatar)}
            onClick={handleSubmit(onSubmit)}
          >
            {isPending ? "Guardando..." : "Guardar cambios"}
          </WcButton>
        </div>
      </form>
    </div>
  );

  const tabs = [
    {
      name: "Perfil",
      icon: (
        <span style={{ display: "inline-flex" }}>
          <Icon name="icon-user" size={16} />
        </span>
      ),
      content: profileTabContent,
    },
    {
      name: "Contraseña",
      icon: (
        <span style={{ display: "inline-flex" }}>
          <Icon name="icon-lock" size={16} />
        </span>
      ),
      content: <UserUpdatePasswordTab onClose={onClose} isOpen={isOpen} onDirtyChange={setIsPasswordDirty} />,
    },
  ];

  return (
    <>
      <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      onCancel={(event) => {
        event.preventDefault();
        handleCancel();
      }}
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
        margin: "2vh auto",
        overflow: "hidden"
      }}
    >
      <div className="user-profile-modal-content" style={{ padding: "var(--space-6)", overflow: "visible" }}>
         <h2 style={{ marginTop: 0, marginBottom: "var(--space-4)", fontSize: "1.5rem", fontWeight: "bold" }}>Configuración de cuenta</h2>
         
         <WcTabsFolder key={tabsKey} tabs={tabs} />
      </div>

      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={rawImageSrc}
        onClose={() => {
          setCropperOpen(false);
          setRawImageSrc(null);
        }}
        onCropSave={handleCropSave}
      />

      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <WcWarning
        ref={wcWarningRef}
        type="warning"
        className="is-discard-warning"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 1.67c.955 0 1.845 .467 2.39 1.247l.105 .16l8.114 13.548a2.914 2.914 0 0 1 -2.307 4.363l-.195 .008h-16.225a2.914 2.914 0 0 1 -2.582 -4.2l.099 -.185l8.11 -13.538a2.914 2.914 0 0 1 2.491 -1.403zm.01 13.33l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -7a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z" />
          </svg>
        }
        title="Descartar cambios"
        message="¿Estás seguro de que deseas cancelar? Perderás todos los cambios realizados."
        confirmText="Seguir editando"
        cancelText="Cancelar"
      />

      <style>
        {`
          .user-profile-modal::backdrop {
            background-color: color-mix(in srgb, var(--color-text) 40%, transparent);
            backdrop-filter: blur(4px);
          }

          .user-profile-modal .form-label {
            display: flex;
            align-items: center;
            gap: var(--space-2);
            margin-bottom: var(--space-1);
            font-size: 0.875rem;
          }

          .user-profile-modal .form-label-icon {
            color: var(--color-text-secondary);
            display: flex;
          }

          .user-profile-form .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            border-radius: var(--radius-sm);
          }

          .user-profile-form .input-field {
            width: 100%;
            border-radius: 6px;
            border: 1px solid var(--color-border);
            background-color: var(--color-surface);
            color: var(--color-text);
            -webkit-text-fill-color: var(--color-text);
            caret-color: var(--color-text);
            padding: 8px;
            font-size: var(--font-size-base);
            transition:
              border-color var(--transition-fast),
              box-shadow var(--transition-fast);
          }

          .user-profile-form .input-field::placeholder {
            color: var(--color-text-secondary);
          }

          .user-profile-form .input-field:focus,
          .user-profile-form .input-field:focus-visible {
            outline: none;
            border-color: var(--color-primary-light);
            box-shadow: 0 0 0 3px var(--color-primary-light);
          }

          .user-profile-form .input-field.error {
            border-color: var(--color-danger);
            padding-right: 32px;
          }

          .user-profile-form .input-field.error:focus,
          .user-profile-form .input-field.error:focus-visible {
            border-color: var(--color-danger);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-danger) 20%, transparent);
          }

          .user-profile-form .input-error-icon {
            position: absolute;
            right: 8px;
            color: var(--color-danger);
            display: inline-flex;
            align-items: center;
            pointer-events: none;
          }

          .user-profile-form .form-error {
            color: var(--color-danger);
            font-size: 0.75rem;
            display: block;
            margin-top: 4px;
          }

          @media (max-height: 860px) {
            .user-profile-modal {
              margin: 8px auto;
            }

            .user-profile-modal-content {
              padding: var(--space-4);
            }

            .user-profile-modal-content h2 {
              font-size: 1.25rem;
              margin-bottom: var(--space-3);
            }

            .user-profile-modal-content form > div:first-child {
              gap: var(--space-3) !important;
              margin-bottom: var(--space-3) !important;
            }

            .user-profile-modal-content form > div:first-child > div:first-child > div:first-child {
              width: 76px !important;
              height: 76px !important;
            }

            .user-profile-modal-content form > div:first-child > div:last-child p:first-child {
              font-size: 1rem !important;
            }

            .user-profile-modal-content form > div:first-child > div:last-child p:nth-child(2) {
              font-size: 0.875rem !important;
            }

            .user-profile-modal-content form > div:first-child > div:last-child p:nth-child(3) {
              font-size: 0.75rem !important;
            }
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

          @keyframes spin {
             from { transform: rotate(0deg); }
             to { transform: rotate(360deg); }
          }
          .spin-animation {
             animation: spin 1s linear infinite;
          }
        `}
      </style>
      </dialog>
    </>
  );
}
