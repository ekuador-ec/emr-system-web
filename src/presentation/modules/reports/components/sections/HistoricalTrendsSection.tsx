import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { ReportDateRangeFilter } from "../filters/ReportDateRangeFilter";
import { KpiCard } from "../widgets/KpiCard";
import { LineChartCard } from "../widgets/LineChartCard";
import { chartColorAt } from "../widgets/chartPalette";
import { GetMetricSeriesUseCase } from "@/application/modules/reports/use-cases/GetMetricSeriesUseCase";
import { SupabaseReportsRepository } from "@/infrastructure/modules/reports/repositories/SupabaseReportsRepository";
import type { MetricKey } from "@/domain/modules/reports/models/MetricSeries";
import type { DateRangePreset } from "../../utils/dateRange";
import {
  computePresetRange,
  formatBucketLabel,
  suggestGranularity,
  type DateRangeValue,
} from "../../utils/dateRange";
import type { ReportGranularity } from "@/domain/modules/reports/models/ReportRange";
import "./HistoricalTrendsSection.css";

interface MetricDef {
  key: MetricKey;
  label: string;
  hint: string;
  aggregation: "sum" | "latest";
}

const METRIC_CATALOG: MetricDef[] = [
  {
    key: "patients.created.daily",
    label: "Pacientes nuevos",
    hint: "Pacientes registrados por dia",
    aggregation: "sum",
  },
  {
    key: "medical_records.created.daily",
    label: "Historias creadas",
    hint: "Historias clinicas iniciadas por dia",
    aggregation: "sum",
  },
  {
    key: "evolutions.created.daily",
    label: "Evoluciones creadas",
    hint: "Atenciones abiertas por dia",
    aggregation: "sum",
  },
  {
    key: "evolutions.closed.daily",
    label: "Evoluciones cerradas",
    hint: "Atenciones cerradas por dia",
    aggregation: "sum",
  },
  {
    key: "diagnoses.created.daily",
    label: "Diagnosticos",
    hint: "Diagnosticos registrados por dia",
    aggregation: "sum",
  },
  {
    key: "messages.created.daily",
    label: "Mensajes",
    hint: "Mensajes enviados por dia",
    aggregation: "sum",
  },
];

const HISTORICAL_PRESETS: DateRangePreset[] = [
  "last30",
  "last90",
  "last180",
  "last365",
  "ytd",
  "lastFullYear",
  "custom",
];

const HISTORICAL_MAX_DAYS = 365;
const DEFAULT_PRESET: DateRangePreset = "last90";

const repository = new SupabaseReportsRepository();
const getMetricSeriesUseCase = new GetMetricSeriesUseCase(repository);

