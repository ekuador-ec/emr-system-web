import type { ReportsRepository } from "@/domain/modules/reports/repositories/ReportsRepository";
import type {
  ReportRange,
  ReportRangeOnly,
} from "@/domain/modules/reports/models/ReportRange";
import type {
  DemographicBuckets,
  EvolutionVolumePoint,
  GeneralKpis,
  TopDiagnosesFilters,
  TopDiagnosis,
} from "@/domain/modules/reports/models/BusinessKpis";
import type {
  EvolutionCloseStats,
  EvolutionDistribution,
} from "@/domain/modules/reports/models/ClinicalActivity";
import type {
  DiagnosesByChapter,
  DiagnosesChapterFilters,
  DiagnosesSummary,
} from "@/domain/modules/reports/models/DiagnosesInsights";
import type {
  ClinicianProductivityFilters,
  ClinicianProductivityRow,
  WorkloadHeatmapCell,
} from "@/domain/modules/reports/models/AdminInsights";
import type {
  MetricSeriesPoint,
  MetricSeriesRequest,
} from "@/domain/modules/reports/models/MetricSeries";
import { supabase } from "@/infrastructure/core/supabaseClient";
import { ReportsMapper } from "../mappers/reportsMapper";

export class SupabaseReportsRepository implements ReportsRepository {
  async getGeneralKpis(range: ReportRangeOnly): Promise<GeneralKpis> {
    const { data, error } = await supabase.rpc("report_general_kpis", {
      p_from: range.from,
      p_to: range.to,
    });

    if (error) {
      throw new Error(error.message);
    }

    const rows = Array.isArray(data) ? data : [];
    if (rows.length === 0) {
      return {
        patientsTotal: 0,
        patientsNew: 0,
        patientsNewPrev: 0,
        medicalRecordsTotal: 0,
        medicalRecordsNew: 0,
        medicalRecordsNewPrev: 0,
        evolutionsTotal: 0,
        evolutionsNew: 0,
        evolutionsNewPrev: 0,
        evolutionsClosed: 0,
        evolutionsOpen: 0,
        avgCloseMinutes: null,
      };
    }

    return ReportsMapper.toGeneralKpis(rows[0]);
  }

  async getEvolutionVolume(range: ReportRange): Promise<EvolutionVolumePoint[]> {
    const { data, error } = await supabase.rpc("report_evolution_volume", {
      p_from: range.from,
      p_to: range.to,
      p_granularity: range.granularity,
    });

    if (error) {
      throw new Error(error.message);
    }

    return ReportsMapper.toEvolutionVolume(Array.isArray(data) ? data : []);
  }

  async getPatientDemographics(
    range: ReportRangeOnly,
  ): Promise<DemographicBuckets> {
    const { data, error } = await supabase.rpc("report_patient_demographics", {
      p_from: range.from,
      p_to: range.to,
    });

    if (error) {
      throw new Error(error.message);
    }

    const rows = Array.isArray(data) ? data : [];
    if (rows.length === 0) {
      return {
        byGender: {},
        byAgeGroup: {},
        byCulturalGroup: {},
        byInsurance: {},
        total: 0,
      };
    }

    return ReportsMapper.toDemographics(rows[0]);
  }

  async getTopDiagnoses(
    range: ReportRangeOnly,
    filters?: TopDiagnosesFilters,
  ): Promise<TopDiagnosis[]> {
    const { data, error } = await supabase.rpc("report_top_diagnoses", {
      p_from: range.from,
      p_to: range.to,
      p_limit: filters?.limit ?? 10,
      p_type: filters?.type ?? null,
      p_certainty: filters?.certainty ?? null,
    });

    if (error) {
      throw new Error(error.message);
    }

    return ReportsMapper.toTopDiagnoses(Array.isArray(data) ? data : []);
  }

