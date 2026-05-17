import { useMemo } from "react";
import { WcModuleHeader } from "@/presentation/modules/shared/components/ui/webcomponents/Headers/WcModuleHeader";
import { WcTabsFolder } from "@/presentation/modules/shared/components/ui/webcomponents/Tabs/wcTabsFolder";
import type { WcTabsFolderItem } from "@/presentation/modules/shared/components/ui/webcomponents/Tabs/wcTabsFolder";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { ReportDateRangeFilter } from "../components/filters/ReportDateRangeFilter";
import { GeneralOverviewSection } from "../components/sections/GeneralOverviewSection";
import { ClinicalActivitySection } from "../components/sections/ClinicalActivitySection";
import { DiagnosesInsightsSection } from "../components/sections/DiagnosesInsightsSection";
import { HistoricalTrendsSection } from "../components/sections/HistoricalTrendsSection";
import { AdminProductivitySection } from "../components/sections/AdminProductivitySection";
import { AdminWorkloadSection } from "../components/sections/AdminWorkloadSection";
import { useReportsUIStore } from "../stores/useReportsUIStore";
import { useReportsRefresh } from "../hooks/useReports";
import "./ReportsPage.css";

export function ReportsPage() {
  const { isAdmin } = useAuth();
  const { preset, range, granularity, setPreset, setCustomRange, setGranularity } =
    useReportsUIStore();
  const refresh = useReportsRefresh();

  const tabs: WcTabsFolderItem[] = useMemo(() => {
    const common: WcTabsFolderItem[] = [
      {
        name: "General",
        icon: <Icon name="icon-dashboard" size={14} />,
        content: <GeneralOverviewSection />,
      },
      {
        name: "Actividad clinica",
        icon: <Icon name="icon-medical-evolution" size={14} />,
        content: <ClinicalActivitySection />,
      },
      {
        name: "Diagnosticos",
        icon: <Icon name="icon-stethoscope" size={14} />,
        content: <DiagnosesInsightsSection />,
      },
      {
        name: "Tendencias historicas",
        icon: <Icon name="icon-trend-up" size={14} />,
        content: <HistoricalTrendsSection />,
      },
    ];

    if (!isAdmin) return common;

    return [
      ...common,
      {
        name: "Productividad",
        icon: <Icon name="icon-users" size={14} />,
        content: <AdminProductivitySection />,
      },
      {
        name: "Carga y picos",
        icon: <Icon name="icon-clock" size={14} />,
        content: <AdminWorkloadSection />,
      },
    ];
  }, [isAdmin]);

  return (
    <div className="reports-page">
      <WcModuleHeader
        moduleName="Analitica"
        moduleIcon="icon-reports"
        title="Reportes"
        description="Estadisticas e indicadores del centro asistencial. Selecciona un rango de fechas para actualizar las visualizaciones."
      >
        <WcButton variant="terciary" onClick={refresh} title="Recargar datos">
          <Icon name="icon-refresh" size={14} />
          Actualizar
        </WcButton>
      </WcModuleHeader>

      <ReportDateRangeFilter
        preset={preset}
        range={range}
        granularity={granularity}
        onPresetChange={setPreset}
        onCustomRangeChange={setCustomRange}
        onGranularityChange={setGranularity}
      />

      <WcTabsFolder tabs={tabs} />
    </div>
  );
}