function bucketize(
  points: Array<{ snapshotDate: string; value: number }>,
  granularity: ReportGranularity,
): Map<string, number> {
  const buckets = new Map<string, number>();
  points.forEach((point) => {
    const date = new Date(point.snapshotDate);
    if (Number.isNaN(date.getTime())) return;
    let key: string;
    if (granularity === "month") {
      key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-01`;
    } else if (granularity === "week") {
      const day = date.getDay();
      const monday = new Date(date);
      const diff = day === 0 ? -6 : 1 - day;
      monday.setDate(date.getDate() + diff);
      key = `${monday.getFullYear()}-${(monday.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${monday.getDate().toString().padStart(2, "0")}`;
    } else {
      key = point.snapshotDate;
    }
    buckets.set(key, (buckets.get(key) ?? 0) + point.value);
  });
  return buckets;
}

export function HistoricalTrendsSection() {
  const [preset, setPreset] = useState<DateRangePreset>(DEFAULT_PRESET);
  const [range, setRange] = useState<DateRangeValue>(() =>
    computePresetRange(DEFAULT_PRESET),
  );
  const [granularity, setGranularity] = useState<ReportGranularity>(() =>
    suggestGranularity(computePresetRange(DEFAULT_PRESET)),
  );
  const [selected, setSelected] = useState<Set<MetricKey>>(
    () => new Set<MetricKey>(METRIC_CATALOG.slice(0, 3).map((m) => m.key)),
  );

  const handlePresetChange = (next: DateRangePreset) => {
    setPreset(next);
    const computed = computePresetRange(next);
    setRange(computed);
    setGranularity(suggestGranularity(computed));
  };

  const handleCustomRangeChange = (next: DateRangeValue) => {
    setPreset("custom");
    setRange(next);
    setGranularity(suggestGranularity(next));
  };

  const toggleMetric = (key: MetricKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const seriesQueries = useQueries({
    queries: METRIC_CATALOG.map((metric) => ({
      queryKey: [
        "reports",
        "metric-series",
        metric.key,
        range.from,
        range.to,
        null,
      ],
      queryFn: () =>
        getMetricSeriesUseCase.execute({
          key: metric.key,
          from: range.from,
          to: range.to,
        }),
      enabled: !!range.from && !!range.to,
      staleTime: 60 * 60 * 1000,
      refetchOnWindowFocus: false,
    })),
  });

  const isLoadingAny = seriesQueries.some((q) => q.isLoading);
  const isAllReady = seriesQueries.every((q) => !q.isPending);

  const bucketsByMetric = useMemo(() => {
    const map = new Map<MetricKey, Map<string, number>>();
    METRIC_CATALOG.forEach((metric, index) => {
      const points = seriesQueries[index].data ?? [];
      map.set(metric.key, bucketize(points, granularity));
    });
    return map;
  }, [seriesQueries, granularity]);

  const chartData = useMemo(() => {
    const dateSet = new Set<string>();
    bucketsByMetric.forEach((buckets) => {
      buckets.forEach((_, key) => dateSet.add(key));
    });
    const sortedDates = Array.from(dateSet).sort((a, b) => a.localeCompare(b));

    return sortedDates.map((dateKey) => {
      const row: Record<string, string | number> = {
        bucket: formatBucketLabel(dateKey, granularity),
      };
      METRIC_CATALOG.forEach((metric) => {
        if (!selected.has(metric.key)) return;
        row[metric.key] = bucketsByMetric.get(metric.key)?.get(dateKey) ?? 0;
      });
      return row;
    });
  }, [bucketsByMetric, granularity, selected]);

  const selectedSeries = useMemo(
    () =>
      METRIC_CATALOG.filter((m) => selected.has(m.key)).map((m, index) => ({
        key: m.key,
        label: m.label,
        color: chartColorAt(METRIC_CATALOG.findIndex((it) => it.key === m.key)),
        _seriesIndex: index,
      })),
    [selected],
  );

  const totalsByMetric = useMemo(() => {
    const totals = new Map<MetricKey, number>();
    METRIC_CATALOG.forEach((metric, index) => {
      const points = seriesQueries[index].data ?? [];
      if (metric.aggregation === "latest") {
        const last = points[points.length - 1];
        totals.set(metric.key, last ? last.value : 0);
      } else {
        const sum = points.reduce((acc, p) => acc + p.value, 0);
        totals.set(metric.key, sum);
      }
    });
    return totals;
  }, [seriesQueries]);

  const lastUpdated = useMemo(() => {
    let latest: string | null = null;
    seriesQueries.forEach((q) => {
      (q.data ?? []).forEach((p) => {
        if (!latest || p.snapshotDate > latest) latest = p.snapshotDate;
      });
    });
    return latest;
  }, [seriesQueries]);

  const firstError = seriesQueries.find((q) => q.error)?.error;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <ReportDateRangeFilter
        preset={preset}
        range={range}
        granularity={granularity}
        onPresetChange={handlePresetChange}
        onCustomRangeChange={handleCustomRangeChange}
        onGranularityChange={setGranularity}
        presets={HISTORICAL_PRESETS}
        maxDays={HISTORICAL_MAX_DAYS}
        title="Periodo historico"
      />

      {firstError ? (
        <div
          className="card"
          style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--color-danger)" }}
        >
          {firstError instanceof Error ? firstError.message : "Error al cargar las series."}
        </div>
      ) : null}

      <div className="kpi-grid">
        {METRIC_CATALOG.slice(0, 4).map((metric) => (
          <KpiCard
            key={metric.key}
            label={metric.label}
            value={totalsByMetric.get(metric.key) ?? null}
            hint={metric.hint}
            icon="icon-trend-up"
            isLoading={isLoadingAny}
          />
        ))}
      </div>

      <div className="trends-metric-toggle" role="group" aria-label="Metricas visibles">
        {METRIC_CATALOG.map((metric, index) => {
          const isActive = selected.has(metric.key);
          const color = chartColorAt(index);
          return (
            <button
              key={metric.key}
              type="button"
              className={`trends-metric-toggle__chip${isActive ? " is-active" : ""}`}
              onClick={() => toggleMetric(metric.key)}
              style={
                isActive
                  ? {
                      backgroundColor: `${color}1A`,
                      borderColor: color,
                    }
                  : undefined
              }
              aria-pressed={isActive}
            >
              <span
                className="trends-metric-toggle__chip-dot"
                style={{ backgroundColor: isActive ? color : "var(--color-border)" }}
              />
              {metric.label}
            </button>
          );
        })}
      </div>

      <LineChartCard
        title="Tendencias historicas"
        subtitle={
          lastUpdated
            ? `Datos consolidados hasta ${lastUpdated}. Los snapshots se actualizan diariamente.`
            : "Snapshots diarios consolidados. Actualizacion automatica cada 24 horas."
        }
        xKey="bucket"
        series={selectedSeries.map((s) => ({
          key: s.key,
          label: s.label,
          color: s.color,
        }))}
        data={chartData}
        isLoading={!isAllReady}
        height={360}
      />
    </div>
  );
}
