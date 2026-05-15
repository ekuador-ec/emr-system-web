import type { MedicalEvolution } from "@/domain/modules/evolution/models/Evolution";
import { INJURY_TYPE_LABELS } from "@/presentation/modules/evolution/utils/evolutionLabels";
import { EvolutionPdfSection } from "../primitives/EvolutionPdfSection";
import { EvolutionPdfList } from "../primitives/EvolutionPdfList";

interface Section8Props {
  evolution: MedicalEvolution;
}

export function Section8LocalizacionLesiones({ evolution }: Section8Props) {
  const injuries = evolution.injuries ?? [];

  const items = injuries.map((injury) => (
    <div className="em-pdf-injury">
      <span className="em-pdf-injury__type">
        {INJURY_TYPE_LABELS[injury.injuryType] || injury.injuryType}
      </span>
    </div>
  ));

  return (
    <EvolutionPdfSection
      number={8}
      title="Localización de Lesiones"
      subtitle="Diagrama corporal (próximamente)"
    >
      <EvolutionPdfList
        items={items}
        emptyMessage="Sin lesiones registradas."
      />
    </EvolutionPdfSection>
  );
}
