import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { USER_ROLE_LABELS } from "@/domain/modules/users/models/User";
import { WcModuleHeader } from "@/presentation/modules/shared/components/ui/webcomponents/Headers/WcModuleHeader";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { KpiCard } from "@/presentation/modules/reports/components/widgets/KpiCard";
import { LineChartCard } from "@/presentation/modules/reports/components/widgets/LineChartCard";
import { BarChartCard } from "@/presentation/modules/reports/components/widgets/BarChartCard";
import {
  useEvolutionVolume,
  useGeneralKpis,
  useTopDiagnoses,
} from "@/presentation/modules/reports/hooks/useReports";
import {
  computePresetRange,
  formatBucketLabel,
  suggestGranularity,
} from "@/presentation/modules/reports/utils/dateRange";
import "./DashboardPage.css";

const FIXED_PRESET = "last30" as const;

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const rangeOnly = useMemo(() => computePresetRange(FIXED_PRESET), []);
  const granularity = useMemo(() => suggestGranularity(rangeOnly), [rangeOnly]);
  const range = useMemo(
    () => ({ ...rangeOnly, granularity }),
    [rangeOnly, granularity],
  );

  const { data: kpis, isLoading: kpisLoading } = useGeneralKpis(rangeOnly);
  const { data: volume, isLoading: volumeLoading } = useEvolutionVolume(range);
  const { data: topDiagnoses, isLoading: diagnosesLoading } = useTopDiagnoses(
    rangeOnly,
    { limit: 5 },
  );

  const volumeData = useMemo(
    () =>
      (volume ?? []).map((point) => ({
        bucket: formatBucketLabel(point.bucket, granularity),
        total: point.total,
        closed: point.closedCount,
      })),
    [volume, granularity],
  );

  const topDiagnosesData = useMemo(
    () =>
      (topDiagnoses ?? []).map((d) => ({
        label: `${d.code} - ${
          d.description.length > 28 ? `${d.description.slice(0, 28)}…` : d.description
        }`,
        value: d.total,
      })),
    [topDiagnoses],
  );

  if (!user) return null;

  return (
    <div className="dashboard-page">
      <WcModuleHeader
        moduleName="Panel principal"
        moduleIcon="icon-dashboard"
        title={`Hola, ${user.firstName || user.email}`}
        description="Resumen rapido de la operacion clinica de los ultimos 30 dias. Para reportes detallados visita la seccion Reportes."
      >
        <WcButton variant="primary" onClick={() => navigate("/reportes")}>
          <Icon name="icon-reports" size={14} />
          Ver reportes detallados
        </WcButton>
      </WcModuleHeader>

      <div className="kpi-grid">
        <KpiCard
          label="Pacientes registrados"
          value={kpis?.patientsTotal ?? null}
          hint={`Activos en el sistema`}
          icon="icon-patient"
          isLoading={kpisLoading}
        />
        <KpiCard
          label="Pacientes nuevos (30d)"
          value={kpis?.patientsNew ?? null}
          delta={KpiCard.computeDelta(kpis?.patientsNew, kpis?.patientsNewPrev)}
          icon="icon-user-plus"
          isLoading={kpisLoading}
        />
        <KpiCard
          label="Evoluciones (30d)"
          value={kpis?.evolutionsNew ?? null}
          delta={KpiCard.computeDelta(kpis?.evolutionsNew, kpis?.evolutionsNewPrev)}
          icon="icon-medical-evolution"
          isLoading={kpisLoading}
        />
        <KpiCard
          label="Evoluciones abiertas"
          value={kpis?.evolutionsOpen ?? null}
          hint={
            kpis?.avgCloseMinutes !== null && kpis?.avgCloseMinutes !== undefined
              ? `Tiempo promedio de cierre: ${(kpis.avgCloseMinutes / 60).toFixed(1)} h`
              : "Sin cierres registrados"
          }
          icon="icon-file-time"
          isLoading={kpisLoading}
        />
      </div>

      <div className="dashboard-page__charts">
        <LineChartCard
          title="Volumen de evoluciones"
          subtitle="Atenciones totales y cerradas por dia"
          xKey="bucket"
          series={[
            { key: "total", label: "Totales" },
            { key: "closed", label: "Cerradas" },
          ]}
          data={volumeData}
          isLoading={volumeLoading}
        />
        <BarChartCard
          title="Top 5 diagnosticos"
          subtitle="CIE-10 mas frecuentes en el periodo"
          data={topDiagnosesData}
          isLoading={diagnosesLoading}
          layout="vertical"
          colorByIndex
          height={280}
        />
      </div>

      <div className="card" style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ marginTop: 0 }}>Tu perfil</h3>
          <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
            <strong style={{ color: "var(--color-text)" }}>{user.firstName} {user.lastName}</strong>
            {" - "}
            <span>{USER_ROLE_LABELS[user.role]}</span>
            {" - "}
            <span>{user.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
