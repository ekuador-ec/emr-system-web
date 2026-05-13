import { Controller, useFormContext, useFieldArray, useWatch } from "react-hook-form";
import type { UpdateEvolutionDraftFormValues } from "../../schemas/evolution.schema";
import type { DischargeType } from "@/domain/modules/evolution/models/Evolution";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import { WcCheckbox } from "@/presentation/modules/shared/components/ui/webcomponents/Checkbox/WcCheckbox";
import {
  WcField,
  WcFormGrid,
  WcFormSection,
} from "@/presentation/modules/shared/components/ui/webcomponents/Forms";
import {
  WcInput,
  WcNumberInput,
  WcSelect,
} from "@/presentation/modules/shared/components/ui/webcomponents/Inputs";

const DISCHARGE_TYPE_OPTIONS = [
  { value: "DOMICILIO", label: "Domicilio" },
  { value: "CONSULTA_EXTERNA", label: "Consulta Externa" },
  { value: "OBSERVACION", label: "Observación" },
  { value: "INTERNACION", label: "Internación" },
  { value: "REFERENCIA", label: "Referencia" },
  { value: "EGRESA_VIVO", label: "Egresa Vivo" },
  { value: "CONDICION_ESTABLE", label: "Condición Estable" },
  { value: "CONDICION_INESTABLE", label: "Condición Inestable" },
  { value: "DIAS_INCAPACIDAD", label: "Días de Incapacidad" },
];

const ROW_CARD_STYLE = {
  backgroundColor: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-3)",
  display: "flex",
  alignItems: "center",
  gap: "var(--space-3)",
};

const EMPTY_STATE_STYLE = {
  color: "var(--color-text-secondary)",
  fontSize: "0.875rem",
  textAlign: "center" as const,
  padding: "var(--space-4)",
  backgroundColor: "var(--color-bg)",
  borderRadius: "var(--radius-md)",
  margin: 0,
};

const DEATH_TEXTAREA_STYLE = {
  width: "100%",
  padding: "var(--space-2) var(--space-3)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-danger)",
  backgroundColor: "var(--color-surface)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: "var(--font-size-sm)",
  resize: "vertical" as const,
};

export function TabAlta() {
  const { control, register } = useFormContext<UpdateEvolutionDraftFormValues>();

  const {
    fields: dischargeFields,
    append: appendDischarge,
    remove: removeDischarge,
  } = useFieldArray({ control, name: "discharges" });

  const isDeathInEmergency = useWatch({ control, name: "deathInEmergency" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <WcFormSection
        title="Condiciones de alta"
        actions={
          <WcButton
            variant="terciary"
            onClick={() => appendDischarge({ dischargeType: "DOMICILIO" })}
          >
            <Icon name="icon-add" size={16} /> Agregar Condición
          </WcButton>
        }
      >
        {dischargeFields.length === 0 ? (
          <p style={EMPTY_STATE_STYLE}>No hay condiciones de alta agregadas.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {dischargeFields.map((field, index) => (
              <div key={field.id} style={ROW_CARD_STYLE}>
                <div style={{ flex: 1 }}>
                  <Controller
                    control={control}
                    name={`discharges.${index}.dischargeType` as const}
                    render={({ field: f }) => (
                      <WcSelect
                        value={f.value ?? null}
                        onChange={(value) => f.onChange(value as DischargeType)}
                        options={DISCHARGE_TYPE_OPTIONS}
                      />
                    )}
                  />
                </div>
                <WcButtonIcon
                  variant="danger"
                  shape="square"
                  size="sm"
                  onClick={() => removeDischarge(index)}
                  aria-label={`Eliminar condición ${index + 1}`}
                >
                  <Icon name="icon-trash" size={16} />
                </WcButtonIcon>
              </div>
            ))}
          </div>
        )}
      </WcFormSection>

      <WcFormSection title="Días de incapacidad">
        <WcFormGrid columns={2}>
          <WcField label="Días">
            <Controller
              control={control}
              name="incapacityDays"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  unit="días"
                  min={0}
                />
              )}
            />
          </WcField>
        </WcFormGrid>
      </WcFormSection>

      <WcFormSection title="Referencia externa">
        <WcFormGrid columns={2}>
          <WcField label="Servicio">
            <WcInput
              type="text"
              placeholder="Si aplica..."
              {...register("referralService")}
            />
          </WcField>
          <WcField label="Establecimiento">
            <WcInput
              type="text"
              placeholder="Si aplica..."
              {...register("referralFacility")}
            />
          </WcField>
        </WcFormGrid>
      </WcFormSection>

      <WcFormSection title="Fallecimiento">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
            padding: isDeathInEmergency ? "var(--space-4)" : 0,
            backgroundColor: isDeathInEmergency ? "var(--color-danger-light)" : "transparent",
            borderRadius: "var(--radius-md)",
            transition: "background-color 0.3s ease",
          }}
        >
          <WcCheckbox
            {...register("deathInEmergency")}
            label="Falleció en emergencia"
            danger={isDeathInEmergency}
          />
          {isDeathInEmergency ? (
            <WcField label="Causa del fallecimiento" spanFull>
              <textarea
                {...register("deathCause")}
                rows={3}
                placeholder="Describa la causa..."
                style={DEATH_TEXTAREA_STYLE}
              />
            </WcField>
          ) : null}
        </div>
      </WcFormSection>
    </div>
  );
}
