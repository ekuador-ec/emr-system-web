import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import type {
  PatientClinicalAntecedent,
} from "@/domain/modules/patient/models/Patient";
import {
  ANTECEDENT_TYPE_LABELS,
  ANTECEDENT_TYPE_TONES,
  formatShortDate,
} from "@/presentation/modules/patient/utils/patientFormatters";

interface PatientClinicalAntecedentReadCardProps {
  antecedent: PatientClinicalAntecedent;
  index: number;
}

export function PatientClinicalAntecedentReadCard({
  antecedent,
  index,
}: PatientClinicalAntecedentReadCardProps) {
  const typeLabel = ANTECEDENT_TYPE_LABELS[antecedent.antecedentType] || antecedent.antecedentType;
  const tone = ANTECEDENT_TYPE_TONES[antecedent.antecedentType] || "neutral";
  const summary = (antecedent.description?.trim() || antecedent.treatment?.trim() || "").trim();

  const classes = [
    "patient-detail-antecedent-card",
    `patient-detail-antecedent-card--tone-${tone}`,
    antecedent.isActive ? "" : "patient-detail-antecedent-card--inactive",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classes}>
      <header className="patient-detail-antecedent-card__header">
        <div className="patient-detail-antecedent-card__meta">
          <span
            className={`patient-detail-antecedent-card__badge patient-detail-antecedent-card__badge--${tone}`}
            aria-hidden="true"
          >
            <Icon name="icon-medical-history" size={14} />
          </span>
          <div className="patient-detail-antecedent-card__titles">
            <span className="patient-detail-antecedent-card__index">
              Antecedente {index + 1}
            </span>
            <span
              className={`patient-detail-antecedent-card__type patient-detail-antecedent-card__type--${tone}`}
            >
              {typeLabel}
            </span>
          </div>
        </div>
        {antecedent.diagnosisDate ? (
          <div className="patient-detail-antecedent-card__date">
            <Icon name="icon-calendar-solid" size={12} />
            <span>{formatShortDate(antecedent.diagnosisDate)}</span>
          </div>
        ) : null}
        {!antecedent.isActive ? (
          <span className="patient-detail-antecedent-card__inactive-tag">Inactivo</span>
        ) : null}
      </header>

      <div className="patient-detail-antecedent-card__body">
        {antecedent.pathology ? (
          <div className="patient-detail-antecedent-card__pathology">
            <span className="patient-detail-antecedent-card__pathology-code">
              {antecedent.pathology.code}
            </span>
            <span className="patient-detail-antecedent-card__pathology-desc">
              {antecedent.pathology.description}
            </span>
          </div>
        ) : null}

        {summary ? (
          <p className="patient-detail-antecedent-card__summary">{summary}</p>
        ) : (
          <p className="patient-detail-antecedent-card__summary patient-detail-antecedent-card__summary--empty">
            Sin descripción registrada
          </p>
        )}
      </div>
    </article>
  );
}
