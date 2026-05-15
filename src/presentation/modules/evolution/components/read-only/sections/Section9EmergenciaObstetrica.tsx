import type { MedicalEvolution } from "@/domain/modules/evolution/models/Evolution";
import {
  formatBoolean,
  formatNumeric,
  formatShortDate,
} from "@/presentation/modules/evolution/utils/evolutionLabels";
import { EvolutionPdfSection } from "../primitives/EvolutionPdfSection";
import { EvolutionPdfGrid } from "../primitives/EvolutionPdfGrid";
import { EvolutionPdfCell } from "../primitives/EvolutionPdfCell";

interface Section9Props {
  evolution: MedicalEvolution;
}

export function Section9EmergenciaObstetrica({ evolution }: Section9Props) {
  return (
    <EvolutionPdfSection number={9} title="Emergencia Obstétrica">
      <EvolutionPdfGrid>
        <EvolutionPdfCell
          label="Gestaciones"
          value={formatNumeric(evolution.gestations)}
          span={2}
          align="center"
        />
        <EvolutionPdfCell
          label="Partos"
          value={formatNumeric(evolution.parturitions)}
          span={2}
          align="center"
        />
        <EvolutionPdfCell
          label="Abortos"
          value={formatNumeric(evolution.abortions)}
          span={2}
          align="center"
        />
        <EvolutionPdfCell
          label="Cesáreas"
          value={formatNumeric(evolution.cesareans)}
          span={2}
          align="center"
        />
        <EvolutionPdfCell
          label="FUM (Última Menstruación)"
          value={formatShortDate(evolution.lastMenstruationDate)}
          span={4}
        />
        <EvolutionPdfCell
          label="Edad Gestacional (sem.)"
          value={formatNumeric(evolution.gestationalWeeks)}
          span={3}
          align="center"
        />
        <EvolutionPdfCell
          label="Movimiento Fetal"
          value={formatBoolean(evolution.fetalMovement)}
          span={3}
          align="center"
        />
        <EvolutionPdfCell
          label="F. Cardiaca Fetal (lpm)"
          value={formatNumeric(evolution.fetalHeartRate)}
          span={3}
          align="center"
        />
        <EvolutionPdfCell
          label="Altura Uterina (cm)"
          value={formatNumeric(evolution.uterineHeight, undefined, 1)}
          span={3}
          align="center"
        />
        <EvolutionPdfCell
          label="Membranas Rotas"
          value={formatBoolean(evolution.rupturedMembranes)}
          span={3}
          align="center"
        />
        <EvolutionPdfCell
          label="Tiempo de Ruptura"
          value={evolution.rupturedTime}
          span={3}
        />
        <EvolutionPdfCell
          label="Presentación"
          value={evolution.presentation}
          span={3}
        />
        <EvolutionPdfCell
          label="Dilatación (cm)"
          value={formatNumeric(evolution.dilation, undefined, 1)}
          span={3}
          align="center"
        />
        <EvolutionPdfCell
          label="Borramiento (%)"
          value={formatNumeric(evolution.effacement)}
          span={3}
          align="center"
        />
        <EvolutionPdfCell
          label="Plano"
          value={evolution.plane}
          span={3}
        />
        <EvolutionPdfCell
          label="Pelvis Útil"
          value={formatBoolean(evolution.usefulPelvis)}
          span={4}
          align="center"
        />
        <EvolutionPdfCell
          label="Sangrado Vaginal"
          value={formatBoolean(evolution.vaginalBleeding)}
          span={4}
          align="center"
        />
        <EvolutionPdfCell
          label="Contracciones"
          value={formatBoolean(evolution.contractions)}
          span={4}
          align="center"
        />
      </EvolutionPdfGrid>
    </EvolutionPdfSection>
  );
}
