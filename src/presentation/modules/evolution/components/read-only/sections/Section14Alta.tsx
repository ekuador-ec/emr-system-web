import type { MedicalEvolution } from "@/domain/modules/evolution/models/Evolution";
import type { UserRole } from "@/domain/modules/users/models/User";
import { USER_ROLE_LABELS } from "@/domain/modules/users/models/User";
import {
  DISCHARGE_TYPE_LABELS,
  formatBoolean,
  formatLongDateTime,
  formatNumeric,
} from "@/presentation/modules/evolution/utils/evolutionLabels";
import { EvolutionPdfSection } from "../primitives/EvolutionPdfSection";
import { EvolutionPdfGrid } from "../primitives/EvolutionPdfGrid";
import { EvolutionPdfCell } from "../primitives/EvolutionPdfCell";
import { EvolutionPdfCheckbox } from "../primitives/EvolutionPdfCheckbox";

interface Section14Props {
  evolution: MedicalEvolution;
  closerRole?: UserRole | null;
}

export function Section14Alta({ evolution, closerRole }: Section14Props) {
  const discharges = evolution.discharges ?? [];
  const dischargeTypes = new Set(discharges.map((d) => d.dischargeType));

  const dischargeOptions: Array<{ value: keyof typeof DISCHARGE_TYPE_LABELS }> = [
    { value: "DOMICILIO" },
    { value: "CONSULTA_EXTERNA" },
    { value: "OBSERVACION" },
    { value: "INTERNACION" },
    { value: "REFERENCIA" },
    { value: "EGRESA_VIVO" },
    { value: "CONDICION_ESTABLE" },
    { value: "CONDICION_INESTABLE" },
  ];

  return (
    <EvolutionPdfSection number={14} title="Alta">
      <div className="em-pdf-discharge-grid">
        {dischargeOptions.map((option) => (
          <EvolutionPdfCheckbox
            key={option.value}
            label={DISCHARGE_TYPE_LABELS[option.value]}
            checked={dischargeTypes.has(option.value)}
            inline
          />
        ))}
      </div>

      <EvolutionPdfGrid>
        <EvolutionPdfCell
          label="Días de Incapacidad"
          value={formatNumeric(evolution.incapacityDays)}
          span={3}
          align="center"
          emphasis="strong"
        />
        <EvolutionPdfCell
          label="Servicio de Referencia"
          value={evolution.referralService}
          span={4}
        />
        <EvolutionPdfCell
          label="Unidad de Referencia"
          value={evolution.referralFacility}
          span={5}
        />
        <EvolutionPdfCell
          label="Fallecimiento en Emergencia"
          value={formatBoolean(evolution.deathInEmergency)}
          span={4}
          align="center"
        />
        <EvolutionPdfCell
          label="Causa de Fallecimiento"
          value={evolution.deathCause}
          span={8}
          multiline
        />
      </EvolutionPdfGrid>

      <EvolutionPdfGrid>
        <EvolutionPdfCell
          label="Médico que Cierra"
          value={evolution.closedByName || "—"}
          span={5}
          emphasis="strong"
        />
        <EvolutionPdfCell
          label="Rol"
          value={closerRole ? USER_ROLE_LABELS[closerRole] : null}
          span={3}
        />
        <EvolutionPdfCell
          label="Fecha y Hora de Cierre"
          value={formatLongDateTime(evolution.closedAt)}
          span={4}
        />
        <EvolutionPdfCell
          label="Firma del Profesional"
          value=""
          span={6}
          multiline
          fallback=""
        />
        <EvolutionPdfCell
          label="Sello / Código del Profesional"
          value=""
          span={6}
          multiline
          fallback=""
        />
      </EvolutionPdfGrid>
    </EvolutionPdfSection>
  );
}
