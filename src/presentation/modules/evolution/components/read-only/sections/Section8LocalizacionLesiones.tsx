import type { MedicalEvolution } from "@/domain/modules/evolution/models/Evolution";
import { INJURY_TYPE_LABELS } from "@/presentation/modules/evolution/utils/evolutionLabels";
import { BodyDiagramReadOnly } from "@/presentation/modules/evolution/components/body-diagram/BodyDiagram";
import { EvolutionPdfSection } from "../primitives/EvolutionPdfSection";

interface Section8Props {
  evolution: MedicalEvolution;
}

export function Section8LocalizacionLesiones({ evolution }: Section8Props) {
  const injuries = evolution.injuries ?? [];

  if (injuries.length === 0) {
    return (
      <EvolutionPdfSection number={8} title="Localización de Lesiones">
        <div className="em-pdf-record-empty">
          Sin lesiones registradas.
        </div>
      </EvolutionPdfSection>
    );
  }

  const diagramMarkers = injuries
    .map((injury, index) =>
      injury.marker
        ? { marker: injury.marker, number: index + 1 }
        : null,
    )
    .filter(
      (entry): entry is { marker: NonNullable<(typeof injuries)[number]["marker"]>; number: number } =>
        entry !== null,
    );

  return (
    <EvolutionPdfSection number={8} title="Localización de Lesiones">
      <div className="em-pdf-injuries-layout">
        <div className="em-pdf-injuries-layout__diagram">
          <BodyDiagramReadOnly markers={diagramMarkers} />
        </div>
        <div className="em-pdf-injuries-layout__list">
          <div className="em-pdf-record-list em-pdf-record-list--seamless">
            {injuries.map((injury, index) => {
              const typeLabel =
                INJURY_TYPE_LABELS[injury.injuryType] || injury.injuryType;
              const description = injury.description?.trim();

              return (
                <div
                  className="em-pdf-record-row em-pdf-record-row--injuries"
                  key={injury.id || index}
                >
                  <div className="em-pdf-record-row__index">{index + 1}</div>
                  <div className="em-pdf-record-row__field">
                    <span className="em-pdf-record-row__label">Tipo</span>
                    <span className="em-pdf-record-row__value em-pdf-record-row__value--type">
                      {typeLabel}
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
        </div>
      </div>
    </EvolutionPdfSection>
  );
}
