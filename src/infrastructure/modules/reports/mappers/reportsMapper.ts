import type {
  DemographicBuckets,
  EvolutionVolumePoint,
  GeneralKpis,
  TopDiagnosis,
} from "@/domain/modules/reports/models/BusinessKpis";
import type {
  EvolutionCloseStats,
  EvolutionDistribution,
} from "@/domain/modules/reports/models/ClinicalActivity";
import type {
  DiagnosesByChapter,
  DiagnosesSummary,
} from "@/domain/modules/reports/models/DiagnosesInsights";
import type {
  ClinicianProductivityRow,
  WorkloadHeatmapCell,
} from "@/domain/modules/reports/models/AdminInsights";
import type { MetricSeriesPoint } from "@/domain/modules/reports/models/MetricSeries";
import type {
  AccountStatus,
  UserRole,
} from "@/domain/modules/users/models/User";

interface GeneralKpisRow {
  patients_total: number | string;
  patients_new: number | string;
  patients_new_prev: number | string;
  medical_records_total: number | string;
  medical_records_new: number | string;
  medical_records_new_prev: number | string;
  evolutions_total: number | string;
  evolutions_new: number | string;
  evolutions_new_prev: number | string;
  evolutions_closed: number | string;
  evolutions_open: number | string;
  avg_close_minutes: number | string | null;
}

interface EvolutionVolumeRow {
  bucket: string;
  total: number | string;
  closed_count: number | string;
  open_count: number | string;
}

interface DemographicsRow {
  by_gender: Record<string, number | string> | null;
  by_age_group: Record<string, number | string> | null;
  by_cultural_group: Record<string, number | string> | null;
  by_insurance: Record<string, number | string> | null;
  total: number | string;
}

interface TopDiagnosisRow {
  cie10_id: string;
  code: string;
  description: string;
  chapter_code: string | null;
  chapter_name: string | null;
  total: number | string;
  percentage: number | string;
}

interface EvolutionDistributionRow {
  by_status: Record<string, number | string> | null;
  by_arrival: Record<string, number | string> | null;
  by_clinical_cause: Record<string, number | string> | null;
  by_discharge: Record<string, number | string> | null;
  total: number | string;
}

interface EvolutionCloseStatsRow {
  closed_count: number | string;
  open_count: number | string;
  open_over_24h: number | string;
  open_over_72h: number | string;
  avg_close_minutes: number | string | null;
  median_close_minutes: number | string | null;
  p90_close_minutes: number | string | null;
}

interface DiagnosesByChapterRow {
  chapter_code: string | null;
  chapter_name: string | null;
  total: number | string;
  percentage: number | string;
}

interface DiagnosesSummaryRow {
  total: number | string;
  ingreso_total: number | string;
  alta_total: number | string;
  presuntivo_total: number | string;
  definitivo_total: number | string;
  evolutions_with_dx: number | string;
  evolutions_with_alta: number | string;
  pct_alta_dx: number | string;
  pct_definitivos: number | string;
}

interface ClinicianProductivityRowRaw {
  user_id: string;
  full_name: string | null;
  role: UserRole;
  account_status: AccountStatus;
  evolutions_opened: number | string;
  evolutions_closed: number | string;
  avg_close_minutes: number | string | null;
  diagnoses_count: number | string;
  last_activity: string | null;
}

interface WorkloadHeatmapRow {
  weekday: number | string;
  hour: number | string;
  total: number | string;
  closed_count: number | string;
}

interface MetricSeriesRow {
  snapshot_date: string;
  value: number | string;
  dims: Record<string, unknown> | null;
}

const toNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toBucketRecord = (
  source: Record<string, number | string> | null,
): Record<string, number> => {
  if (!source) return {};
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [key, toNumber(value)]),
  );
};

