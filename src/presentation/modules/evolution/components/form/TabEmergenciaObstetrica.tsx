import { Controller, useFormContext } from "react-hook-form";
import type { UpdateEvolutionDraftFormValues } from "../../schemas/evolution.schema";
import { WcCheckbox } from "@/presentation/modules/shared/components/ui/webcomponents/Checkbox/WcCheckbox";
import {
  WcField,
  WcFormGrid,
  WcFormSection,
} from "@/presentation/modules/shared/components/ui/webcomponents/Forms";
import {
  WcInput,
  WcNumberInput,
} from "@/presentation/modules/shared/components/ui/webcomponents/Inputs";

export function TabEmergenciaObstetrica() {
  const { control, register } = useFormContext<UpdateEvolutionDraftFormValues>();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <WcFormSection title="Antecedentes">
        <WcFormGrid columns={3}>
          <WcField label="Gestaciones">
            <Controller
              control={control}
              name="gestations"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  min={0}
                />
              )}
            />
          </WcField>
          <WcField label="Partos">
            <Controller
              control={control}
              name="parturitions"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  min={0}
                />
              )}
            />
          </WcField>
          <WcField label="Abortos">
            <Controller
              control={control}
              name="abortions"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  min={0}
                />
              )}
            />
          </WcField>
          <WcField label="Cesáreas">
            <Controller
              control={control}
              name="cesareans"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  min={0}
                />
              )}
            />
          </WcField>
          <WcField label="FUM">
            <WcInput type="date" {...register("lastMenstruationDate")} />
          </WcField>
          <WcField label="Semanas gestación">
            <Controller
              control={control}
              name="gestationalWeeks"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  min={0}
                  max={45}
                />
              )}
            />
          </WcField>
        </WcFormGrid>
      </WcFormSection>

      <WcFormSection title="Estado fetal">
        <WcFormGrid columns={2}>
          <WcField label="Movimiento Fetal">
            <WcCheckbox {...register("fetalMovement")} label="Movimiento Fetal" />
          </WcField>
          <WcField label="FCF">
            <Controller
              control={control}
              name="fetalHeartRate"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  unit="lpm"
                />
              )}
            />
          </WcField>
          <WcField label="Membranas Rotas">
            <WcCheckbox {...register("rupturedMembranes")} label="Membranas Rotas" />
          </WcField>
          <WcField label="Hora de ruptura">
            <WcInput
              type="text"
              placeholder="Tiempo de ruptura"
              {...register("rupturedTime")}
            />
          </WcField>
        </WcFormGrid>
      </WcFormSection>

      <WcFormSection title="Examen obstétrico">
        <WcFormGrid columns={3}>
          <WcField label="Altura uterina">
            <Controller
              control={control}
              name="uterineHeight"
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
          <WcField label="Presentación">
            <WcInput type="text" {...register("presentation")} />
          </WcField>
          <WcField label="Dilatación">
            <Controller
              control={control}
              name="dilation"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  unit="cm"
                />
              )}
            />
          </WcField>
          <WcField label="Borramiento">
            <Controller
              control={control}
              name="effacement"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  unit="%"
                />
              )}
            />
          </WcField>
          <WcField label="Plano">
            <WcInput type="text" {...register("plane")} />
          </WcField>
        </WcFormGrid>
      </WcFormSection>

      <WcFormSection title="Indicadores">
        <WcFormGrid columns={3}>
          <WcField label="Pelvis Útil">
            <WcCheckbox {...register("usefulPelvis")} label="Pelvis Útil" />
          </WcField>
          <WcField label="Sangrado Vaginal">
            <WcCheckbox {...register("vaginalBleeding")} label="Sangrado Vaginal" />
          </WcField>
          <WcField label="Contracciones">
            <WcCheckbox {...register("contractions")} label="Contracciones" />
          </WcField>
        </WcFormGrid>
      </WcFormSection>
    </div>
  );
}
