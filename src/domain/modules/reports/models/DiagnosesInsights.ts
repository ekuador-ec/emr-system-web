import type { DiagnosisCertainty, DiagnosisType } from "./BusinessKpis";

export interface DiagnosesByChapter {
  chapterCode: string;
  chapterName: string;
  total: number;
  percentage: number;
}

export interface DiagnosesSummary {
  total: number;
  ingresoTotal: number;
  altaTotal: number;
  presuntivoTotal: number;
  definitivoTotal: number;
  evolutionsWithDx: number;
  evolutionsWithAlta: number;
  pctAltaDx: number;
  pctDefinitivos: number;
}

export interface DiagnosesChapterFilters {
  type?: DiagnosisType;
  certainty?: DiagnosisCertainty;
}
