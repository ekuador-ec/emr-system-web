import { useMemo, useState } from "react";
import { KpiCard } from "../widgets/KpiCard";
import { BarChartCard } from "../widgets/BarChartCard";
import { ExportCsvButton } from "../widgets/ExportCsvButton";
import { SegmentedControl } from "../filters/SegmentedControl";
import type { SegmentedOption } from "../filters/SegmentedControl";
import { ProductivityTable } from "./ProductivityTable";
import { useClinicianProductivity } from "../../hooks/useReports";
import { useReportsUIStore } from "../../stores/useReportsUIStore";
import {
  USER_ROLE_LABELS,
  type UserRole,
} from "@/domain/modules/users/models/User";
import type { ClinicianProductivityRow } from "@/domain/modules/reports/models/AdminInsights";

const ROLE_OPTIONS: Array<SegmentedOption<UserRole>> = [
  { value: null, label: "Todos" },
  { value: "doctor", label: USER_ROLE_LABELS.doctor },
  { value: "nurse", label: USER_ROLE_LABELS.nurse },
];

export function AdminProductivitySection() {
  const { range } = useReportsUIStore();
  const rangeOnly = useMemo(() => ({ from: range.from, to: range.to }), [range]);
  const [role, setRole] = useState<UserRole | null>(null);

  const filters = useMemo(
    () => ({ role: role ?? undefined }),
    [role],
  );

  const { data, isLoading, error } = useClinicianProductivity(rangeOnly, filters);

  const summary = useMemo(() => {
    if (!data) return null;
    const totalOpened = data.reduce((acc, row) => acc + row.evolutionsOpened, 0);
    const totalClosed = data.reduce((acc, row) => acc + row.evolutionsClosed, 0);
    const totalDx = data.reduce((acc, row) => acc + row.diagnosesCount, 0);
    const activeUsers = data.filter(
      (row) => row.evolutionsOpened + row.evolutionsClosed > 0,
    ).length;
    const closeMinutes = data
      .map((row) => row.avgCloseMinutes)
      .filter((value): value is number => value !== null);
    const avgClose =
      closeMinutes.length === 0
        ? null
        : closeMinutes.reduce((acc, value) => acc + value, 0) / closeMinutes.length;
    return { totalOpened, totalClosed, totalDx, activeUsers, avgClose };
  }, [data]);

  const topClosedData = useMemo(
    () =>
      (data ?? [])
        .slice(0, 10)
        .filter((row) => row.evolutionsClosed > 0)
        .map((row) => ({
          label: row.fullName.length > 24 ? `${row.fullName.slice(0, 24)}…` : row.fullName,
          value: row.evolutionsClosed,
        })),
    [data],
  );

  const topOpenedData = useMemo(
    () =>
      (data ?? [])
        .slice()
        .sort((a, b) => b.evolutionsOpened - a.evolutionsOpened)
        .slice(0, 10)
        .filter((row) => row.evolutionsOpened > 0)
        .map((row) => ({
          label: row.fullName.length > 24 ? `${row.fullName.slice(0, 24)}…` : row.fullName,
          value: row.evolutionsOpened,
        })),
    [data],
  );

  if (error) {
    return (
      <div
        className="card"
        style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--color-danger)" }}
      >
        {error instanceof Error ? error.message : "Error al cargar el reporte."}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <div
        style={{
          display: "flex",
          gap: "var(--space-4)",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <SegmentedControl
          label="Rol"
          options={ROLE_OPTIONS}
          value={role}
          onChange={setRole}
        />
        <ExportCsvButton<ClinicianProductivityRow>
          rows={data ?? []}
          columns={[
            { header: "Clinico", accessor: (r) => r.fullName },
            { header: "Rol", accessor: (r) => USER_ROLE_LABELS[r.role] },
            { header: "Evoluciones abiertas", accessor: (r) => r.evolutionsOpened },
            { header: "Evoluciones cerradas", accessor: (r) => r.evolutionsClosed },
            {
              header: "Tiempo medio de cierre (min)",
              accessor: (r) => r.avgCloseMinutes ?? "",
            },
            { header: "Diagnosticos", accessor: (r) => r.diagnosesCount },
            { header: "Ultima actividad", accessor: (r) => r.lastActivity ?? "" },
          ]}
          filenameBase={`productividad_clinicos_${range.from}_${range.to}`}
        />
      </div>

      <div className="kpi-grid">
        <KpiCard
          label="Clinicos con actividad"
          value={summary?.activeUsers ?? null}
          icon="icon-users"
          hint="Aperturaron o cerraron evoluciones"
          isLoading={isLoading}
        />
        <KpiCard
          label="Evoluciones abiertas (equipo)"
          value={summary?.totalOpened ?? null}
          icon="icon-medical-evolution"
          isLoading={isLoading}
        />
        <KpiCard
          label="Evoluciones cerradas (equipo)"
          value={summary?.totalClosed ?? null}
          icon="icon-check"
          isLoading={isLoading}
        />
        <KpiCard
          label="Tiempo medio de cierre"
          value={
            summary?.avgClose !== null && summary?.avgClose !== undefined
              ? `${(summary.avgClose / 60).toFixed(1)} h`
              : null
          }
          icon="icon-clock"
          hint="Promedio entre clinicos con cierres"
          isLoading={isLoading}
        />
        <KpiCard
          label="Diagnosticos registrados"
          value={summary?.totalDx ?? null}
          icon="icon-stethoscope"
          isLoading={isLoading}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        <BarChartCard
          title="Top 10 - Evoluciones cerradas"
          subtitle="Quien cierra mas atenciones en el rango"
          data={topClosedData}
          isLoading={isLoading}
          layout="vertical"
          height={Math.max(280, topClosedData.length * 32)}
          colorByIndex
        />
        <BarChartCard
          title="Top 10 - Evoluciones abiertas"
          subtitle="Volumen de aperturas (atenciones iniciadas)"
          data={topOpenedData}
          isLoading={isLoading}
          layout="vertical"
          height={Math.max(280, topOpenedData.length * 32)}
          colorByIndex
        />
      </div>

      <ProductivityTable rows={data ?? []} isLoading={isLoading} />
    </div>
  );
}
