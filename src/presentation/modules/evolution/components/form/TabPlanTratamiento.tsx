import { useFormContext, useFieldArray } from "react-hook-form";
import type { UpdateEvolutionDraftFormValues } from "../../schemas/evolution.schema";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import {
  WcField,
  WcFormGrid,
  WcFormSection,
} from "@/presentation/modules/shared/components/ui/webcomponents/Forms";
import { WcInput } from "@/presentation/modules/shared/components/ui/webcomponents/Inputs";

const ROW_CARD_STYLE = {
  backgroundColor: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-3)",
  display: "flex",
  flexDirection: "column" as const,
  gap: "var(--space-3)",
};

const ROW_HEADER_STYLE = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-2)",
  paddingBottom: "var(--space-2)",
  borderBottom: "1px dashed var(--color-border)",
};

const ROW_TITLE_STYLE = {
  margin: 0,
  fontFamily: "var(--font-heading)",
  fontSize: "var(--font-size-xs)",
  fontWeight: 600,
  color: "var(--color-text-secondary)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
};

const EMPTY_STATE_STYLE = {
  color: "var(--color-text-secondary)",
  fontSize: "0.875rem",
  textAlign: "center" as const,
  padding: "var(--space-6)",
  margin: 0,
};

export function TabPlanTratamiento() {
  const { control, register } = useFormContext<UpdateEvolutionDraftFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "treatmentPlans",
  });

  return (
    <WcFormSection
      title="Plan de tratamiento"
      subtitle="Registre cada línea del plan con su indicación, medicamento y posología."
      actions={
        <WcButton
          variant="terciary"
          onClick={() => append({ indication: "", medication: "", posology: "" })}
        >
          <Icon name="icon-add" size={16} /> Agregar fila
        </WcButton>
      }
    >
      {fields.length === 0 ? (
        <p style={EMPTY_STATE_STYLE}>
          No hay líneas de tratamiento. Haz clic en "Agregar fila".
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {fields.map((field, index) => (
            <div key={field.id} style={ROW_CARD_STYLE}>
              <div style={ROW_HEADER_STYLE}>
                <h4 style={ROW_TITLE_STYLE}>Línea {index + 1}</h4>
                <WcButtonIcon
                  variant="danger"
                  shape="square"
                  size="sm"
                  onClick={() => remove(index)}
                  aria-label={`Eliminar línea ${index + 1}`}
                >
                  <Icon name="icon-trash" size={16} />
                </WcButtonIcon>
              </div>
              <WcFormGrid columns={3}>
                <WcField label="Indicación">
                  <WcInput
                    type="text"
                    placeholder="Ej. Hidratación"
                    {...register(`treatmentPlans.${index}.indication` as const)}
                  />
                </WcField>
                <WcField label="Medicamento">
                  <WcInput
                    type="text"
                    placeholder="Ej. Solución salina 0.9%"
                    {...register(`treatmentPlans.${index}.medication` as const)}
                  />
                </WcField>
                <WcField label="Posología">
                  <WcInput
                    type="text"
                    placeholder="Ej. 500 ml IV en 30 min"
                    {...register(`treatmentPlans.${index}.posology` as const)}
                  />
                </WcField>
              </WcFormGrid>
            </div>
          ))}
        </div>
      )}
    </WcFormSection>
  );
}
