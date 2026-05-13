import { useFormContext } from "react-hook-form";
import type { UpdateEvolutionDraftFormValues } from "../../schemas/evolution.schema";
import { WcCheckbox } from "@/presentation/modules/shared/components/ui/webcomponents/Checkbox/WcCheckbox";

export function TabEmergenciaObstetrica() {
  const { register } = useFormContext<UpdateEvolutionDraftFormValues>();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
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
          3. Emergencia Obstétrica
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
              Gestas
            </label>
            <input
              type="number"
              {...register("gestations", { valueAsNumber: true })}
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
              Partos
            </label>
            <input
              type="number"
              {...register("parturitions", { valueAsNumber: true })}
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
              Abortos
            </label>
            <input
              type="number"
              {...register("abortions", { valueAsNumber: true })}
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
              Cesáreas
            </label>
            <input
              type="number"
              {...register("cesareans", { valueAsNumber: true })}
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
              Fecha Última Menstruación
            </label>
            <input
              type="date"
              {...register("lastMenstruationDate")}
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
              Semanas Gestación
            </label>
            <input
              type="number"
              {...register("gestationalWeeks", { valueAsNumber: true })}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              marginTop: "16px",
            }}
          >
            <WcCheckbox {...register("fetalMovement")} label="Movimiento Fetal" />
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
              Frec. Cardíaca Fetal
            </label>
            <input
              type="number"
              {...register("fetalHeartRate", { valueAsNumber: true })}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
              }}
            />
          </div>

          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              gap: "16px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <WcCheckbox {...register("rupturedMembranes")} label="Membranas Rotas" />
            <input
              type="text"
              {...register("rupturedTime")}
              placeholder="Tiempo de ruptura"
              style={{
                flex: 1,
                minWidth: "200px",
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
              Altura Uterina
            </label>
            <input
              type="number"
              step="0.1"
              {...register("uterineHeight", { valueAsNumber: true })}
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
              Presentación
            </label>
            <input
              type="text"
              {...register("presentation")}
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
              Dilatación
            </label>
            <input
              type="number"
              {...register("dilation", { valueAsNumber: true })}
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
              Borramiento
            </label>
            <input
              type="number"
              {...register("effacement", { valueAsNumber: true })}
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
              Plano
            </label>
            <input
              type="text"
              {...register("plane")}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              gridColumn: "1 / -1",
              marginTop: "8px",
            }}
          >
            <div style={{ display: "flex", gap: "var(--space-6)", flexWrap: "wrap" }}>
              <WcCheckbox {...register("usefulPelvis")} label="Pelvis Útil" />
              <WcCheckbox {...register("vaginalBleeding")} label="Sangrado Vaginal" />
              <WcCheckbox {...register("contractions")} label="Contracciones" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
