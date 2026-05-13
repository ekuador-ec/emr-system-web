import { useFormContext, useWatch } from "react-hook-form";
import type { UpdateEvolutionDraftFormValues } from "../../schemas/evolution.schema";

export function TabAdmision() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<UpdateEvolutionDraftFormValues>();

  const arrivalMethod = useWatch({ control, name: "arrivalMethod" });
  const showOtherObservation = arrivalMethod === "OTRO";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-6)" }}>
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
          Forma de llegada
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "4px" }}>
              Forma de llegada <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <select
              {...register("arrivalMethod")}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: errors.arrivalMethod
                  ? "1px solid var(--color-danger)"
                  : "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
              }}
            >
              <option value="">Seleccione...</option>
              <option value="AMBULATORIO">Ambulatorio</option>
              <option value="AMBULANCIA">Ambulancia</option>
              <option value="OTRO">Otro Transporte</option>
            </select>
            {errors.arrivalMethod && (
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-danger)",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                {errors.arrivalMethod.message as string}
              </span>
            )}
          </div>

          {showOtherObservation && (
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "4px" }}>
                Observaciones de Forma de llegada
              </label>
              <textarea
                {...register("arrivalMethodObservations")}
                rows={2}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
              />
            </div>
          )}
        </div>
      </section>

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
          Datos del referente
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "4px" }}>
              Fuente de información / Referido de
            </label>
            <input
              type="text"
              {...register("informationSource")}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "4px" }}>
              Institución o persona que entrega
            </label>
            <input
              type="text"
              {...register("referringPerson")}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "4px" }}>
              Número o teléfono de contacto
            </label>
            <input
              type="text"
              {...register("contactNumber")}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
