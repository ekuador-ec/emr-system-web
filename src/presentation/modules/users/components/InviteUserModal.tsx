import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import {
  inviteUserSchema,
  type InviteUserFormValues,
} from "@/presentation/modules/users/schemas/admin.schema";
import type {
  InviteUserPayload,
  UserRole,
} from "@/domain/modules/users/models/User";
import { USER_ROLE_LABELS } from "@/domain/modules/users/models/User";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { WcTabsFolder } from "@/presentation/modules/shared/components/ui/webcomponents/Tabs/wcTabsFolder";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import "@/presentation/modules/shared/components/ui/webcomponents/wcWarning";
import "@/presentation/modules/users/components/InviteUserModal.css";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (payload: InviteUserPayload) => Promise<void>;
  isInviting: boolean;
}

interface WcWarningElement extends HTMLElement {
  open: (onConfirm: () => void, onCancel: () => void) => void;
}

const ROLES: UserRole[] = [
  "admin",
  "doctor",
  "nurse",
  "receptionist",
  "lab_technician",
  "pharmacist",
];

export function InviteUserModal({
  isOpen,
  onClose,
  onInvite,
  isInviting,
}: InviteUserModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const wcWarningRef = useRef<WcWarningElement | null>(null);
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserSchema),
    mode: "onChange",
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
      wcWarningRef.current?.open(
        () => onClose(),
        () => {},
      );
      return;
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
        message: "Invitacion enviada exitosamente",
      });
      reset();
      onClose();
    } catch (error) {
      addToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Error al enviar la invitacion",
      });
    }
  };

  const handleDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      handleClose();
    }
  };

  const inviteFormTab = (
    <div className="invite-user-modal__tab-content">
      <div className="invite-user-modal__grid">
        <div className="invite-user-modal__field">
          <label htmlFor="invite-firstName" className="invite-user-modal__label">
            <span className="invite-user-modal__label-icon">
              <Icon name="icon-user" size={16} />
            </span>
            Nombre
          </label>
          <div className="invite-user-modal__input-wrapper">
            <input
              id="invite-firstName"
              placeholder="Juan"
              autoComplete="given-name"
              spellCheck={false}
              className={`invite-user-modal__input${errors.firstName ? " is-error" : ""}`}
              {...register("firstName")}
              disabled={isInviting}
            />
            {errors.firstName ? (
              <span className="invite-user-modal__error-icon">
                <Icon name="icon-alert-circle" size={18} />
              </span>
            ) : null}
          </div>
          {errors.firstName ? (
            <span className="invite-user-modal__error-text">
              {errors.firstName.message}
            </span>
          ) : null}
        </div>

        <div className="invite-user-modal__field">
          <label htmlFor="invite-lastName" className="invite-user-modal__label">
            <span className="invite-user-modal__label-icon">
              <Icon name="icon-user" size={16} />
            </span>
            Apellido
          </label>
          <div className="invite-user-modal__input-wrapper">
            <input
              id="invite-lastName"
              placeholder="Perez"
              autoComplete="family-name"
              spellCheck={false}
              className={`invite-user-modal__input${errors.lastName ? " is-error" : ""}`}
              {...register("lastName")}
              disabled={isInviting}
            />
            {errors.lastName ? (
              <span className="invite-user-modal__error-icon">
                <Icon name="icon-alert-circle" size={18} />
              </span>
            ) : null}
          </div>
          {errors.lastName ? (
            <span className="invite-user-modal__error-text">
              {errors.lastName.message}
            </span>
          ) : null}
        </div>
      </div>

      <div className="invite-user-modal__field invite-user-modal__field--full">
        <label htmlFor="invite-email" className="invite-user-modal__label">
          <span className="invite-user-modal__label-icon">
            <Icon name="icon-mail" size={16} />
          </span>
          Correo electronico
        </label>
        <div className="invite-user-modal__input-wrapper">
          <input
            id="invite-email"
            type="email"
            placeholder="usuario@organizacion.com"
            autoComplete="email"
            spellCheck={false}
            className={`invite-user-modal__input${errors.email ? " is-error" : ""}`}
            {...register("email")}
            disabled={isInviting}
          />
          {errors.email ? (
            <span className="invite-user-modal__error-icon">
              <Icon name="icon-alert-circle" size={18} />
            </span>
          ) : null}
        </div>
        {errors.email ? (
          <span className="invite-user-modal__error-text">{errors.email.message}</span>
        ) : null}
      </div>
      <div className="invite-user-modal__field invite-user-modal__field--full">
        <label htmlFor="invite-role" className="invite-user-modal__label">
          <span className="invite-user-modal__label-icon">
            <Icon name="icon-briefcase" size={16} />
          </span>
          Rol en el sistema
        </label>
        <div className="invite-user-modal__input-wrapper">
          <select
            id="invite-role"
            autoComplete="off"
            className={`invite-user-modal__input${errors.role ? " is-error" : ""}`}
            {...register("role")}
            disabled={isInviting}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {USER_ROLE_LABELS[role]}
              </option>
            ))}
          </select>
          {errors.role ? (
            <span className="invite-user-modal__error-icon">
              <Icon name="icon-alert-circle" size={18} />
            </span>
          ) : null}
        </div>
        {errors.role ? (
          <span className="invite-user-modal__error-text">{errors.role.message}</span>
        ) : null}
      </div>

      <div className="invite-user-modal__notice">
        <Icon name="icon-info-circle" size={16} />
        <p>
          Se enviara un correo para activar la cuenta.
        </p>
      </div>

      <div className="invite-user-modal__form-actions">
        <WcButton
          type="button"
          variant="secondary"
          className="invite-user-modal__action invite-user-modal__action--cancel"
          disabled={isInviting}
          onClick={handleClose}
        >
          Cancelar
        </WcButton>
        <WcButton
          type="submit"
          variant="primary"
          className="invite-user-modal__action invite-user-modal__action--submit"
          disabled={isInviting}
        >
          {isInviting ? "Invitando..." : "Enviar invitacion"}
        </WcButton>
      </div>
    </div>
  );

  return (
    <dialog
      ref={dialogRef}
      className="invite-user-modal"
      onClick={handleDialogClick}
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
    >
      <form
        className="invite-user-modal__container"
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
        noValidate
      >
        <header className="invite-user-modal__header">
          <div className="invite-user-modal__heading">
            <h2 className="invite-user-modal__title">Invitar Usuario</h2>
            <p className="invite-user-modal__description">
              Registre los datos basicos y asigne el rol de acceso.
            </p>
          </div>
        </header>

        <WcTabsFolder
          tabs={[
            {
              name: "Invitacion",
              icon: <Icon name="icon-user" size={16} />,
              content: inviteFormTab,
            },
          ]}
        />
      </form>

      <wc-warning
        ref={wcWarningRef}
        title="Descartar cambios"
        message="¿Estas seguro de que deseas cancelar? Perderas todos los cambios realizados."
        confirm-text="Descartar"
        cancel-text="Seguir editando"
      />
    </dialog>
  );
}
