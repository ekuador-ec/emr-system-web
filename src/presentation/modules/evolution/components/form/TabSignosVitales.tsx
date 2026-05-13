import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { UpdateEvolutionDraftFormValues } from "../../schemas/evolution.schema";

export function TabSignosVitales() {
  const { register, control, setValue } = useFormContext<UpdateEvolutionDraftFormValues>();

  const weight = useWatch({ control, name: "weight" });
  const height = useWatch({ control, name: "height" });

  const glasgowOcular = useWatch({ control, name: "glasgowOcular" });
  const glasgowVerbal = useWatch({ control, name: "glasgowVerbal" });
  const glasgowMotor = useWatch({ control, name: "glasgowMotor" });

  // Auto-calculate BMI. When the user clears either weight or height the
  // derived BMI is cleared too, so a stale value does not survive on the form
  // (which used to keep the previous BMI and break the save with stale data).
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

  // Auto-calculate Glasgow total. Clear the total when no component is set so
  // an empty form does not persist a stale total from a previous edit.
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

  const getBmiBadge = (bmi: number | undefined | null) => {
    if (!bmi) return null;
    if (bmi < 18.5)
      return (
        <span
          style={{
            backgroundColor: "var(--color-warning)",
            color: "var(--color-text)",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          Bajo peso
        </span>
      );
    if (bmi >= 18.5 && bmi < 25)
      return (
        <span
          style={{
            backgroundColor: "var(--color-success)",
            color: "white",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          Normal
        </span>
      );
    if (bmi >= 25 && bmi < 30)
      return (
        <span
          style={{
            backgroundColor: "var(--color-warning)",
            color: "var(--color-text)",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          Sobrepeso
        </span>
      );
    return (
      <span
        style={{
          backgroundColor: "var(--color-danger)",
          color: "white",
          padding: "2px 8px",
          borderRadius: "4px",
          fontSize: "0.75rem",
          fontWeight: 600,
        }}
      >
        Obesidad
      </span>
    );
  };

  const getGlasgowBadge = (total: number | undefined | null) => {
    if (!total) return null;
    if (total >= 13)
      return (
        <span
          style={{
            backgroundColor: "var(--color-success)",
            color: "white",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          Leve (13-15)
        </span>
      );
    if (total >= 9)
      return (
        <span
          style={{
            backgroundColor: "var(--color-warning)",
            color: "var(--color-text)",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          Moderado (9-12)
        </span>
      );
    return (
      <span
        style={{
          backgroundColor: "var(--color-danger)",
          color: "white",
          padding: "2px 8px",
          borderRadius: "4px",
          fontSize: "0.75rem",
          fontWeight: 600,
        }}
      >
        Severo (≤8)
      </span>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* S3: Signos Vitales */}
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
          4. Signos Vitales y Mediciones
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "4px",
              }}
            >
              PA Derecha
            </label>
            <input
              type="text"
              {...register("bpRight")}
              placeholder="120/80"
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
              PA Izquierda
            </label>
            <input
              type="text"
              {...register("bpLeft")}
              placeholder="120/80"
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
              Temp. Bucal (°C)
            </label>
            <input
              type="number"
              step="0.1"
              {...register("temperature", { valueAsNumber: true })}
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
              Frec. Cardíaca (lpm)
            </label>
            <input
              type="number"
              {...register("heartRate", { valueAsNumber: true })}
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
              Frec. Respiratoria (rpm)
            </label>
            <input
              type="number"
              {...register("respiratoryRate", { valueAsNumber: true })}
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
              Sat. Oxígeno (%)
            </label>
            <input
              type="number"
              {...register("oxygenSaturation", { valueAsNumber: true })}
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
              Peso (kg)
            </label>
            <input
              type="number"
              step="0.1"
              {...register("weight", { valueAsNumber: true })}
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
              Talla (m o cm)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Ej: 1.70 o 170"
              {...register("height", { valueAsNumber: true })}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
              }}
            />
          </div>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "4px",
              }}
            >
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500 }}>IMC</label>
              {getBmiBadge(currentBmi)}
            </div>
            <input
              type="number"
              step="0.01"
              {...register("bmi", { valueAsNumber: true })}
              readOnly
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg)",
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
              Reacción Pupilar Der.
            </label>
            <input
              type="text"
              {...register("rightPupilReaction")}
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
              Reacción Pupilar Izq.
            </label>
            <input
              type="text"
              {...register("leftPupilReaction")}
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
              Llenado Capilar (seg)
            </label>
            <input
              type="number"
              {...register("capillaryRefillTime", { valueAsNumber: true })}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
              }}
            />
          </div>
        </div>

        <h3
          style={{
            marginTop: "var(--space-6)",
            fontSize: "1rem",
            color: "var(--color-text-secondary)",
          }}
        >
          Escala de Glasgow
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "var(--space-4)",
            marginTop: "var(--space-2)",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "4px",
              }}
            >
              Ocular (1-4)
            </label>
            <input
              type="number"
              min="1"
              max="4"
              {...register("glasgowOcular", { valueAsNumber: true })}
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
              Verbal (1-5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              {...register("glasgowVerbal", { valueAsNumber: true })}
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
              Motora (1-6)
            </label>
            <input
              type="number"
              min="1"
              max="6"
              {...register("glasgowMotor", { valueAsNumber: true })}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
              }}
            />
          </div>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "4px",
              }}
            >
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500 }}>
                Total Glasgow
              </label>
              {getGlasgowBadge(currentGlasgow)}
            </div>
            <input
              type="number"
              min="3"
              max="15"
              {...register("glasgowTotal", { valueAsNumber: true })}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg)",
              }}
              readOnly
            />
          </div>
        </div>
      </section>
    </div>
  );
}
