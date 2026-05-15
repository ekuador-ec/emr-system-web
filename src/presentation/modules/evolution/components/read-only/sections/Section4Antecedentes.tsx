import type { Patient } from "@/domain/modules/patient/models/Patient";
import {
  ANTECEDENT_TYPE_LABELS,
  formatShortDate,
} from "@/presentation/modules/patient/utils/patientFormatters";
import { EvolutionPdfSection } from "../primitives/EvolutionPdfSection";

interface Section4Props {
  patient: Patient;
}

export function Section4Antecedentes({ patient }: Section4Props) {
  const antecedents = (patient.clinicalAntecedents ?? []).filter((a) => a.isActive);

  if (antecedents.length === 0) {
    return (
      <EvolutionPdfSection number={4} title="Antecedentes Personales y Familiares">
        <div className="em-pdf-record-empty">
          Sin antecedentes registrados para el paciente.
        </div>
      </EvolutionPdfSection>
    );
  }

  return (
    <EvolutionPdfSection number={4} title="Antecedentes Personales y Familiares">
      <div className="em-pdf-record-list">
        {antecedents.map((antecedent, index) => {
          const typeLabel =
            ANTECEDENT_TYPE_LABELS[antecedent.antecedentType] ||
            antecedent.antecedentType;
          const diagnosisDate = antecedent.diagnosisDate
            ? formatShortDate(antecedent.diagnosisDate)
            : null;
          const description = antecedent.description?.trim() || "—";
          const treatment = antecedent.treatment?.trim();
          const hasTreatment = Boolean(treatment) && treatment !== description;

          return (
            <div
              className="em-pdf-record-row em-pdf-record-row--with-cie"
              key={antecedent.id || index}
            >
              <div className="em-pdf-record-row__index">{index + 1}</div>
              <div className="em-pdf-record-row__field">
                <span className="em-pdf-record-row__label">Tipo</span>
                <span className="em-pdf-record-row__value em-pdf-record-row__value--type">
                  {typeLabel}
                </span>
                {diagnosisDate ? (
                  <span className="em-pdf-record-row__hint">{diagnosisDate}</span>
                ) : null}
              </div>
              <div className="em-pdf-record-row__field">
                <span className="em-pdf-record-row__label">CIE-10</span>
                {antecedent.pathology ? (
                  <span className="em-pdf-record-row__value">
                    <span className="em-pdf-record-row__code">
                      {antecedent.pathology.code}
                    </span>
                    {antecedent.pathology.description}
                  </span>
                ) : (
                  <span className="em-pdf-record-row__value em-pdf-record-row__value--empty">
                    —
                  </span>
                )}
              </div>
              <div className="em-pdf-record-row__field">
                <span className="em-pdf-record-row__label">Descripción</span>
                <span className="em-pdf-record-row__value">{description}</span>
              </div>
              {hasTreatment ? (
                <div className="em-pdf-record-row__addendum">
                  <span className="em-pdf-record-row__addendum-label">
                    Tratamiento
                  </span>
                  <span className="em-pdf-record-row__addendum-value">
                    {treatment}
                  </span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </EvolutionPdfSection>
  );
}
