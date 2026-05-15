import type { MedicalEvolution } from "@/domain/modules/evolution/models/Evolution";
import {
  AIRWAY_STATUS_LABELS,
  GENERAL_CONDITION_LABELS,
} from "@/presentation/modules/evolution/utils/evolutionLabels";
import { EvolutionPdfSection } from "../primitives/EvolutionPdfSection";

interface Section5Props {
  evolution: MedicalEvolution;
}

export function Section5EnfermedadActual({ evolution }: Section5Props) {
  const systems = evolution.systemsReview ?? [];

  if (systems.length === 0) {
    return (
      <EvolutionPdfSection
        number={5}
        title="Enfermedad Actual y Revisión por Sistemas"
      >
        <div className="em-pdf-record-empty">
          Sin entradas de revisión por sistemas.
        </div>
      </EvolutionPdfSection>
    );
  }

  return (
    <EvolutionPdfSection
      number={5}
      title="Enfermedad Actual y Revisión por Sistemas"
    >
      <div className="em-pdf-record-list">
        {systems.map((entry, index) => {
          const airwayLabel =
            AIRWAY_STATUS_LABELS[entry.airwayStatus] || entry.airwayStatus;
          const conditionLabel =
            GENERAL_CONDITION_LABELS[entry.generalCondition] ||
            entry.generalCondition;
          const description = entry.description?.trim();

          return (
            <div
              className="em-pdf-record-row em-pdf-record-row--systems"
              key={entry.id || index}
            >
              <div className="em-pdf-record-row__index">{index + 1}</div>
              <div className="em-pdf-record-row__field">
                <span className="em-pdf-record-row__label">Vía Aérea</span>
                <span className="em-pdf-record-row__value em-pdf-record-row__value--type">
                  {airwayLabel}
                </span>
              </div>
              <div className="em-pdf-record-row__field">
                <span className="em-pdf-record-row__label">Condición General</span>
                <span className="em-pdf-record-row__value em-pdf-record-row__value--type">
                  {conditionLabel}
                </span>
              </div>
              <div className="em-pdf-record-row__field">
                <span className="em-pdf-record-row__label">Descripción</span>
                <span
                  className={`em-pdf-record-row__value ${
                    description ? "" : "em-pdf-record-row__value--empty"
                  }`}
                >
                  {description || "Sin descripción registrada"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </EvolutionPdfSection>
  );
}
