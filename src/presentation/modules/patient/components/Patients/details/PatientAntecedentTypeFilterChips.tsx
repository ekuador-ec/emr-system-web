import type { PatientClinicalAntecedent } from "@/domain/modules/patient/models/Patient";
import type { AntecedentTypeEnum } from "@/domain/modules/catalog/models/Catalog";
import {
  ANTECEDENT_TYPE_LABELS,
  ANTECEDENT_TYPE_TONES,
} from "@/presentation/modules/patient/utils/patientFormatters";

interface PatientAntecedentTypeFilterChipsProps {
  antecedents: PatientClinicalAntecedent[];
  activeType: AntecedentTypeEnum | null;
  onChange: (type: AntecedentTypeEnum | null) => void;
}

export function PatientAntecedentTypeFilterChips({
  antecedents,
  activeType,
  onChange,
}: PatientAntecedentTypeFilterChipsProps) {
  const counts = antecedents.reduce<Record<string, number>>((acc, item) => {
    acc[item.antecedentType] = (acc[item.antecedentType] || 0) + 1;
    return acc;
  }, {});

  const types = Object.keys(counts) as AntecedentTypeEnum[];
  if (types.length === 0) return null;

  return (
    <div className="patient-detail-antecedent-filters" role="group" aria-label="Filtrar por tipo">
      <button
        type="button"
        className={`patient-detail-antecedent-chip ${activeType === null ? "patient-detail-antecedent-chip--active" : ""}`}
        onClick={() => onChange(null)}
      >
        <span>Todos</span>
        <span className="patient-detail-antecedent-chip__count">{antecedents.length}</span>
      </button>
      {types.map((type) => {
        const tone = ANTECEDENT_TYPE_TONES[type] || "neutral";
        const isActive = activeType === type;
        return (
          <button
            key={type}
            type="button"
            className={[
              "patient-detail-antecedent-chip",
              `patient-detail-antecedent-chip--tone-${tone}`,
              isActive ? "patient-detail-antecedent-chip--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(isActive ? null : type)}
            aria-pressed={isActive}
          >
            <span>{ANTECEDENT_TYPE_LABELS[type]}</span>
            <span className="patient-detail-antecedent-chip__count">{counts[type]}</span>
          </button>
        );
      })}
    </div>
  );
}
