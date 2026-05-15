import type { MedicalEvolution } from "@/domain/modules/evolution/models/Evolution";
import { EvolutionPdfSection } from "../primitives/EvolutionPdfSection";

interface Section13Props {
  evolution: MedicalEvolution;
}

export function Section13PlanTratamiento({ evolution }: Section13Props) {
  const plans = evolution.treatmentPlans ?? [];

  if (plans.length === 0) {
    return (
      <EvolutionPdfSection number={13} title="Plan de Tratamiento">
        <div className="em-pdf-record-empty">
          Sin plan de tratamiento registrado.
        </div>
      </EvolutionPdfSection>
    );
  }

  return (
    <EvolutionPdfSection number={13} title="Plan de Tratamiento">
      <div className="em-pdf-record-list">
        {plans.map((plan, index) => {
          const indication = plan.indication?.trim();
          const medication = plan.medication?.trim();
          const posology = plan.posology?.trim();

          return (
            <div
              className="em-pdf-record-row em-pdf-record-row--plans"
              key={plan.id || index}
            >
              <div className="em-pdf-record-row__index">{index + 1}</div>

              <div className="em-pdf-plan-label">Indicaciones:</div>
              <div
                className={`em-pdf-plan-value ${
                  indication ? "" : "em-pdf-plan-value--empty"
                }`}
              >
                {indication || "—"}
              </div>

              <div className="em-pdf-plan-label">Medicamento:</div>
              <div
                className={`em-pdf-plan-value ${
                  medication ? "" : "em-pdf-plan-value--empty"
                }`}
              >
                {medication || "—"}
              </div>

              <div className="em-pdf-plan-label">Posología:</div>
              <div
                className={`em-pdf-plan-value ${
                  posology ? "" : "em-pdf-plan-value--empty"
                }`}
              >
                {posology || "—"}
              </div>
            </div>
          );
        })}
      </div>
    </EvolutionPdfSection>
  );
}
