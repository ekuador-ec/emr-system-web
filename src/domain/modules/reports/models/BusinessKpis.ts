export interface GeneralKpis {
  patientsTotal: number;
  patientsNew: number;
  patientsNewPrev: number;

  medicalRecordsTotal: number;
  medicalRecordsNew: number;
  medicalRecordsNewPrev: number;

  evolutionsTotal: number;
  evolutionsNew: number;
  evolutionsNewPrev: number;
  evolutionsClosed: number;
  evolutionsOpen: number;

  avgCloseMinutes: number | null;
}

export interface EvolutionVolumePoint {
  bucket: string;
  total: number;
  closedCount: number;
  openCount: number;
}

export interface DemographicBuckets {
  byGender: Record<string, number>;
  byAgeGroup: Record<string, number>;
  byCulturalGroup: Record<string, number>;
  byInsurance: Record<string, number>;
  total: number;
}

export interface TopDiagnosis {
  cie10Id: string;
  code: string;
  description: string;
  chapterCode: string | null;
  chapterName: string | null;
  total: number;
  percentage: number;
}

export type DiagnosisType = "INGRESO" | "ALTA";
export type DiagnosisCertainty = "PRESUNTIVO" | "DEFINITIVO";

export interface TopDiagnosesFilters {
  type?: DiagnosisType;
  certainty?: DiagnosisCertainty;
  limit?: number;
}
