import { useState, type ReactNode } from "react";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcWarning from "@/presentation/modules/shared/components/ui/webcomponents/Warnings/wcWarning";
import "@/presentation/modules/patient/components/Patients/PatientEmergencyContactCard.css";

interface PatientEmergencyContactCardProps {
  label: string;
  onRemove: () => void;
  children: ReactNode;
}

export function PatientEmergencyContactCard({
  label,
  onRemove,
  children,
}: PatientEmergencyContactCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDeleteWarningOpen, setIsDeleteWarningOpen] = useState(false);

  return (
    <article className="patient-emergency-contact-card">
      <header className="patient-emergency-contact-card__header">
        <div className="patient-emergency-contact-card__meta">
          <span className="patient-emergency-contact-card__badge" aria-hidden="true">
            <Icon name="icon-phone" size={14} />
          </span>
          <div className="patient-emergency-contact-card__titles">
            <span className="patient-emergency-contact-card__title">{label}</span>
            <span className="patient-emergency-contact-card__subtitle">Contacto de emergencia</span>
          </div>
        </div>
        <div className="patient-emergency-contact-card__actions">
          <WcButton
            type="button"
            variant="primary"
            className="patient-emergency-contact-card__toggle"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Ocultar contacto" : "Mostrar contacto"}
            title={isExpanded ? "Ocultar contacto" : "Mostrar contacto"}
          >
            <Icon
              name={isExpanded ? "icon-eye-off" : "icon-eye"}
              size={14}
              aria-hidden="true"
            />
            {isExpanded ? "Ocultar" : "Ver"}
          </WcButton>
          <WcButtonIcon
            variant="danger"
            shape="square"
            size="sm"
            className="patient-emergency-contact-card__remove"
            icon="icon-trash"
            onClick={() => setIsDeleteWarningOpen(true)}
            aria-label={`Eliminar ${label.toLowerCase()}`}
            title={`Eliminar ${label.toLowerCase()}`}
          />
        </div>
      </header>
      {isExpanded && <div className="patient-emergency-contact-card__body">{children}</div>}
      <WcWarning
        isOpen={isDeleteWarningOpen}
        onOpenChange={setIsDeleteWarningOpen}
        type="destructive"
        title="Eliminar contacto"
        message="Esta acción eliminará el contacto de emergencia del formulario."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={onRemove}
      />
    </article>
  );
}
