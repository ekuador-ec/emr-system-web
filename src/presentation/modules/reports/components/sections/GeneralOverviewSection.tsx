import { useMemo } from "react";
import { KpiCard } from "../widgets/KpiCard";
import { LineChartCard } from "../widgets/LineChartCard";
import { DonutChartCard } from "../widgets/DonutChartCard";
import { BarChartCard } from "../widgets/BarChartCard";
import {
  useEvolutionVolume,
  useGeneralKpis,
  usePatientDemographics,
  useTopDiagnoses,
} from "../../hooks/useReports";
import { useReportsUIStore } from "../../stores/useReportsUIStore";
import { formatBucketLabel } from "../../utils/dateRange";
import {
  labelAgeGroup,
  labelCulturalGroup,
  labelGender,
  labelInsurance,
} from "../../utils/reportLabels";

const AGE_GROUP_ORDER = ["0-4", "5-14", "15-29", "30-44", "45-64", "65+", "SIN_DATO"];

type Labeler = (key: string) => string;

function bucketsToChartData(
  buckets: Record<string, number>,
  options?: { order?: string[]; labeler?: Labeler },
) {
  const order = options?.order;
  const labeler = options?.labeler ?? ((k: string) => k);
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

export function GeneralOverviewSection() {
  const { range, granularity } = useReportsUIStore();
  const rangeOnly = useMemo(() => ({ from: range.from, to: range.to }), [range]);
  const fullRange = useMemo(
    () => ({ from: range.from, to: range.to, granularity }),
    [range, granularity],
  );

  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useGeneralKpis(rangeOnly);
  const { data: volume, isLoading: volumeLoading } = useEvolutionVolume(fullRange);
  const { data: demographics, isLoading: demographicsLoading } =
    usePatientDemographics(rangeOnly);
  const { data: topDiagnoses, isLoading: diagnosesLoading } = useTopDiagnoses(
    rangeOnly,
    { limit: 10 },
  );

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

  const genderData = useMemo(
    () => bucketsToChartData(demographics?.byGender ?? {}, { labeler: labelGender }),
    [demographics],
  );
  const ageData = useMemo(
    () =>
      bucketsToChartData(demographics?.byAgeGroup ?? {}, {
        order: AGE_GROUP_ORDER,
        labeler: labelAgeGroup,
      }),
    [demographics],
  );
  const insuranceData = useMemo(
    () => bucketsToChartData(demographics?.byInsurance ?? {}, { labeler: labelInsurance }),
    [demographics],
  );
  const culturalData = useMemo(
    () =>
      bucketsToChartData(demographics?.byCulturalGroup ?? {}, {
        labeler: labelCulturalGroup,
      }),
    [demographics],
  );

  const topDiagnosesData = useMemo(
    () =>
      (topDiagnoses ?? []).map((d) => ({
        label: `${d.code} - ${d.description.slice(0, 36)}${d.description.length > 36 ? "…" : ""}`,
        value: d.total,
      })),
    [topDiagnoses],
  );

  if (kpisError) {
    return (
      <div
        className="card"
        style={{
          padding: "var(--space-6)",
          textAlign: "center",
          color: "var(--color-danger)",
        }}
      >
        {kpisError instanceof Error ? kpisError.message : "Error cargando los reportes."}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <div className="kpi-grid">
        <KpiCard
          label="Pacientes nuevos"
          value={kpis?.patientsNew ?? null}
          delta={KpiCard.computeDelta(kpis?.patientsNew, kpis?.patientsNewPrev)}
          icon="icon-user-plus"
          isLoading={kpisLoading}
        />
        <KpiCard
          label="Historias creadas"
          value={kpis?.medicalRecordsNew ?? null}
          delta={KpiCard.computeDelta(
            kpis?.medicalRecordsNew,
            kpis?.medicalRecordsNewPrev,
          )}
          icon="icon-clinical-history"
          isLoading={kpisLoading}
        />
        <KpiCard
          label="Evoluciones"
          value={kpis?.evolutionsNew ?? null}
          delta={KpiCard.computeDelta(kpis?.evolutionsNew, kpis?.evolutionsNewPrev)}
          icon="icon-medical-evolution"
          isLoading={kpisLoading}
        />
        <KpiCard
          label="Evoluciones cerradas"
          value={kpis?.evolutionsClosed ?? null}
          icon="icon-check"
          hint={
            kpis?.avgCloseMinutes !== null && kpis?.avgCloseMinutes !== undefined
              ? `Tiempo promedio: ${(kpis.avgCloseMinutes / 60).toFixed(1)} h`
              : "Sin cierres en el periodo"
          }
          isLoading={kpisLoading}
        />
        <KpiCard
          label="Pacientes registrados (total)"
          value={kpis?.patientsTotal ?? null}
          icon="icon-patient"
          hint="Pacientes activos en el sistema"
          isLoading={kpisLoading}
        />
        <KpiCard
          label="Evoluciones abiertas"
          value={kpis?.evolutionsOpen ?? null}
          icon="icon-file-time"
          hint="Pendientes de cerrar"
          isLoading={kpisLoading}
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
          title="Distribucion por genero"
          subtitle="Pacientes registrados en el periodo"
          data={genderData}
          isLoading={demographicsLoading}
          totalLabel="Total"
        />
        <BarChartCard
          title="Pacientes por grupo etario"
          subtitle="Edad al momento del registro"
          data={ageData}
          isLoading={demographicsLoading}
          colorByIndex
        />
        <DonutChartCard
          title="Tipo de seguro"
          subtitle="Cobertura declarada"
          data={insuranceData}
          isLoading={demographicsLoading}
        />
        <DonutChartCard
          title="Autoidentificacion cultural"
          subtitle="Grupo cultural declarado"
          data={culturalData}
          isLoading={demographicsLoading}
        />
      </div>

      <BarChartCard
        title="Top 10 diagnosticos"
        subtitle="CIE-10 mas frecuentes en el periodo"
        data={topDiagnosesData}
        isLoading={diagnosesLoading}
        layout="vertical"
        height={Math.max(280, topDiagnosesData.length * 36)}
      />
    </div>
  );
}
