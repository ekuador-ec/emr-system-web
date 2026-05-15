import type {
  DiagnosisType,
  MedicalEvolution,
} from "@/domain/modules/evolution/models/Evolution";
import { DIAGNOSIS_CERTAINTY_LABELS } from "@/presentation/modules/evolution/utils/evolutionLabels";
import { EvolutionPdfSection } from "../primitives/EvolutionPdfSection";

interface SectionDiagnosesProps {
  evolution: MedicalEvolution;
  type: DiagnosisType;
  number: number;
  title: string;
}

export function SectionDiagnoses({
  evolution,
  type,
  number,
  title,
}: SectionDiagnosesProps) {
  const diagnoses = (evolution.diagnoses ?? []).filter((d) => d.type === type);

  if (diagnoses.length === 0) {
    return (
      <EvolutionPdfSection number={number} title={title}>
        <div className="em-pdf-record-empty">
          Sin diagnósticos de {type === "INGRESO" ? "ingreso" : "alta"} registrados.
        </div>
      </EvolutionPdfSection>
    );
  }

  return (
    <EvolutionPdfSection number={number} title={title}>
      <div className="em-pdf-record-list">
        {diagnoses.map((diagnosis, index) => {
          const certaintyLabel =
            DIAGNOSIS_CERTAINTY_LABELS[diagnosis.certainty] || diagnosis.certainty;
          const description = diagnosis.description?.trim();

          return (
            <div
              className="em-pdf-record-row em-pdf-record-row--diagnoses"
              key={diagnosis.id || index}
            >
              <div className="em-pdf-record-row__index">{index + 1}</div>
              <div className="em-pdf-record-row__field">
                <span className="em-pdf-record-row__label">CIE-10</span>
                {diagnosis.cie10Code || diagnosis.cie10Name ? (
                  <span className="em-pdf-record-row__value">
                    {diagnosis.cie10Code ? (
                      <span className="em-pdf-record-row__code">
                        {diagnosis.cie10Code}
                      </span>
                    ) : null}
                    {diagnosis.cie10Name ?? "(Patología sin nombre)"}
                  </span>
                ) : (
                  <span className="em-pdf-record-row__value em-pdf-record-row__value--empty">
                    —
                  </span>
                )}
              </div>
              <div className="em-pdf-record-row__field">
                <span className="em-pdf-record-row__label">Certeza</span>
                <span className="em-pdf-record-row__value em-pdf-record-row__value--type">
                  {certaintyLabel}
                </span>
              </div>
              <div className="em-pdf-record-row__field">
                <span className="em-pdf-record-row__label">Descripción</span>
                <span
                  className={`em-pdf-record-row__value ${
                    description ? "" : "em-pdf-record-row__value--empty"
                  }`}
                >
                  {description || "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </EvolutionPdfSection>
  );
}
