import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { SupabaseReportsRepository } from "@/infrastructure/modules/reports/repositories/SupabaseReportsRepository";
import { GetGeneralKpisUseCase } from "@/application/modules/reports/use-cases/GetGeneralKpisUseCase";
import { GetEvolutionVolumeUseCase } from "@/application/modules/reports/use-cases/GetEvolutionVolumeUseCase";
import { GetPatientDemographicsUseCase } from "@/application/modules/reports/use-cases/GetPatientDemographicsUseCase";
import { GetTopDiagnosesUseCase } from "@/application/modules/reports/use-cases/GetTopDiagnosesUseCase";
import { GetEvolutionDistributionUseCase } from "@/application/modules/reports/use-cases/GetEvolutionDistributionUseCase";
import { GetEvolutionCloseStatsUseCase } from "@/application/modules/reports/use-cases/GetEvolutionCloseStatsUseCase";
import { GetDiagnosesByChapterUseCase } from "@/application/modules/reports/use-cases/GetDiagnosesByChapterUseCase";
import { GetDiagnosesSummaryUseCase } from "@/application/modules/reports/use-cases/GetDiagnosesSummaryUseCase";
import { GetClinicianProductivityUseCase } from "@/application/modules/reports/use-cases/GetClinicianProductivityUseCase";
import { GetWorkloadHeatmapUseCase } from "@/application/modules/reports/use-cases/GetWorkloadHeatmapUseCase";
import { GetMetricSeriesUseCase } from "@/application/modules/reports/use-cases/GetMetricSeriesUseCase";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import type {
  ReportRange,
  ReportRangeOnly,
} from "@/domain/modules/reports/models/ReportRange";
import type { TopDiagnosesFilters } from "@/domain/modules/reports/models/BusinessKpis";
import type { DiagnosesChapterFilters } from "@/domain/modules/reports/models/DiagnosesInsights";
import type { ClinicianProductivityFilters } from "@/domain/modules/reports/models/AdminInsights";
import type { MetricSeriesRequest } from "@/domain/modules/reports/models/MetricSeries";

const repository = new SupabaseReportsRepository();
const getGeneralKpisUseCase = new GetGeneralKpisUseCase(repository);
const getEvolutionVolumeUseCase = new GetEvolutionVolumeUseCase(repository);
const getPatientDemographicsUseCase = new GetPatientDemographicsUseCase(repository);
const getTopDiagnosesUseCase = new GetTopDiagnosesUseCase(repository);
const getEvolutionDistributionUseCase = new GetEvolutionDistributionUseCase(repository);
const getEvolutionCloseStatsUseCase = new GetEvolutionCloseStatsUseCase(repository);
const getDiagnosesByChapterUseCase = new GetDiagnosesByChapterUseCase(repository);
const getDiagnosesSummaryUseCase = new GetDiagnosesSummaryUseCase(repository);
const getClinicianProductivityUseCase = new GetClinicianProductivityUseCase(repository);
const getWorkloadHeatmapUseCase = new GetWorkloadHeatmapUseCase(repository);
const getMetricSeriesUseCase = new GetMetricSeriesUseCase(repository);

const STALE_KPI = 2 * 60 * 1000;
const STALE_SERIES = 5 * 60 * 1000;
const STALE_HISTORICAL = 60 * 60 * 1000;

export const useGeneralKpis = (range: ReportRangeOnly) => {
  return useQuery({
    queryKey: ["reports", "general-kpis", range.from, range.to],
    queryFn: () => getGeneralKpisUseCase.execute(range),
    enabled: !!range.from && !!range.to,
    staleTime: STALE_KPI,
    refetchOnWindowFocus: false,
  });
};

export const useEvolutionVolume = (range: ReportRange) => {
  return useQuery({
    queryKey: [
      "reports",
      "evolution-volume",
      range.from,
      range.to,
      range.granularity,
    ],
    queryFn: () => getEvolutionVolumeUseCase.execute(range),
    enabled: !!range.from && !!range.to,
    staleTime: STALE_SERIES,
    refetchOnWindowFocus: false,
  });
};

