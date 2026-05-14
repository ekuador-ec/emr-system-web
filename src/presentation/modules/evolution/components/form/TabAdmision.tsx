import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { UpdateEvolutionDraftFormValues } from "../../schemas/evolution.schema";
import type { ArrivalMethod } from "@/domain/modules/evolution/models/Evolution";
import {
  WcField,
  WcFormGrid,
  WcFormSection,
} from "@/presentation/modules/shared/components/ui/webcomponents/Forms";
import {
  WcInput,
  WcSelect,
} from "@/presentation/modules/shared/components/ui/webcomponents/Inputs";

const ARRIVAL_METHOD_OPTIONS = [
  { value: "AMBULATORIO", label: "Ambulatorio" },
  { value: "AMBULANCIA", label: "Ambulancia" },
  { value: "OTRO", label: "Otro Transporte" },
];

const TEXTAREA_STYLE = {
  width: "100%",
  minHeight: "80px",
  padding: "var(--space-2) var(--space-3)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-border)",
  backgroundColor: "var(--color-surface)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: "var(--font-size-sm)",
  resize: "vertical" as const,
};

export function TabAdmision() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<UpdateEvolutionDraftFormValues>();

  const arrivalMethod = useWatch({ control, name: "arrivalMethod" });
  const showOtherObservation = arrivalMethod === "OTRO";

  return (
    <WcFormGrid columns={2} min="320px">
      <WcFormSection title="Forma de llegada">
        <WcFormGrid columns={1}>
          <WcField
            label="Forma de llegada"
            required
            error={errors.arrivalMethod?.message as string | undefined}
          >
            <Controller
              control={control}
              name="arrivalMethod"
              render={({ field }) => (
                <WcSelect
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value as ArrivalMethod)}
                  options={ARRIVAL_METHOD_OPTIONS}
                  placeholder="Seleccione..."
                  error={Boolean(errors.arrivalMethod)}
                />
              )}
            />
          </WcField>

          {showOtherObservation ? (
            <WcField label="Observaciones de Forma de llegada">
              <textarea
                {...register("arrivalMethodObservations")}
                rows={2}
                style={TEXTAREA_STYLE}
              />
            </WcField>
          ) : null}
        </WcFormGrid>
      </WcFormSection>

      <WcFormSection title="Datos del referente">
        <WcFormGrid columns={1}>
          <WcField label="Fuente de información / Referido de">
            <WcInput type="text" {...register("informationSource")} />
          </WcField>
          <WcField label="Institución o persona que entrega">
            <WcInput type="text" {...register("referringPerson")} />
          </WcField>
          <WcField label="Número o teléfono de contacto">
            <WcInput type="tel" {...register("contactNumber")} />
          </WcField>
        </WcFormGrid>
      </WcFormSection>
    </WcFormGrid>
  );
}
