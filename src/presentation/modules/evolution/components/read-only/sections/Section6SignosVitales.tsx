import type { MedicalEvolution } from "@/domain/modules/evolution/models/Evolution";
import {
  formatBloodPressure,
  formatNumeric,
  formatPupilReaction,
} from "@/presentation/modules/evolution/utils/evolutionLabels";
import { EvolutionPdfSection } from "../primitives/EvolutionPdfSection";
import { EvolutionPdfGrid } from "../primitives/EvolutionPdfGrid";
import { EvolutionPdfCell } from "../primitives/EvolutionPdfCell";

interface Section6Props {
  evolution: MedicalEvolution;
}

interface MiniCellProps {
  label: string;
  value: string;
  emphasis?: boolean;
}

function MiniCell({ label, value, emphasis }: MiniCellProps) {
  const isEmpty = !value;
  return (
    <div
      className={`em-pdf-mini-cell ${
        emphasis ? "em-pdf-mini-cell--total" : ""
      } ${isEmpty ? "em-pdf-mini-cell--empty" : ""}`}
    >
      <span className="em-pdf-mini-cell__label">{label}</span>
      <span className="em-pdf-mini-cell__value">{value || "—"}</span>
    </div>
  );
}

interface CompoundCellProps {
  label: string;
  span: number;
  children: React.ReactNode;
}

function CompoundCell({ label, span, children }: CompoundCellProps) {
  return (
    <div
      className="em-pdf-cell em-pdf-cell--compound"
      style={{ gridColumn: `span ${span}` }}
    >
      <span className="em-pdf-cell__label">{label}</span>
      <div className="em-pdf-compound-row">{children}</div>
    </div>
  );
}

export function Section6SignosVitales({ evolution }: Section6Props) {
  const bpRight = formatBloodPressure(evolution.bpRight);
  const bpLeft = formatBloodPressure(evolution.bpLeft);
  const heartRate = formatNumeric(evolution.heartRate);
  const respiratoryRate = formatNumeric(evolution.respiratoryRate);
  const temperature = formatNumeric(evolution.temperature, undefined, 1);
  const weight = formatNumeric(evolution.weight, undefined, 2);
  const height = formatNumeric(evolution.height, undefined, 2);
  const bmi = formatNumeric(evolution.bmi, undefined, 2);
  const oxygenSaturation = formatNumeric(evolution.oxygenSaturation);
  const capillary = formatNumeric(evolution.capillaryRefillTime, undefined, 1);
  const glasgowO = formatNumeric(evolution.glasgowOcular);
  const glasgowV = formatNumeric(evolution.glasgowVerbal);
  const glasgowM = formatNumeric(evolution.glasgowMotor);
  const glasgowTotal = formatNumeric(evolution.glasgowTotal);
  const pupilRight = formatPupilReaction(evolution.rightPupilReaction);
  const pupilLeft = formatPupilReaction(evolution.leftPupilReaction);

  return (
    <EvolutionPdfSection
      number={6}
      title="Signos Vitales, Mediciones y Valores"
    >
      <EvolutionPdfGrid>
        <CompoundCell label="Presión Arterial (mmHg)" span={3}>
          <MiniCell label="Der." value={bpRight} />
          <MiniCell label="Izq." value={bpLeft} />
        </CompoundCell>
        <EvolutionPdfCell
          label="FC (lpm)"
          value={heartRate}
          span={1}
          align="center"
          emphasis="strong"
        />
        <EvolutionPdfCell
          label="FR (rpm)"
          value={respiratoryRate}
          span={1}
          align="center"
          emphasis="strong"
        />
        <EvolutionPdfCell
          label="Tª (°C)"
          value={temperature}
          span={1}
          align="center"
          emphasis="strong"
        />
        <EvolutionPdfCell
          label="Peso (kg)"
          value={weight}
          span={1}
          align="center"
        />
        <EvolutionPdfCell
          label="Estatura (m)"
          value={height}
          span={1}
          align="center"
        />
        <EvolutionPdfCell
          label="IMC (kg/m²)"
          value={bmi}
          span={1}
          align="center"
          emphasis="strong"
        />
        <EvolutionPdfCell
          label="Sat. O₂ (%)"
          value={oxygenSaturation}
          span={1}
          align="center"
        />
        <EvolutionPdfCell
          label="Llenado Capilar (s)"
          value={capillary}
          span={2}
          align="center"
        />
      </EvolutionPdfGrid>

      <EvolutionPdfGrid>
        <CompoundCell label="Glasgow" span={6}>
          <MiniCell label="O" value={glasgowO} />
          <MiniCell label="V" value={glasgowV} />
          <MiniCell label="M" value={glasgowM} />
          <MiniCell label="Total" value={glasgowTotal} emphasis />
        </CompoundCell>
        <EvolutionPdfCell
          label="Pupila Derecha"
          value={pupilRight}
          span={3}
          align="center"
        />
        <EvolutionPdfCell
          label="Pupila Izquierda"
          value={pupilLeft}
          span={3}
          align="center"
        />
      </EvolutionPdfGrid>
    </EvolutionPdfSection>
  );
}