export const usePatientDemographics = (range: ReportRangeOnly) => {
  return useQuery({
    queryKey: ["reports", "patient-demographics", range.from, range.to],
    queryFn: () => getPatientDemographicsUseCase.execute(range),
    enabled: !!range.from && !!range.to,
    staleTime: STALE_SERIES,
    refetchOnWindowFocus: false,
  });
};

export const useTopDiagnoses = (
  range: ReportRangeOnly,
  filters?: TopDiagnosesFilters,
) => {
  return useQuery({
    queryKey: [
      "reports",
      "top-diagnoses",
      range.from,
      range.to,
      filters?.type ?? null,
      filters?.certainty ?? null,
      filters?.limit ?? 10,
    ],
    queryFn: () => getTopDiagnosesUseCase.execute(range, filters),
    enabled: !!range.from && !!range.to,
    staleTime: STALE_SERIES,
    refetchOnWindowFocus: false,
  });
};

export const useEvolutionDistribution = (range: ReportRangeOnly) => {
  return useQuery({
    queryKey: ["reports", "evolution-distribution", range.from, range.to],
    queryFn: () => getEvolutionDistributionUseCase.execute(range),
    enabled: !!range.from && !!range.to,
    staleTime: STALE_SERIES,
    refetchOnWindowFocus: false,
  });
};

export const useEvolutionCloseStats = (range: ReportRangeOnly) => {
  return useQuery({
    queryKey: ["reports", "evolution-close-stats", range.from, range.to],
    queryFn: () => getEvolutionCloseStatsUseCase.execute(range),
    enabled: !!range.from && !!range.to,
    staleTime: STALE_KPI,
    refetchOnWindowFocus: false,
  });
};

export const useDiagnosesByChapter = (
  range: ReportRangeOnly,
  filters?: DiagnosesChapterFilters,
) => {
  return useQuery({
    queryKey: [
      "reports",
      "diagnoses-by-chapter",
      range.from,
      range.to,
      filters?.type ?? null,
      filters?.certainty ?? null,
    ],
    queryFn: () => getDiagnosesByChapterUseCase.execute(range, filters),
    enabled: !!range.from && !!range.to,
    staleTime: STALE_SERIES,
    refetchOnWindowFocus: false,
  });
};

export const useDiagnosesSummary = (range: ReportRangeOnly) => {
  return useQuery({
    queryKey: ["reports", "diagnoses-summary", range.from, range.to],
    queryFn: () => getDiagnosesSummaryUseCase.execute(range),
    enabled: !!range.from && !!range.to,
    staleTime: STALE_KPI,
    refetchOnWindowFocus: false,
  });
};

export const useClinicianProductivity = (
  range: ReportRangeOnly,
  filters?: ClinicianProductivityFilters,
) => {
  const { isAdmin } = useAuth();
  return useQuery({
    queryKey: [
      "reports",
      "clinician-productivity",
      range.from,
      range.to,
      filters?.role ?? null,
    ],
    queryFn: () => getClinicianProductivityUseCase.execute(range, filters),
    enabled: isAdmin && !!range.from && !!range.to,
    staleTime: STALE_SERIES,
    refetchOnWindowFocus: false,
  });
};

export const useWorkloadHeatmap = (range: ReportRangeOnly) => {
  const { isAdmin } = useAuth();
  return useQuery({
    queryKey: ["reports", "workload-heatmap", range.from, range.to],
    queryFn: () => getWorkloadHeatmapUseCase.execute(range),
    enabled: isAdmin && !!range.from && !!range.to,
    staleTime: STALE_SERIES,
    refetchOnWindowFocus: false,
  });
};

export const useMetricSeries = (request: MetricSeriesRequest) => {
  return useQuery({
    queryKey: [
      "reports",
      "metric-series",
      request.key,
      request.from,
      request.to,
      request.dims ?? null,
    ],
    queryFn: () => getMetricSeriesUseCase.execute(request),
    enabled: !!request.key && !!request.from && !!request.to,
    staleTime: STALE_HISTORICAL,
    refetchOnWindowFocus: false,
  });
};

export const useReportsRefresh = () => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["reports"] });
  }, [queryClient]);
};
