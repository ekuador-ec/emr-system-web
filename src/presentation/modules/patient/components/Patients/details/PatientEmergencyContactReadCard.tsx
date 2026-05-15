import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import type { PatientEmergencyContact } from "@/domain/modules/patient/models/Patient";
import { KINSHIP_LABELS } from "@/presentation/modules/patient/utils/patientFormatters";

interface PatientEmergencyContactReadCardProps {
  contact: PatientEmergencyContact;
  index: number;
}

export function PatientEmergencyContactReadCard({
  contact,
  index,
}: PatientEmergencyContactReadCardProps) {
  const kinshipLabel = KINSHIP_LABELS[contact.kinship] || contact.kinship;
  const resolvedKinship =
    contact.kinship === "OTRO" && contact.kinshipOther?.trim()
      ? `${kinshipLabel} · ${contact.kinshipOther}`
      : kinshipLabel;

  return (
    <article className="patient-detail-contact-card">
      <header className="patient-detail-contact-card__header">
        <div className="patient-detail-contact-card__meta">
          <span className="patient-detail-contact-card__badge" aria-hidden="true">
            <Icon name="icon-phone" size={14} />
          </span>
          <div className="patient-detail-contact-card__titles">
            <span className="patient-detail-contact-card__index">Contacto {index + 1}</span>
            <span className="patient-detail-contact-card__name">{contact.name}</span>
          </div>
        </div>
        <span className="patient-detail-contact-card__kinship">{resolvedKinship}</span>
      </header>

      <div className="patient-detail-contact-card__body">
        <div className="patient-detail-contact-card__row">
          <Icon name="icon-phone-solid" size={12} />
          <span>{contact.phone || "Sin teléfono"}</span>
        </div>
        {contact.address?.trim() ? (
          <div className="patient-detail-contact-card__row">
            <Icon name="icon-location-solid" size={12} />
            <span>{contact.address}</span>
          </div>
        ) : null}
      </div>
    </article>
  );
}
