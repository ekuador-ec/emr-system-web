import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { UpdateEvolutionDraftFormValues } from "../../schemas/evolution.schema";
import type {
  AccidentType,
  ClinicalCause,
  IntoxicationType,
  ViolenceType,
} from "@/domain/modules/evolution/models/Evolution";
import { WcCheckbox } from "@/presentation/modules/shared/components/ui/webcomponents/Checkbox/WcCheckbox";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
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
import { useParams } from "react-router-dom";
import { usePatient } from "@/presentation/modules/patient/hooks/usePatients";

const CLINICAL_CAUSE_OPTIONS = [
  { value: "TRAUMA", label: "Trauma" },
  { value: "CAUSA_CLINICA", label: "Causa Clínica" },
  { value: "CAUSA_GINECOLOGICA_OBSTETRICA", label: "Causa Ginecológica/Obstétrica" },
  { value: "CAUSA_QUIRURGICA", label: "Causa Quirúrgica" },
  { value: "OTRO", label: "Otro" },
];

const ACCIDENT_TYPE_OPTIONS = [
  { value: "TRANSITO", label: "Tráfico" },
  { value: "CAIDA", label: "Caída" },
  { value: "QUEMADURA", label: "Quemadura" },
  { value: "MORDEDURA", label: "Mordedura" },
  { value: "AHOGAMIENTO", label: "Ahogamiento" },
  { value: "CUERPO_EXTRANO", label: "Cuerpo Extraño" },
  { value: "APLASTAMIENTO", label: "Aplastamiento" },
  { value: "OTRO", label: "Otro" },
];

const VIOLENCE_TYPE_OPTIONS = [
  { value: "ARMA_FUEGO", label: "Arma de Fuego" },
  { value: "RINA", label: "Riña" },
  { value: "VIOLENCIA_FAMILIAR", label: "Violencia Familiar" },
  { value: "ABUSO_FISICO", label: "Abuso Físico" },
  { value: "ABUSO_PSICOLOGICO", label: "Abuso Psicológico" },
  { value: "ABUSO_SEXUAL", label: "Abuso Sexual" },
  { value: "OTRO", label: "Otra" },
];

const INTOXICATION_TYPE_OPTIONS = [
  { value: "ALCOHOLICA", label: "Alcohólica" },
  { value: "ALIMENTARIA", label: "Alimentaria" },
  { value: "DROGAS", label: "Drogas" },
  { value: "GASES", label: "Inhalación de Gases" },
  { value: "ENVENENAMIENTO", label: "Envenenamiento" },
  { value: "PICADURA", label: "Picadura" },
  { value: "ANAFILAXIA", label: "Anafilaxia" },
  { value: "OTRO", label: "Otra" },
];

const TEXTAREA_STYLE = {
  width: "100%",
  padding: "var(--space-2) var(--space-3)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-border)",
  backgroundColor: "var(--color-surface)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: "var(--font-size-sm)",
  resize: "vertical" as const,
};

const TEXTAREA_ERROR_STYLE = {
  ...TEXTAREA_STYLE,
  border: "1px solid var(--color-danger)",
};

