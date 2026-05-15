import type {
  AccidentType,
  AirwayStatus,
  ArrivalMethod,
  ClinicalCause,
  DiagnosisCertainty,
  DiagnosisType,
  DischargeType,
  EvolutionStatus,
  GeneralCondition,
  InjuryType,
  IntoxicationType,
  PhysicalExamRegion,
  ViolenceType,
} from "@/domain/modules/evolution/models/Evolution";

export const EVOLUTION_STATUS_LABELS: Record<EvolutionStatus, string> = {
  ABIERTA: "Abierta",
  EN_PROCESO: "En proceso",
  CERRADA: "Cerrada",
};

export const ARRIVAL_METHOD_LABELS: Record<ArrivalMethod, string> = {
  AMBULATORIO: "Ambulatorio",
  AMBULANCIA: "Ambulancia",
  OTRO: "Otro transporte",
};

export const CLINICAL_CAUSE_LABELS: Record<ClinicalCause, string> = {
  TRAUMA: "Trauma",
  CAUSA_CLINICA: "Causa clínica",
  CAUSA_GINECOLOGICA_OBSTETRICA: "Causa ginecológica / obstétrica",
  CAUSA_QUIRURGICA: "Causa quirúrgica",
  OTRO: "Otro",
};

export const ACCIDENT_TYPE_LABELS: Record<AccidentType, string> = {
  TRANSITO: "Tránsito",
  CAIDA: "Caída",
  QUEMADURA: "Quemadura",
  MORDEDURA: "Mordedura",
  AHOGAMIENTO: "Ahogamiento",
  CUERPO_EXTRANO: "Cuerpo extraño",
  APLASTAMIENTO: "Aplastamiento",
  OTRO: "Otro",
};

export const VIOLENCE_TYPE_LABELS: Record<ViolenceType, string> = {
  ARMA_FUEGO: "Arma de fuego",
  RINA: "Riña",
  VIOLENCIA_FAMILIAR: "Violencia familiar",
  ABUSO_FISICO: "Abuso físico",
  ABUSO_PSICOLOGICO: "Abuso psicológico",
  ABUSO_SEXUAL: "Abuso sexual",
  OTRO: "Otro",
};

export const INTOXICATION_TYPE_LABELS: Record<IntoxicationType, string> = {
  ALCOHOLICA: "Alcohólica",
  ALIMENTARIA: "Alimentaria",
  DROGAS: "Drogas",
  GASES: "Inhalación de gases",
  ENVENENAMIENTO: "Envenenamiento",
  PICADURA: "Picadura",
  ANAFILAXIA: "Anafilaxia",
  OTRO: "Otro",
};

export const DIAGNOSIS_TYPE_LABELS: Record<DiagnosisType, string> = {
  INGRESO: "Ingreso",
  ALTA: "Alta",
};

export const DIAGNOSIS_CERTAINTY_LABELS: Record<DiagnosisCertainty, string> = {
  PRESUNTIVO: "Presuntivo",
  DEFINITIVO: "Definitivo",
};

export const AIRWAY_STATUS_LABELS: Record<AirwayStatus, string> = {
  VIA_AEREA_LIBRE: "Vía aérea libre",
  VIA_AEREA_OBSTRUIDA: "Vía aérea obstruida",
};

export const GENERAL_CONDITION_LABELS: Record<GeneralCondition, string> = {
  CONDICION_ESTABLE: "Condición estable",
  CONDICION_INESTABLE: "Condición inestable",
};

export const PHYSICAL_EXAM_REGION_LABELS: Record<PhysicalExamRegion, string> = {
  CABEZA: "Cabeza",
  CUELLO: "Cuello",
  TORAX: "Tórax",
  ABDOMEN: "Abdomen",
  COLUMNA: "Columna",
  PELVIS: "Pelvis",
  EXTREMIDADES: "Extremidades",
  OTRO: "Otro",
};

export const INJURY_TYPE_LABELS: Record<InjuryType, string> = {
  HERIDA_PENETRANTE: "Herida penetrante",
  HERIDA_CORTANTE: "Herida cortante",
  FRACTURA_CERRADA: "Fractura cerrada",
  CUERPO_EXTRANO: "Cuerpo extraño",
  HEMORRAGIA: "Hemorragia",
  MORDEDURA: "Mordedura",
  PICADURA: "Picadura",
  EXCORIACION: "Excoriación",
  DEFORMIDAD_MASA: "Deformidad / Masa",
  HEMATOMA: "Hematoma",
  ERITEMA_INFLAMACION: "Eritema / Inflamación",
  LUXACION_ESGUINCE: "Luxación / Esguince",
  QUEMADURA: "Quemadura",
  OTRO: "Otro",
};

export const DISCHARGE_TYPE_LABELS: Record<DischargeType, string> = {
  DOMICILIO: "Domicilio",
  CONSULTA_EXTERNA: "Consulta externa",
  OBSERVACION: "Observación",
  INTERNACION: "Internación",
  REFERENCIA: "Referencia",
  EGRESA_VIVO: "Egresa vivo",
  CONDICION_ESTABLE: "Condición estable",
  CONDICION_INESTABLE: "Condición inestable",
  DIAS_INCAPACIDAD: "Días de incapacidad",
};

export function formatBloodPressure(
  systolic: string | null | undefined,
  diastolic?: string | null | undefined,
): string {
  const s = (systolic ?? "").trim();
  const d = (diastolic ?? "").trim();
  if (!s && !d) return "";
  if (d) return `${s || "—"} / ${d}`;
  return s;
}

export function formatNumeric(
  value: number | null | undefined,
  unit?: string,
  digits = 0,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  const formatted = digits > 0 ? value.toFixed(digits) : `${value}`;
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatGlasgow(
  ocular: number | null,
  verbal: number | null,
  motor: number | null,
  total: number | null,
): string {
  if (ocular === null && verbal === null && motor === null && total === null) {
    return "";
  }
  const parts: string[] = [];
  if (ocular !== null) parts.push(`O${ocular}`);
  if (verbal !== null) parts.push(`V${verbal}`);
  if (motor !== null) parts.push(`M${motor}`);
  const base = parts.join(" · ");
  if (total !== null) return base ? `${base} = ${total}` : `Total ${total}`;
  return base;
}

export function formatPupilReaction(value: string | null | undefined): string {
  if (!value) return "";
  return value.toString().trim();
}

export function formatLongDateTime(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatShortTime(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 5);
}

export function formatBoolean(value: boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  return value ? "Sí" : "No";
}
