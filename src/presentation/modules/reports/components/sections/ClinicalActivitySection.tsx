import { useMemo } from "react";
import { KpiCard } from "../widgets/KpiCard";
import { LineChartCard } from "../widgets/LineChartCard";
import { DonutChartCard } from "../widgets/DonutChartCard";
import { BarChartCard } from "../widgets/BarChartCard";
import {
  useEvolutionCloseStats,
  useEvolutionDistribution,
  useEvolutionVolume,
} from "../../hooks/useReports";
import { useReportsUIStore } from "../../stores/useReportsUIStore";
import { formatBucketLabel } from "../../utils/dateRange";
import {
  labelArrivalMethod,
  labelClinicalCause,
  labelDischargeType,
  labelEvolutionStatus,
} from "../../utils/reportLabels";

type Labeler = (key: string) => string;

const STATUS_ORDER = ["ABIERTA", "EN_PROCESO", "CERRADA"];

function bucketsToChartData(
  buckets: Record<string, number>,
  labeler: Labeler,
  order?: string[],
) {
  const entries = Object.entries(buckets);
  if (order) {
    entries.sort((a, b) => {
      const ai = order.indexOf(a[0]);
      const bi = order.indexOf(b[0]);
      if (ai === -1 && bi === -1) return a[0].localeCompare(b[0]);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  } else {
    entries.sort((a, b) => b[1] - a[1]);
  }
  return entries.map(([key, value]) => ({ label: labeler(key), value }));
}

function formatMinutes(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "--";
  if (value < 60) return `${value.toFixed(0)} min`;
  const hours = value / 60;
  if (hours < 24) return `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} d`;
}

export function ClinicalActivitySection() {
  const { range, granularity } = useReportsUIStore();
  const rangeOnly = useMemo(() => ({ from: range.from, to: range.to }), [range]);
  const fullRange = useMemo(
    () => ({ from: range.from, to: range.to, granularity }),
    [range, granularity],
  );

  const { data: distribution, isLoading: distributionLoading } =
    useEvolutionDistribution(rangeOnly);
  const { data: closeStats, isLoading: closeLoading } =
    useEvolutionCloseStats(rangeOnly);
  const { data: volume, isLoading: volumeLoading } =
    useEvolutionVolume(fullRange);

  const volumeData = useMemo(
    () =>
      (volume ?? []).map((point) => ({
        bucket: formatBucketLabel(point.bucket, granularity),
        total: point.total,
        closed: point.closedCount,
        open: point.openCount,
      })),
    [volume, granularity],
  );

  const byStatusData = useMemo(
    () => bucketsToChartData(distribution?.byStatus ?? {}, labelEvolutionStatus, STATUS_ORDER),
    [distribution],
  );
  const byArrivalData = useMemo(
    () => bucketsToChartData(distribution?.byArrival ?? {}, labelArrivalMethod),
    [distribution],
  );
  const byCauseData = useMemo(
    () => bucketsToChartData(distribution?.byClinicalCause ?? {}, labelClinicalCause),
    [distribution],
  );
  const byDischargeData = useMemo(
    () => bucketsToChartData(distribution?.byDischarge ?? {}, labelDischargeType),
    [distribution],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <div className="kpi-grid">
        <KpiCard
          label="Evoluciones cerradas"
          value={closeStats?.closedCount ?? null}
          icon="icon-check"
          hint="En el rango seleccionado"
          isLoading={closeLoading}
        />
        <KpiCard
          label="Evoluciones abiertas (ahora)"
          value={closeStats?.openCount ?? null}
          icon="icon-file-time"
          hint="Estado ABIERTA o EN_PROCESO"
          isLoading={closeLoading}
        />
        <KpiCard
          label="Abiertas > 24h"
          value={closeStats?.openOver24h ?? null}
          icon="icon-alert-triangle"
          hint="Pendientes de cerrar"
          isLoading={closeLoading}
        />
        <KpiCard
          label="Abiertas > 72h"
          value={closeStats?.openOver72h ?? null}
          icon="icon-alert-circle"
          hint="Atencion prolongada"
          isLoading={closeLoading}
        />
        <KpiCard
          label="Tiempo medio de cierre"
          value={closeStats?.avgCloseMinutes !== null && closeStats?.avgCloseMinutes !== undefined
            ? formatMinutes(closeStats.avgCloseMinutes)
            : null}
          icon="icon-clock"
          hint="Apertura a cierre"
          isLoading={closeLoading}
        />
        <KpiCard
          label="Mediana / P90"
          value={
            closeStats?.medianCloseMinutes !== null && closeStats?.medianCloseMinutes !== undefined
              ? `${formatMinutes(closeStats.medianCloseMinutes)} / ${formatMinutes(closeStats?.p90CloseMinutes ?? null)}`
              : null
          }
          icon="icon-trend-up"
          hint="Distribucion del tiempo de cierre"
          isLoading={closeLoading}
        />
      </div>

      <LineChartCard
        title="Volumen de evoluciones"
        subtitle="Atenciones totales, cerradas y abiertas en el periodo"
        xKey="bucket"
        series={[
          { key: "total", label: "Totales" },
          { key: "closed", label: "Cerradas" },
          { key: "open", label: "Abiertas / En proceso" },
        ]}
        data={volumeData}
        isLoading={volumeLoading}
        height={320}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        <DonutChartCard
          title="Estado de evoluciones"
          subtitle="Distribucion por estado"
          data={byStatusData}
          isLoading={distributionLoading}
        />
        <DonutChartCard
          title="Metodo de arribo"
          subtitle="Como llego el paciente"
          data={byArrivalData}
          isLoading={distributionLoading}
        />
        <BarChartCard
          title="Causa clinica"
          subtitle="Motivo principal de la atencion"
          data={byCauseData}
          isLoading={distributionLoading}
          colorByIndex
        />
        <BarChartCard
          title="Tipo de alta"
          subtitle="Destino al cierre de la evolucion"
          data={byDischargeData}
          isLoading={distributionLoading}
          colorByIndex
        />
      </div>
    </div>
  );
}
