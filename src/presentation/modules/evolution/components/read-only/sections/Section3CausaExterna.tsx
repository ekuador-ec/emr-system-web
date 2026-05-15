import type { MedicalEvolution } from "@/domain/modules/evolution/models/Evolution";
import {
  ACCIDENT_TYPE_LABELS,
  formatLongDateTime,
  INTOXICATION_TYPE_LABELS,
  VIOLENCE_TYPE_LABELS,
} from "@/presentation/modules/evolution/utils/evolutionLabels";
import { EvolutionPdfSection } from "../primitives/EvolutionPdfSection";
import { EvolutionPdfGrid } from "../primitives/EvolutionPdfGrid";
import { EvolutionPdfCell } from "../primitives/EvolutionPdfCell";
import { EvolutionPdfCheckbox } from "../primitives/EvolutionPdfCheckbox";

interface Section3Props {
  evolution: MedicalEvolution;
}

export function Section3CausaExterna({ evolution }: Section3Props) {
  return (
    <EvolutionPdfSection
      number={3}
      title="Accidente, Violencia, Intoxicación, Envenenamiento o Quemadura"
    >
      <EvolutionPdfGrid>
        <EvolutionPdfCell
          label="Fecha y Hora del Evento"
          value={formatLongDateTime(evolution.eventDateTime)}
          span={5}
        />
        <EvolutionPdfCell
          label="Lugar del Evento"
          value={evolution.eventLocation}
          span={4}
        />
        <EvolutionPdfCell
          label="Custodia Policial Requerida"
          value={
            <EvolutionPdfCheckbox
              label={evolution.requiresPoliceCustody ? "Sí" : "No"}
              checked={evolution.requiresPoliceCustody}
              inline
            />
          }
          span={3}
        />
        <EvolutionPdfCell
          label="Dirección del Evento"
          value={evolution.eventAddress}
          span={12}
        />
        <EvolutionPdfCell
          label="Tipo de Accidente"
          value={
            evolution.accidentType
              ? ACCIDENT_TYPE_LABELS[evolution.accidentType]
              : null
          }
          span={4}
        />
        <EvolutionPdfCell
          label="Tipo de Violencia"
          value={
            evolution.violenceType
              ? VIOLENCE_TYPE_LABELS[evolution.violenceType]
              : null
          }
          span={4}
        />
        <EvolutionPdfCell
          label="Tipo de Intoxicación"
          value={
            evolution.intoxicationType
              ? INTOXICATION_TYPE_LABELS[evolution.intoxicationType]
              : null
          }
          span={4}
        />
        <EvolutionPdfCell
          label="Aliento Alcohólico"
          value={
            <EvolutionPdfCheckbox
              label={evolution.alcoholicBreath ? "Sí" : "No"}
              checked={evolution.alcoholicBreath}
              inline
            />
          }
          span={4}
        />
        <EvolutionPdfCell
          label="Alcocheck (g/L)"
          value={
            evolution.alcocheckValue !== null
              ? evolution.alcocheckValue.toString()
              : null
          }
          span={4}
          align="center"
          emphasis="strong"
        />
        <EvolutionPdfCell label="" value="" span={4} />
        <EvolutionPdfCell
          label="Observaciones del Evento"
          value={evolution.eventObservations}
          span={12}
          multiline
        />
      </EvolutionPdfGrid>
    </EvolutionPdfSection>
  );
}