export function TabMotivo() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<UpdateEvolutionDraftFormValues>();

  const clinicalCause = useWatch({ control, name: "clinicalCause" });
  const notifyPolice = useWatch({ control, name: "notifyPolice" });
  const isObstetricEmergency = useWatch({ control, name: "isObstetricEmergency" });
  const { patientId } = useParams<{ patientId: string }>();
  const { data: patient } = usePatient(patientId || "");
  const isFemale = patient?.gender === "FEMENINO";
  const showNotifyPolice = ["TRAUMA", "CAUSA_QUIRURGICA", "OTRO"].includes(clinicalCause || "");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <WcFormSection title="Atención">
        <WcFormGrid columns={2}>
          <WcField
            label="Fecha de Atención"
            required
            error={errors.attentionDate?.message}
          >
            <WcInput
              type="date"
              {...register("attentionDate")}
              error={Boolean(errors.attentionDate)}
            />
          </WcField>

          <WcField
            label="Hora de Atención"
            required
            error={errors.attentionTime?.message}
          >
            <WcInput
              type="time"
              {...register("attentionTime")}
              error={Boolean(errors.attentionTime)}
            />
          </WcField>

          <WcField
            label="Causa Clínica"
            required
            spanFull
            error={errors.clinicalCause?.message as string | undefined}
          >
            <Controller
              control={control}
              name="clinicalCause"
              render={({ field }) => (
                <WcSelect
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value as ClinicalCause)}
                  options={CLINICAL_CAUSE_OPTIONS}
                  placeholder="Seleccione..."
                  error={Boolean(errors.clinicalCause)}
                />
              )}
            />
          </WcField>

          <WcField
            label="Descripción del Motivo"
            spanFull
            error={errors.clinicalCauseDescription?.message as string | undefined}
          >
            <textarea
              {...register("clinicalCauseDescription")}
              rows={3}
              style={errors.clinicalCauseDescription ? TEXTAREA_ERROR_STYLE : TEXTAREA_STYLE}
            />
          </WcField>
        </WcFormGrid>

        {showNotifyPolice ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-md)",
              backgroundColor: notifyPolice ? "rgba(220, 38, 38, 0.1)" : "transparent",
              border: notifyPolice
                ? "1px solid var(--color-danger)"
                : "1px solid var(--color-border)",
              marginTop: "var(--space-4)",
            }}
          >
            <WcCheckbox
              {...register("notifyPolice")}
              label={notifyPolice ? "Caso notificado a la policía" : "¿Notificar a la policía?"}
              description={
                notifyPolice
                  ? "El caso ha sido reportado a las autoridades competentes."
                  : "Marcar si el caso requiere dar parte a las autoridades."
              }
            />
            {notifyPolice ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginLeft: "auto",
                  color: "var(--color-danger)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                <Icon name="icon-alert-triangle" size={18} />
                Notificado
              </div>
            ) : null}
          </div>
        ) : null}

        {isFemale ? (
          <div style={{ marginTop: "var(--space-3)" }}>
            <WcCheckbox
              {...register("isObstetricEmergency")}
              label={
                isObstetricEmergency
                  ? "Emergencia Obstétrica registrada"
                  : "¿Se trata de una emergencia obstétrica?"
              }
              description={
                isObstetricEmergency
                  ? "La pestaña de Emergencia Obstétrica estará disponible."
                  : "Marque si esta atención corresponde a una emergencia obstétrica."
              }
            />
          </div>
        ) : null}
      </WcFormSection>

      <WcFormSection title="Evento">
        <WcFormGrid columns={2}>
          <WcField label="Fecha y Hora del Evento">
            <WcInput type="datetime-local" {...register("eventDateTime")} />
          </WcField>
          <WcField label="Lugar del Evento">
            <WcInput type="text" {...register("eventLocation")} />
          </WcField>
          <WcField label="Dirección del Evento" spanFull>
            <WcInput type="text" {...register("eventAddress")} />
          </WcField>
        </WcFormGrid>
      </WcFormSection>

      <WcFormSection title="Custodia y sustancias">
        <WcFormGrid columns={2}>
          <WcField label="Custodia policial" spanFull>
            <WcCheckbox
              {...register("requiresPoliceCustody")}
              label="¿Requiere custodia policial?"
            />
          </WcField>
          <WcField label="Aliento Etílico" spanFull>
            <WcCheckbox {...register("alcoholicBreath")} label="¿Aliento Etílico?" />
          </WcField>
          <WcField label="Alcocheck">
            <Controller
              control={control}
              name="alcocheckValue"
              render={({ field }) => (
                <WcNumberInput
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value)}
                  step={0.01}
                  decimals={2}
                  unit="g/L"
                />
              )}
            />
          </WcField>
        </WcFormGrid>
      </WcFormSection>

      <WcFormSection title="Clasificación">
        <WcFormGrid columns={3}>
          <WcField label="Tipo de Accidente">
            <Controller
              control={control}
              name="accidentType"
              render={({ field }) => (
                <WcSelect
                  value={field.value ?? null}
                  onChange={(value) =>
                    field.onChange(value === "" ? null : (value as AccidentType))
                  }
                  options={ACCIDENT_TYPE_OPTIONS}
                  placeholder="Ninguno"
                  clearable
                />
              )}
            />
          </WcField>

          <WcField label="Tipo de Violencia">
            <Controller
              control={control}
              name="violenceType"
              render={({ field }) => (
                <WcSelect
                  value={field.value ?? null}
                  onChange={(value) =>
                    field.onChange(value === "" ? null : (value as ViolenceType))
                  }
                  options={VIOLENCE_TYPE_OPTIONS}
                  placeholder="Ninguna"
                  clearable
                />
              )}
            />
          </WcField>

          <WcField label="Tipo de Intoxicación">
            <Controller
              control={control}
              name="intoxicationType"
              render={({ field }) => (
                <WcSelect
                  value={field.value ?? null}
                  onChange={(value) =>
                    field.onChange(value === "" ? null : (value as IntoxicationType))
                  }
                  options={INTOXICATION_TYPE_OPTIONS}
                  placeholder="Ninguna"
                  clearable
                />
              )}
            />
          </WcField>
        </WcFormGrid>
      </WcFormSection>

      <WcFormSection title="Observaciones">
        <WcFormGrid columns={1}>
          <WcField label="Observaciones del Evento" spanFull>
            <textarea
              {...register("eventObservations")}
              rows={4}
              style={errors.eventObservations ? TEXTAREA_ERROR_STYLE : TEXTAREA_STYLE}
            />
          </WcField>
        </WcFormGrid>
      </WcFormSection>
    </div>
  );
}