  async getEvolutionDistribution(
    range: ReportRangeOnly,
  ): Promise<EvolutionDistribution> {
    const { data, error } = await supabase.rpc("report_evolution_distribution", {
      p_from: range.from,
      p_to: range.to,
    });

    if (error) {
      throw new Error(error.message);
    }

    const rows = Array.isArray(data) ? data : [];
    if (rows.length === 0) {
      return {
        byStatus: {},
        byArrival: {},
        byClinicalCause: {},
        byDischarge: {},
        total: 0,
      };
    }

    return ReportsMapper.toEvolutionDistribution(rows[0]);
  }

  async getEvolutionCloseStats(
    range: ReportRangeOnly,
  ): Promise<EvolutionCloseStats> {
    const { data, error } = await supabase.rpc("report_evolution_close_stats", {
      p_from: range.from,
      p_to: range.to,
    });

    if (error) {
      throw new Error(error.message);
    }

    const rows = Array.isArray(data) ? data : [];
    if (rows.length === 0) {
      return {
        closedCount: 0,
        openCount: 0,
        openOver24h: 0,
        openOver72h: 0,
        avgCloseMinutes: null,
        medianCloseMinutes: null,
        p90CloseMinutes: null,
      };
    }

    return ReportsMapper.toEvolutionCloseStats(rows[0]);
  }

  async getDiagnosesByChapter(
    range: ReportRangeOnly,
    filters?: DiagnosesChapterFilters,
  ): Promise<DiagnosesByChapter[]> {
    const { data, error } = await supabase.rpc("report_diagnoses_by_chapter", {
      p_from: range.from,
      p_to: range.to,
      p_type: filters?.type ?? null,
      p_certainty: filters?.certainty ?? null,
    });

    if (error) {
      throw new Error(error.message);
    }

    return ReportsMapper.toDiagnosesByChapter(Array.isArray(data) ? data : []);
  }

  async getDiagnosesSummary(range: ReportRangeOnly): Promise<DiagnosesSummary> {
    const { data, error } = await supabase.rpc("report_diagnoses_summary", {
      p_from: range.from,
      p_to: range.to,
    });

    if (error) {
      throw new Error(error.message);
    }

    const rows = Array.isArray(data) ? data : [];
    if (rows.length === 0) {
      return {
        total: 0,
        ingresoTotal: 0,
        altaTotal: 0,
        presuntivoTotal: 0,
        definitivoTotal: 0,
        evolutionsWithDx: 0,
        evolutionsWithAlta: 0,
        pctAltaDx: 0,
        pctDefinitivos: 0,
      };
    }

    return ReportsMapper.toDiagnosesSummary(rows[0]);
  }

  async getClinicianProductivity(
    range: ReportRangeOnly,
    filters?: ClinicianProductivityFilters,
  ): Promise<ClinicianProductivityRow[]> {
    const { data, error } = await supabase.rpc("report_clinician_productivity", {
      p_from: range.from,
      p_to: range.to,
      p_role: filters?.role ?? null,
    });

    if (error) {
      throw new Error(error.message);
    }

    return ReportsMapper.toClinicianProductivity(Array.isArray(data) ? data : []);
  }

  async getWorkloadHeatmap(range: ReportRangeOnly): Promise<WorkloadHeatmapCell[]> {
    const { data, error } = await supabase.rpc("report_workload_heatmap", {
      p_from: range.from,
      p_to: range.to,
    });

    if (error) {
      throw new Error(error.message);
    }

    return ReportsMapper.toWorkloadHeatmap(Array.isArray(data) ? data : []);
  }

  async getMetricSeries(request: MetricSeriesRequest): Promise<MetricSeriesPoint[]> {
    const { data, error } = await supabase.rpc("report_metric_series", {
      p_key: request.key,
      p_from: request.from,
      p_to: request.to,
      p_dims: request.dims ?? null,
    });

    if (error) {
      throw new Error(error.message);
    }

    return ReportsMapper.toMetricSeries(Array.isArray(data) ? data : []);
  }
}
