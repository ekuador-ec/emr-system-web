import type { ReportRange, ReportRangeOnly } from "../models/ReportRange";
import type {
  GeneralKpis,
  EvolutionVolumePoint,
  DemographicBuckets,
  TopDiagnosis,
  TopDiagnosesFilters,
} from "../models/BusinessKpis";
import type {
  EvolutionDistribution,
  EvolutionCloseStats,
} from "../models/ClinicalActivity";
import type {
  DiagnosesByChapter,
  DiagnosesChapterFilters,
  DiagnosesSummary,
} from "../models/DiagnosesInsights";
import type {
  ClinicianProductivityFilters,
  ClinicianProductivityRow,
  WorkloadHeatmapCell,
} from "../models/AdminInsights";
import type {
  MetricSeriesPoint,
  MetricSeriesRequest,
} from "../models/MetricSeries";

export interface ReportsRepository {
  getGeneralKpis(range: ReportRangeOnly): Promise<GeneralKpis>;
  getEvolutionVolume(range: ReportRange): Promise<EvolutionVolumePoint[]>;
  getPatientDemographics(range: ReportRangeOnly): Promise<DemographicBuckets>;
  getTopDiagnoses(
    range: ReportRangeOnly,
    filters?: TopDiagnosesFilters,
  ): Promise<TopDiagnosis[]>;
  getEvolutionDistribution(range: ReportRangeOnly): Promise<EvolutionDistribution>;
  getEvolutionCloseStats(range: ReportRangeOnly): Promise<EvolutionCloseStats>;
  getDiagnosesByChapter(
    range: ReportRangeOnly,
    filters?: DiagnosesChapterFilters,
  ): Promise<DiagnosesByChapter[]>;
  getDiagnosesSummary(range: ReportRangeOnly): Promise<DiagnosesSummary>;
  getClinicianProductivity(
    range: ReportRangeOnly,
    filters?: ClinicianProductivityFilters,
  ): Promise<ClinicianProductivityRow[]>;
  getWorkloadHeatmap(range: ReportRangeOnly): Promise<WorkloadHeatmapCell[]>;
  getMetricSeries(request: MetricSeriesRequest): Promise<MetricSeriesPoint[]>;
}
