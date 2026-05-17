import { useMemo } from "react";
import { KpiCard } from "../widgets/KpiCard";
import { BarChartCard } from "../widgets/BarChartCard";
import { HeatmapCard } from "../widgets/HeatmapCard";
import { ExportCsvButton } from "../widgets/ExportCsvButton";
import { useWorkloadHeatmap } from "../../hooks/useReports";
import { useReportsUIStore } from "../../stores/useReportsUIStore";
import type { WorkloadHeatmapCell } from "@/domain/modules/reports/models/AdminInsights";

const WEEKDAY_FULL = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

interface ShiftBucket {
  key: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
  label: string;
  hours: number[];
}

const SHIFTS: ShiftBucket[] = [
  { key: "MORNING", label: "Manana (06-12)", hours: [6, 7, 8, 9, 10, 11] },
  { key: "AFTERNOON", label: "Tarde (12-18)", hours: [12, 13, 14, 15, 16, 17] },
  { key: "EVENING", label: "Noche (18-24)", hours: [18, 19, 20, 21, 22, 23] },
  { key: "NIGHT", label: "Madrugada (00-06)", hours: [0, 1, 2, 3, 4, 5] },
];

export function AdminWorkloadSection() {
  const { range } = useReportsUIStore();
  const rangeOnly = useMemo(() => ({ from: range.from, to: range.to }), [range]);

  const { data: cells, isLoading, error } = useWorkloadHeatmap(rangeOnly);

  const totals = useMemo(() => {
    if (!cells) return null;
    const total = cells.reduce((acc, cell) => acc + cell.total, 0);
    const totalClosed = cells.reduce((acc, cell) => acc + cell.closedCount, 0);

    const byDay = Array.from({ length: 7 }, () => 0);
    cells.forEach((cell) => {
      const day = cell.weekday >= 1 && cell.weekday <= 7 ? cell.weekday - 1 : 0;
      byDay[day] += cell.total;
    });

    const byShift = SHIFTS.map((shift) => ({
      label: shift.label,
      value: cells
        .filter((cell) => shift.hours.includes(cell.hour))
        .reduce((acc, cell) => acc + cell.total, 0),
    }));

    let peakCell = cells[0];
    cells.forEach((cell) => {
      if (!peakCell || cell.total > peakCell.total) {
        peakCell = cell;
      }
    });

    const peakDayIndex = byDay.indexOf(Math.max(...byDay));

    return {
      total,
      totalClosed,
      byDay,
      byShift,
      peakCell,
      peakDayIndex,
    };
  }, [cells]);

  const byDayData = useMemo(
    () =>
      (totals?.byDay ?? []).map((value, index) => ({
        label: WEEKDAY_FULL[index],
        value,
      })),
    [totals],
  );

  if (error) {
    return (
      <div
        className="card"
        style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--color-danger)" }}
      >
        {error instanceof Error ? error.message : "Error al cargar el heatmap."}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <div className="kpi-grid">
        <KpiCard
          label="Atenciones totales"
          value={totals?.total ?? null}
          icon="icon-medical-evolution"
          hint="Volumen del periodo"
          isLoading={isLoading}
        />
        <KpiCard
          label="Atenciones cerradas"
          value={totals?.totalClosed ?? null}
          icon="icon-check"
          hint={
            totals && totals.total > 0
              ? `${((totals.totalClosed / totals.total) * 100).toFixed(1)}% del total`
              : undefined
          }
          isLoading={isLoading}
        />
        <KpiCard
          label="Hora pico"
          value={
            totals?.peakCell
              ? `${WEEKDAY_FULL[totals.peakCell.weekday - 1] ?? ""} ${totals.peakCell.hour
                  .toString()
                  .padStart(2, "0")}h`
              : null
          }
          icon="icon-clock"
          hint={
            totals?.peakCell
              ? `${totals.peakCell.total} atenciones en esa franja`
              : undefined
          }
          isLoading={isLoading}
        />
        <KpiCard
          label="Dia mas cargado"
          value={
            totals && totals.peakDayIndex >= 0
              ? WEEKDAY_FULL[totals.peakDayIndex]
              : null
          }
          icon="icon-trend-up"
          hint={
            totals && totals.peakDayIndex >= 0
              ? `${totals.byDay[totals.peakDayIndex]} atenciones`
              : undefined
          }
          isLoading={isLoading}
        />
      </div>

      <HeatmapCard
        title="Heatmap dia x hora"
        subtitle="Volumen de atenciones por dia de la semana y hora local (America/Guayaquil)"
        cells={cells ?? []}
        isLoading={isLoading}
        actions={
          <ExportCsvButton<WorkloadHeatmapCell>
            rows={cells ?? []}
            columns={[
              {
                header: "Dia de la semana",
                accessor: (r) =>
                  WEEKDAY_FULL[(r.weekday - 1 + 7) % 7] ?? r.weekday.toString(),
              },
              { header: "Hora", accessor: (r) => `${r.hour.toString().padStart(2, "0")}:00` },
              { header: "Total atenciones", accessor: (r) => r.total },
              { header: "Atenciones cerradas", accessor: (r) => r.closedCount },
            ]}
            filenameBase={`heatmap_carga_${range.from}_${range.to}`}
          />
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        <BarChartCard
          title="Atenciones por dia de la semana"
          subtitle="Volumen total por dia"
          data={byDayData}
          isLoading={isLoading}
          colorByIndex
        />
        <BarChartCard
          title="Atenciones por turno"
          subtitle="Distribucion en franjas de 6 horas"
          data={totals?.byShift ?? []}
          isLoading={isLoading}
          colorByIndex
        />
      </div>
    </div>
  );
}
