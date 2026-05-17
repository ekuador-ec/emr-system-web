import { useMemo, useState } from "react";
import { KpiCard } from "../widgets/KpiCard";
import { DonutChartCard } from "../widgets/DonutChartCard";
import { BarChartCard } from "../widgets/BarChartCard";
import { RankingTableCard } from "../widgets/RankingTableCard";
import type { RankingRow } from "../widgets/RankingTableCard";
import { ExportCsvButton } from "../widgets/ExportCsvButton";
import { SegmentedControl } from "../filters/SegmentedControl";
import type { SegmentedOption } from "../filters/SegmentedControl";
import {
  useDiagnosesByChapter,
  useDiagnosesSummary,
  useTopDiagnoses,
} from "../../hooks/useReports";
import { useReportsUIStore } from "../../stores/useReportsUIStore";
import type {
  DiagnosisCertainty,
  DiagnosisType,
  TopDiagnosis,
} from "@/domain/modules/reports/models/BusinessKpis";
import type { DiagnosesByChapter } from "@/domain/modules/reports/models/DiagnosesInsights";

const TYPE_OPTIONS: Array<SegmentedOption<DiagnosisType>> = [
  { value: null, label: "Todos" },
  { value: "INGRESO", label: "Ingreso" },
  { value: "ALTA", label: "Alta" },
];

const CERTAINTY_OPTIONS: Array<SegmentedOption<DiagnosisCertainty>> = [
  { value: null, label: "Todas" },
  { value: "PRESUNTIVO", label: "Presuntivo" },
  { value: "DEFINITIVO", label: "Definitivo" },
];

export function DiagnosesInsightsSection() {
  const { range } = useReportsUIStore();
  const rangeOnly = useMemo(() => ({ from: range.from, to: range.to }), [range]);

  const [type, setType] = useState<DiagnosisType | null>(null);
  const [certainty, setCertainty] = useState<DiagnosisCertainty | null>(null);

  const filters = useMemo(
    () => ({
      type: type ?? undefined,
      certainty: certainty ?? undefined,
    }),
    [type, certainty],
  );

  const { data: summary, isLoading: summaryLoading } = useDiagnosesSummary(rangeOnly);
  const { data: chapters, isLoading: chaptersLoading } = useDiagnosesByChapter(
    rangeOnly,
    filters,
  );
  const { data: top, isLoading: topLoading } = useTopDiagnoses(rangeOnly, {
    ...filters,
    limit: 20,
  });

  const chaptersDonutData = useMemo(
    () =>
      (chapters ?? []).slice(0, 8).map((c) => ({
        label: `${c.chapterCode} - ${
          c.chapterName.length > 32
            ? `${c.chapterName.slice(0, 32)}…`
            : c.chapterName
        }`,
        value: c.total,
      })),
    [chapters],
  );

  const chaptersBarData = useMemo(
    () =>
      (chapters ?? []).map((c) => ({
        label: c.chapterName.length > 36 ? `${c.chapterName.slice(0, 36)}…` : c.chapterName,
        value: c.total,
      })),
    [chapters],
  );

  const topRows: RankingRow[] = useMemo(
    () =>
      (top ?? []).map((d) => ({
        id: d.cie10Id,
        label: d.description,
        sublabel: `${d.code}${d.chapterName ? ` - ${d.chapterName}` : ""}`,
        value: d.total,
        percentage: d.percentage,
      })),
    [top],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <div
        style={{
          display: "flex",
          gap: "var(--space-4)",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <SegmentedControl
          label="Tipo"
          options={TYPE_OPTIONS}
          value={type}
          onChange={setType}
        />
        <SegmentedControl
          label="Certeza"
          options={CERTAINTY_OPTIONS}
          value={certainty}
          onChange={setCertainty}
        />
      </div>

      <div className="kpi-grid">
        <KpiCard
          label="Diagnosticos registrados"
          value={summary?.total ?? null}
          icon="icon-stethoscope"
          hint="En el rango seleccionado"
          isLoading={summaryLoading}
        />
        <KpiCard
          label="De ingreso vs. alta"
          value={
            summary
              ? `${summary.ingresoTotal} / ${summary.altaTotal}`
              : null
          }
          icon="icon-medical-evolution"
          hint="Ingreso / Alta"
          isLoading={summaryLoading}
        />
        <KpiCard
          label="% definitivos"
          value={summary ? `${summary.pctDefinitivos.toFixed(1)}%` : null}
          icon="icon-check-double"
          hint="Calidad diagnostica"
          isLoading={summaryLoading}
        />
        <KpiCard
          label="% evoluciones con alta"
          value={summary ? `${summary.pctAltaDx.toFixed(1)}%` : null}
          icon="icon-check"
          hint="Cierre con diagnostico de alta"
          isLoading={summaryLoading}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        <DonutChartCard
          title="Diagnosticos por capitulo"
          subtitle="Top 8 capitulos CIE-10"
          data={chaptersDonutData}
          isLoading={chaptersLoading}
          totalLabel="Total"
        />
        <BarChartCard
          title="Capitulos CIE-10"
          subtitle="Volumen total por capitulo"
          data={chaptersBarData}
          isLoading={chaptersLoading}
          layout="vertical"
          height={Math.max(280, chaptersBarData.length * 32)}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <ExportCsvButton<DiagnosesByChapter>
          rows={chapters ?? []}
          columns={[
            { header: "Codigo capitulo", accessor: (r) => r.chapterCode },
            { header: "Capitulo", accessor: (r) => r.chapterName },
            { header: "Total", accessor: (r) => r.total },
            { header: "Porcentaje", accessor: (r) => r.percentage },
          ]}
          filenameBase={`diagnosticos_por_capitulo_${range.from}_${range.to}`}
          label="Exportar capitulos (CSV)"
        />
      </div>

      <RankingTableCard
        title="Top 20 diagnosticos"
        subtitle="Los CIE-10 mas frecuentes en el periodo"
        rows={topRows}
        metricLabel="Diagnosticos"
        isLoading={topLoading}
        actions={
          <ExportCsvButton<TopDiagnosis>
            rows={top ?? []}
            columns={[
              { header: "Codigo CIE-10", accessor: (r) => r.code },
              { header: "Descripcion", accessor: (r) => r.description },
              { header: "Capitulo", accessor: (r) => r.chapterName ?? "" },
              { header: "Total", accessor: (r) => r.total },
              { header: "Porcentaje", accessor: (r) => r.percentage },
            ]}
            filenameBase={`top_diagnosticos_${range.from}_${range.to}`}
          />
        }
      />
    </div>
  );
}
