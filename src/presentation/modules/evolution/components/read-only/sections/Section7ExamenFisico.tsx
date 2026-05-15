import type { MedicalEvolution } from "@/domain/modules/evolution/models/Evolution";
import { PHYSICAL_EXAM_REGION_LABELS } from "@/presentation/modules/evolution/utils/evolutionLabels";
import { EvolutionPdfSection } from "../primitives/EvolutionPdfSection";
import { EvolutionPdfList } from "../primitives/EvolutionPdfList";

interface Section7Props {
  evolution: MedicalEvolution;
}

export function Section7ExamenFisico({ evolution }: Section7Props) {
  const exams = evolution.physicalExams ?? [];

  const items = exams.map((exam) => (
    <div className="em-pdf-exam">
      <div className="em-pdf-exam__head">
        <span className="em-pdf-exam__region">
          {PHYSICAL_EXAM_REGION_LABELS[exam.region] || exam.region}
        </span>
        <span
          className={`em-pdf-exam__flag ${
            exam.hasPathology
              ? "em-pdf-exam__flag--pathology"
              : "em-pdf-exam__flag--normal"
          }`}
        >
          {exam.hasPathology ? "Patológico" : "Sin hallazgos"}
        </span>
      </div>
      {exam.description?.trim() ? (
        <p className="em-pdf-exam__description">{exam.description}</p>
      ) : null}
    </div>
  ));

  return (
    <EvolutionPdfSection number={7} title="Examen Físico y Diagnóstico">
      <EvolutionPdfList
        items={items}
        emptyMessage="Sin examen físico registrado."
      />
    </EvolutionPdfSection>
  );
}
