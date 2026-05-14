import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { UpdateEvolutionDraftFormValues } from "../../schemas/evolution.schema";
import { WcStatusBadge } from "@/presentation/modules/shared/components/ui/webcomponents/Badges";
import type { WcStatusVariant } from "@/presentation/modules/shared/components/ui/webcomponents/Badges";
import {
  WcField,
  WcFormGrid,
  WcFormSection,
} from "@/presentation/modules/shared/components/ui/webcomponents/Forms";
import {
  WcInput,
  WcNumberInput,
} from "@/presentation/modules/shared/components/ui/webcomponents/Inputs";

interface BadgeInfo {
  variant: WcStatusVariant;
  label: string;
}

function getBmiBadge(bmi: number | null | undefined): BadgeInfo | null {
  if (bmi === null || bmi === undefined || Number.isNaN(bmi) || bmi <= 0) return null;
  if (bmi < 18.5) return { variant: "warning", label: "Bajo peso" };
  if (bmi < 25) return { variant: "success", label: "Normal" };
  if (bmi < 30) return { variant: "warning", label: "Sobrepeso" };
  return { variant: "danger", label: "Obesidad" };
}

function getGlasgowBadge(total: number | null | undefined): BadgeInfo | null {
  if (total === null || total === undefined || Number.isNaN(total) || total <= 0) return null;
  if (total >= 13) return { variant: "success", label: "Leve (13-15)" };
  if (total >= 9) return { variant: "warning", label: "Moderado (9-12)" };
  return { variant: "danger", label: "Severo (\u22648)" };
}

export function TabSignosVitales() {
  const { register, control, setValue } = useFormContext<UpdateEvolutionDraftFormValues>();

  const weight = useWatch({ control, name: "weight" });
  const height = useWatch({ control, name: "height" });

  const glasgowOcular = useWatch({ control, name: "glasgowOcular" });
  const glasgowVerbal = useWatch({ control, name: "glasgowVerbal" });
  const glasgowMotor = useWatch({ control, name: "glasgowMotor" });

  useEffect(() => {
    const w = Number(weight);
    const h = Number(height);
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
      const heightInMeters = h > 3 ? h / 100 : h;
      const bmi = w / (heightInMeters * heightInMeters);
      setValue("bmi", parseFloat(bmi.toFixed(2)));
    } else {
      setValue("bmi", null);
    }
  }, [weight, height, setValue]);

  useEffect(() => {
    const o = Number(glasgowOcular);
    const v = Number(glasgowVerbal);
    const m = Number(glasgowMotor);
    const validO = Number.isFinite(o) && o > 0;
    const validV = Number.isFinite(v) && v > 0;
    const validM = Number.isFinite(m) && m > 0;
    if (validO || validV || validM) {
      setValue("glasgowTotal", (validO ? o : 0) + (validV ? v : 0) + (validM ? m : 0));
    } else {
      setValue("glasgowTotal", null);
    }
  }, [glasgowOcular, glasgowVerbal, glasgowMotor, setValue]);

  const currentBmi = useWatch({ control, name: "bmi" });
  const currentGlasgow = useWatch({ control, name: "glasgowTotal" });

  const bmiBadge = getBmiBadge(currentBmi);
  const glasgowBadge = getGlasgowBadge(currentGlasgow);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <WcFormSection title="Presión arterial">
        <WcFormGrid columns={2}>
          <WcField label="PA Derecha">
            <WcInput type="text" placeholder="120/80" {...register("bpRight")} />
          </WcField>
          <WcField label="PA Izquierda">
            <WcInput type="text" placeholder="120/80" {...register("bpLeft")} />
          </WcField>
        </WcFormGrid>
      </WcFormSection>

      <WcFormSection title="Cardiorrespiratorio">
        <WcFormGrid columns={3} min="180px">
          <WcField label="FC">
            <Controller
              control={control}
              name="heartRate"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  unit="lpm"
                />
              )}
            />
          </WcField>
          <WcField label="FR">
            <Controller
              control={control}
              name="respiratoryRate"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  unit="rpm"
                />
              )}
            />
          </WcField>
          <WcField label="SatO\u2082">
            <Controller
              control={control}
              name="oxygenSaturation"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  unit="%"
                />
              )}
            />
          </WcField>
          <WcField label="Temperatura">
            <Controller
              control={control}
              name="temperature"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  unit="\u00B0C"
                  step={0.1}
                  decimals={1}
                />
              )}
            />
          </WcField>
        </WcFormGrid>
      </WcFormSection>

      <WcFormSection
        title="Antropometría"
        actions={
          bmiBadge ? (
            <WcStatusBadge variant={bmiBadge.variant} size="sm">
              IMC: {bmiBadge.label}
            </WcStatusBadge>
          ) : null
        }
      >
        <WcFormGrid columns={3}>
          <WcField label="Peso">
            <Controller
              control={control}
              name="weight"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  unit="kg"
                  step={0.1}
                  decimals={1}
                />
              )}
            />
          </WcField>
          <WcField label="Talla">
            <Controller
              control={control}
              name="height"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  unit="cm"
                  step={0.1}
                  decimals={1}
                />
              )}
            />
          </WcField>
          <WcField label="IMC">
            <Controller
              control={control}
              name="bmi"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  step={0.01}
                  decimals={2}
                  disabled
                />
              )}
            />
          </WcField>
        </WcFormGrid>
      </WcFormSection>

      <WcFormSection title="Neurológico — Pupilas y llenado capilar">
        <WcFormGrid columns={3}>
          <WcField label="Pupila derecha">
            <WcInput {...register("rightPupilReaction")} placeholder="Normal, midriasis, miosis…" />
          </WcField>
          <WcField label="Pupila izquierda">
            <WcInput {...register("leftPupilReaction")} placeholder="Normal, midriasis, miosis…" />
          </WcField>
          <WcField label="Llenado capilar">
            <Controller
              control={control}
              name="capillaryRefillTime"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  unit="s"
                />
              )}
            />
          </WcField>
        </WcFormGrid>
      </WcFormSection>

      <WcFormSection
        title="Glasgow"
        actions={
          glasgowBadge ? (
            <WcStatusBadge variant={glasgowBadge.variant} size="sm">
              {glasgowBadge.label}
            </WcStatusBadge>
          ) : null
        }
      >
        <WcFormGrid columns={4} min="160px">
          <WcField label="Ocular (1-4)">
            <Controller
              control={control}
              name="glasgowOcular"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  min={1}
                  max={4}
                />
              )}
            />
          </WcField>
          <WcField label="Verbal (1-5)">
            <Controller
              control={control}
              name="glasgowVerbal"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  min={1}
                  max={5}
                />
              )}
            />
          </WcField>
          <WcField label="Motor (1-6)">
            <Controller
              control={control}
              name="glasgowMotor"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  min={1}
                  max={6}
                />
              )}
            />
          </WcField>
          <WcField label="Total">
            <Controller
              control={control}
              name="glasgowTotal"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  disabled
                />
              )}
            />
          </WcField>
        </WcFormGrid>
      </WcFormSection>
    </div>
  );
}
