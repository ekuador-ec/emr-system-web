import { Controller, useFormContext, useFieldArray } from "react-hook-form";
import type { UpdateEvolutionDraftFormValues } from "../../schemas/evolution.schema";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import {
  WcField,
  WcFormGrid,
  WcFormSection,
} from "@/presentation/modules/shared/components/ui/webcomponents/Forms";
import { WcTextareaExpand } from "@/presentation/modules/shared/components/ui/webcomponents/Inputs/wcTextareaExpand";

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
  const { control } = useFormContext<UpdateEvolutionDraftFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "treatmentPlans",
  });

  return (
    <WcFormSection
      title="Plan de tratamiento"
      subtitle="Cada línea acepta varias filas de texto; use el icono para expandir si requiere más espacio."
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
              <WcFormGrid columns={1}>
                <WcField label="Indicación">
                  <Controller
                    control={control}
                    name={`treatmentPlans.${index}.indication` as const}
                    render={({ field: f }) => (
                      <WcTextareaExpand
                        value={f.value ?? ""}
                        onChange={f.onChange}
                        placeholder="Ej. Hidratación parenteral, control de signos vitales cada 30 min…"
                        minRows={2}
                        maxRows={5}
                        label="Indicación"
                      />
                    )}
                  />
                </WcField>
                <WcField label="Medicamento">
                  <Controller
                    control={control}
                    name={`treatmentPlans.${index}.medication` as const}
                    render={({ field: f }) => (
                      <WcTextareaExpand
                        value={f.value ?? ""}
                        onChange={f.onChange}
                        placeholder="Ej. Solución salina 0.9%, Paracetamol 500 mg…"
                        minRows={2}
                        maxRows={5}
                        label="Medicamento"
                      />
                    )}
                  />
                </WcField>
                <WcField label="Posología">
                  <Controller
                    control={control}
                    name={`treatmentPlans.${index}.posology` as const}
                    render={({ field: f }) => (
                      <WcTextareaExpand
                        value={f.value ?? ""}
                        onChange={f.onChange}
                        placeholder="Ej. 500 ml IV en 30 minutos cada 8 horas por 3 días…"
                        minRows={2}
                        maxRows={5}
                        label="Posología"
                      />
                    )}
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