export const ReportsMapper = {
  toGeneralKpis(row: GeneralKpisRow): GeneralKpis {
    return {
      patientsTotal: toNumber(row.patients_total),
      patientsNew: toNumber(row.patients_new),
      patientsNewPrev: toNumber(row.patients_new_prev),

      medicalRecordsTotal: toNumber(row.medical_records_total),
      medicalRecordsNew: toNumber(row.medical_records_new),
      medicalRecordsNewPrev: toNumber(row.medical_records_new_prev),

      evolutionsTotal: toNumber(row.evolutions_total),
      evolutionsNew: toNumber(row.evolutions_new),
      evolutionsNewPrev: toNumber(row.evolutions_new_prev),
      evolutionsClosed: toNumber(row.evolutions_closed),
      evolutionsOpen: toNumber(row.evolutions_open),

      avgCloseMinutes:
        row.avg_close_minutes === null || row.avg_close_minutes === undefined
          ? null
          : toNumber(row.avg_close_minutes),
    };
  },

  toEvolutionVolume(rows: EvolutionVolumeRow[]): EvolutionVolumePoint[] {
    return rows.map((row) => ({
      bucket: row.bucket,
      total: toNumber(row.total),
      closedCount: toNumber(row.closed_count),
      openCount: toNumber(row.open_count),
    }));
  },

  toDemographics(row: DemographicsRow): DemographicBuckets {
    return {
      byGender: toBucketRecord(row.by_gender),
      byAgeGroup: toBucketRecord(row.by_age_group),
      byCulturalGroup: toBucketRecord(row.by_cultural_group),
      byInsurance: toBucketRecord(row.by_insurance),
      total: toNumber(row.total),
    };
  },

  toTopDiagnoses(rows: TopDiagnosisRow[]): TopDiagnosis[] {
    return rows.map((row) => ({
      cie10Id: row.cie10_id,
      code: row.code,
      description: row.description,
      chapterCode: row.chapter_code,
      chapterName: row.chapter_name,
      total: toNumber(row.total),
      percentage: toNumber(row.percentage),
    }));
  },

  toEvolutionDistribution(row: EvolutionDistributionRow): EvolutionDistribution {
    return {
      byStatus: toBucketRecord(row.by_status),
      byArrival: toBucketRecord(row.by_arrival),
      byClinicalCause: toBucketRecord(row.by_clinical_cause),
      byDischarge: toBucketRecord(row.by_discharge),
      total: toNumber(row.total),
    };
  },

  toEvolutionCloseStats(row: EvolutionCloseStatsRow): EvolutionCloseStats {
    return {
      closedCount: toNumber(row.closed_count),
      openCount: toNumber(row.open_count),
      openOver24h: toNumber(row.open_over_24h),
      openOver72h: toNumber(row.open_over_72h),
      avgCloseMinutes:
        row.avg_close_minutes === null || row.avg_close_minutes === undefined
          ? null
          : toNumber(row.avg_close_minutes),
      medianCloseMinutes:
        row.median_close_minutes === null || row.median_close_minutes === undefined
          ? null
          : toNumber(row.median_close_minutes),
      p90CloseMinutes:
        row.p90_close_minutes === null || row.p90_close_minutes === undefined
          ? null
          : toNumber(row.p90_close_minutes),
    };
  },

  toDiagnosesByChapter(rows: DiagnosesByChapterRow[]): DiagnosesByChapter[] {
    return rows.map((row) => ({
      chapterCode: row.chapter_code ?? "SIN_CAPITULO",
      chapterName: row.chapter_name ?? "Sin capitulo asignado",
      total: toNumber(row.total),
      percentage: toNumber(row.percentage),
    }));
  },

  toDiagnosesSummary(row: DiagnosesSummaryRow): DiagnosesSummary {
    return {
      total: toNumber(row.total),
      ingresoTotal: toNumber(row.ingreso_total),
      altaTotal: toNumber(row.alta_total),
      presuntivoTotal: toNumber(row.presuntivo_total),
      definitivoTotal: toNumber(row.definitivo_total),
      evolutionsWithDx: toNumber(row.evolutions_with_dx),
      evolutionsWithAlta: toNumber(row.evolutions_with_alta),
      pctAltaDx: toNumber(row.pct_alta_dx),
      pctDefinitivos: toNumber(row.pct_definitivos),
    };
  },

  toClinicianProductivity(rows: ClinicianProductivityRowRaw[]): ClinicianProductivityRow[] {
    return rows.map((row) => ({
      userId: row.user_id,
      fullName: (row.full_name ?? "").trim() || "Sin nombre",
      role: row.role,
      accountStatus: row.account_status,
      evolutionsOpened: toNumber(row.evolutions_opened),
      evolutionsClosed: toNumber(row.evolutions_closed),
      avgCloseMinutes:
        row.avg_close_minutes === null || row.avg_close_minutes === undefined
          ? null
          : toNumber(row.avg_close_minutes),
      diagnosesCount: toNumber(row.diagnoses_count),
      lastActivity: row.last_activity,
    }));
  },

  toWorkloadHeatmap(rows: WorkloadHeatmapRow[]): WorkloadHeatmapCell[] {
    return rows.map((row) => ({
      weekday: toNumber(row.weekday),
      hour: toNumber(row.hour),
      total: toNumber(row.total),
      closedCount: toNumber(row.closed_count),
    }));
  },

  toMetricSeries(rows: MetricSeriesRow[]): MetricSeriesPoint[] {
    return rows.map((row) => ({
      snapshotDate: row.snapshot_date,
      value: toNumber(row.value),
      dims: row.dims ?? {},
    }));
  },
};
