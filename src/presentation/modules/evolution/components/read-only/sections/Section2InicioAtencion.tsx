import type { MedicalEvolution } from "@/domain/modules/evolution/models/Evolution";
import {
  CLINICAL_CAUSE_LABELS,
  formatShortDate,
  formatShortTime,
} from "@/presentation/modules/evolution/utils/evolutionLabels";
import { EvolutionPdfSection } from "../primitives/EvolutionPdfSection";
import { EvolutionPdfGrid } from "../primitives/EvolutionPdfGrid";
import { EvolutionPdfCell } from "../primitives/EvolutionPdfCell";
import { EvolutionPdfCheckbox } from "../primitives/EvolutionPdfCheckbox";

interface Section2Props {
  evolution: MedicalEvolution;
}

export function Section2InicioAtencion({ evolution }: Section2Props) {
  return (
    <EvolutionPdfSection number={2} title="Inicio de Atención y Motivo">
      <EvolutionPdfGrid>
        <EvolutionPdfCell
          label="Fecha de Atención"
          value={formatShortDate(evolution.attentionDate)}
          span={3}
          emphasis="strong"
        />
        <EvolutionPdfCell
          label="Hora de Atención"
          value={formatShortTime(evolution.attentionTime)}
          span={2}
          emphasis="strong"
          align="center"
        />
        <EvolutionPdfCell
          label="Causa de Atención"
          value={
            evolution.clinicalCause
              ? CLINICAL_CAUSE_LABELS[evolution.clinicalCause]
              : null
          }
          span={4}
        />
        <EvolutionPdfCell
          label="¿Notificar a la Policía?"
          value={
            <EvolutionPdfCheckbox
              label={evolution.notifyPolice ? "Sí" : "No"}
              checked={evolution.notifyPolice}
              inline
            />
          }
          span={3}
        />
        <EvolutionPdfCell
          label="Motivo de la Atención / Descripción"
          value={evolution.clinicalCauseDescription}
          span={12}
          multiline
        />
      </EvolutionPdfGrid>
    </EvolutionPdfSection>
  );
}
