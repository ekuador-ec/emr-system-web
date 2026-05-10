import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import "@/presentation/modules/shared/components/ui/webcomponents/Warnings/wcWarning.css";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  isPending: boolean;
  onSaveAndExit: () => void;
  onExitWithoutSaving: () => void;
  onCancel: () => void;
}

export function UnsavedChangesModal({
  isOpen,
  isPending,
  onSaveAndExit,
  onExitWithoutSaving,
  onCancel,
}: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  const actionLabelStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--space-2)",
  } as const;

  return (
    <div className="wc-warning-backdrop" role="presentation" aria-modal="true">
      <div
        className="wc-warning is-warning is-md"
        role="alertdialog"
        aria-labelledby="unsaved-title"
        aria-describedby="unsaved-message"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="wc-warning__header">
          <span className="wc-warning__icon" aria-hidden="true">
            <Icon name="icon-alert-triangle" size={24} />
          </span>

          <div className="wc-warning__heading">
            <h2 id="unsaved-title" className="wc-warning__title">
              Cambios sin guardar
            </h2>
          </div>
        </header>

        <div id="unsaved-message" className="wc-warning__content">
          Tienes cambios en la evolución que no han sido guardados. ¿Qué deseas hacer?
        </div>

        <footer className="wc-warning__actions" style={{ justifyContent: "center" }}>
          <WcButton
            variant="primary"
            disabled={isPending}
            onClick={onSaveAndExit}
            className="wc-warning__button unsaved-changes-modal__button"
            style={{ flex: "0 0 auto", width: "fit-content" }}
          >
            <span style={actionLabelStyle}>
              <Icon name="icon-save" size={16} />
              {isPending ? "Guardando" : "Guardar"}
            </span>
          </WcButton>
          <WcButton
            variant="danger"
            disabled={isPending}
            onClick={onExitWithoutSaving}
            className="wc-warning__button unsaved-changes-modal__button"
            style={{ flex: "0 0 auto", width: "fit-content" }}
          >
            <span style={actionLabelStyle}>
              <Icon name="icon-trash" size={16} />
              Descartar
            </span>
          </WcButton>
          <WcButton
            variant="terciary"
            disabled={isPending}
            onClick={onCancel}
            className="wc-warning__button unsaved-changes-modal__button"
            style={{ flex: "0 0 auto", width: "fit-content" }}
          >
            <span style={actionLabelStyle}>
              <Icon name="icon-edit" size={16} />
              Seguir editando
            </span>
          </WcButton>
        </footer>
      </div>
    </div>
  );
}
