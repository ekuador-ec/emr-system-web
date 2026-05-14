import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcWarning from "@/presentation/modules/shared/components/ui/webcomponents/Warnings/wcWarning";
import "@/presentation/modules/patient/components/Patients/PatientClinicalAntecedentCard.css";

interface PatientClinicalAntecedentCardProps {
  label: string;
  onRemove: () => void;
  autoCollapsed?: boolean;
  forceExpanded?: boolean;
  children: ReactNode;
}

export function PatientClinicalAntecedentCard({
  label,
  onRemove,
  autoCollapsed = false,
  forceExpanded = false,
  children,
}: PatientClinicalAntecedentCardProps) {
  const [isExpanded, setIsExpanded] = useState(!autoCollapsed);
  const [isDeleteWarningOpen, setIsDeleteWarningOpen] = useState(false);

  useEffect(() => {
    if (!forceExpanded) {
      setIsExpanded(!autoCollapsed);
    }
  }, [autoCollapsed, forceExpanded]);

  useEffect(() => {
    if (forceExpanded) {
      setIsExpanded(true);
    }
  }, [forceExpanded]);

  return (
    <article className="patient-clinical-antecedent-card">
      <header className="patient-clinical-antecedent-card__header">
        <div className="patient-clinical-antecedent-card__meta">
          <span className="patient-clinical-antecedent-card__badge">
            <Icon name="icon-medical-history" size={14} />
          </span>
          <div className="patient-clinical-antecedent-card__titles">
            <span className="patient-clinical-antecedent-card__title">{label}</span>
            <span className="patient-clinical-antecedent-card__subtitle">Detalle clínico</span>
          </div>
        </div>
        <div className="patient-clinical-antecedent-card__actions">
          <WcButton
            type="button"
            variant="primary"
            className="patient-clinical-antecedent-card__toggle"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Ocultar antecedente" : "Mostrar antecedente"}
            title={isExpanded ? "Ocultar antecedente" : "Mostrar antecedente"}
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
            className="patient-clinical-antecedent-card__remove"
            icon="icon-trash"
            onClick={() => setIsDeleteWarningOpen(true)}
            aria-label={`Eliminar ${label.toLowerCase()}`}
            title={`Eliminar ${label.toLowerCase()}`}
          />
        </div>
      </header>
      {isExpanded && (
        <div className="patient-clinical-antecedent-card__body">
          {children}
        </div>
      )}
      <WcWarning
        isOpen={isDeleteWarningOpen}
        onOpenChange={setIsDeleteWarningOpen}
        type="destructive"
        title="Eliminar antecedente"
        message="Esta acción eliminará el antecedente clínico del formulario."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={onRemove}
      />
    </article>
  );
}
