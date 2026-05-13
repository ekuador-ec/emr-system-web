import { useFormContext, useWatch } from "react-hook-form";
import type { UpdateEvolutionDraftFormValues } from "../../schemas/evolution.schema";
import { WcCheckbox } from "@/presentation/modules/shared/components/ui/webcomponents/Checkbox/WcCheckbox";
import { WcTextareaExpand } from "@/presentation/modules/shared/components/ui/webcomponents/Inputs/wcTextareaExpand";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { useParams } from "react-router-dom";
import { usePatient } from "@/presentation/modules/patient/hooks/usePatients";

export function TabMotivo() {
  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<UpdateEvolutionDraftFormValues>();

  const clinicalCause = useWatch({ control, name: "clinicalCause" });
  const notifyPolice = useWatch({ control, name: "notifyPolice" });
  const isObstetricEmergency = useWatch({ control, name: "isObstetricEmergency" });
  const { patientId } = useParams<{ patientId: string }>();
  const { data: patient } = usePatient(patientId || "");
  const isFemale =patient?.gender === "Femenino" || patient?.gender === "FEMENINO" || patient?.gender === "F";
  const showNotifyPolice = ["TRAUMA", "CAUSA_QUIRURGICA", "OTRO"].includes(clinicalCause || "");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
      {/* Columna Izquierda: Motivo de consulta */}
      <section
        style={{
          backgroundColor: "var(--color-surface)",
          padding: "var(--space-6)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            fontSize: "1.125rem",
            borderBottom: "1px solid var(--color-border)",
            paddingBottom: "12px",
            marginBottom: "var(--space-4)",
          }}
        >
          1. Motivo de Consulta
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Fila 1: Fecha y Hora de Atención */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Fecha de Atención <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <input
                type="date"
                {...register("attentionDate")}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: errors.attentionDate
                    ? "1px solid var(--color-danger)"
                    : "1px solid var(--color-border)",
                }}
              />
              {errors.attentionDate && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-danger)",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.attentionDate.message}
                </span>
              )}
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Hora de Atención <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <input
                type="time"
                {...register("attentionTime")}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: errors.attentionTime
                    ? "1px solid var(--color-danger)"
                    : "1px solid var(--color-border)",
                }}
              />
              {errors.attentionTime && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-danger)",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.attentionTime.message}
                </span>
              )}
            </div>
          </div>

          {/* Fila 2: Causa Clínica + Descripción (misma fila) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Causa Clínica <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <select
                {...register("clinicalCause")}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: errors.clinicalCause
                    ? "1px solid var(--color-danger)"
                    : "1px solid var(--color-border)",
                }}
              >
                <option value="">Seleccione...</option>
                <option value="TRAUMA">Trauma</option>
                <option value="CAUSA_CLINICA">Causa Clínica</option>
                <option value="CAUSA_GINECOLOGICA_OBSTETRICA">
                  Causa Ginecológica u Obstétrica
                </option>
                <option value="CAUSA_QUIRURGICA">Causa Quirúrgica</option>
                <option value="OTRO">Otro</option>
              </select>
              {errors.clinicalCause && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-danger)",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.clinicalCause.message}
                </span>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Descripción del Motivo <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <WcTextareaExpand
                value={watch("clinicalCauseDescription") || ""}
                onChange={(value) => setValue("clinicalCauseDescription", value)}
                rows={3}
                error={errors.clinicalCauseDescription?.message as string}
                label="Descripción del Motivo"
              />
            </div>
          </div>

          {/* Fila 3: Notificar a la policía - destacado cuando está marcado */}
          {showNotifyPolice && (
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
                marginTop: "var(--space-2)",
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
              {notifyPolice && (
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
              )}
            </div>
          )}
          {/* Emergencia Obstétrica toggle (solo para pacientes femeninos) */}
          {isFemale && (
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
          )}
        </div>
      </section>

      {/* Columna Derecha: Evento */}
      <section
        style={{
          backgroundColor: "var(--color-surface)",
          padding: "var(--space-6)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h2
          style={{
            fontSize: "1.125rem",
            borderBottom: "1px solid var(--color-border)",
            paddingBottom: "12px",
            marginBottom: "var(--space-4)",
            marginTop: 0,
          }}
        >
          2. Evento (Accidente, Violencia, Intoxicación)
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Fecha y Hora del Evento
              </label>
              <input
                type="datetime-local"
                {...register("eventDateTime")}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid var(--color-border)",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Lugar del Evento
              </label>
              <input
                type="text"
                {...register("eventLocation")}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid var(--color-border)",
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "4px",
              }}
            >
              Dirección del Evento
            </label>
            <input
              type="text"
              {...register("eventAddress")}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "var(--space-6)", flexWrap: "wrap" }}>
            <WcCheckbox
              {...register("requiresPoliceCustody")}
              label="¿Requiere custodia policial?"
            />
            <WcCheckbox {...register("alcoholicBreath")} label="¿Aliento Etílico?" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Valor Alcocheck
              </label>
              <input
                type="number"
                step="0.01"
                {...register("alcocheckValue", { valueAsNumber: true })}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid var(--color-border)",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Tipo de Accidente
              </label>
              <select
                {...register("accidentType")}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid var(--color-border)",
                }}
              >
                <option value="">Ninguno</option>
                <option value="TRANSITO">Tráfico</option>
                <option value="CAIDA">Caída</option>
                <option value="QUEMADURA">Quemadura</option>
                <option value="MORDEDURA">Mordedura</option>
                <option value="AHOGAMIENTO">Ahogamiento</option>
                <option value="CUERPO_EXTRANO">Cuerpo Extraño</option>
                <option value="APLASTAMIENTO">Aplastamiento</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Tipo de Violencia
              </label>
              <select
                {...register("violenceType")}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid var(--color-border)",
                }}
              >
                <option value="">Ninguna</option>
                <option value="ARMA_FUEGO">Arma de Fuego</option>
                <option value="RINA">Riña</option>
                <option value="VIOLENCIA_FAMILIAR">Violencia Familiar</option>
                <option value="ABUSO_FISICO">Abuso Físico</option>
                <option value="ABUSO_PSICOLOGICO">Abuso Psicológico</option>
                <option value="ABUSO_SEXUAL">Abuso Sexual</option>
                <option value="OTRO">Otra</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Tipo de Intoxicación
              </label>
              <select
                {...register("intoxicationType")}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid var(--color-border)",
                }}
              >
                <option value="">Ninguna</option>
                <option value="ALCOHOLICA">Alcohólica</option>
                <option value="ALIMENTARIA">Alimentaria</option>
                <option value="DROGAS">Drogas</option>
                <option value="GASES">Inhalación de Gases</option>
                <option value="ENVENENAMIENTO">Envenenamiento</option>
                <option value="PICADURA">Picadura</option>
                <option value="ANAFILAXIA">Anafilaxia</option>
                <option value="OTRO">Otra</option>
              </select>
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "4px",
              }}
            >
              Observaciones del Evento
            </label>
            <textarea
              {...register("eventObservations")}
              rows={2}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
