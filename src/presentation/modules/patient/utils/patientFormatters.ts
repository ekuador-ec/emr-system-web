import type {
  AntecedentTypeEnum,
  CulturalGroupEnum,
  EducationLevelEnum,
  GenderEnum,
  HealthInsuranceTypeEnum,
  InformationSourceEnum,
  KinshipEnum,
  MaritalStatusEnum,
} from "@/domain/modules/catalog/models/Catalog";
import type { Patient } from "@/domain/modules/patient/models/Patient";

export const GENDER_LABELS: Record<GenderEnum, string> = {
  MASCULINO: "Masculino",
  FEMENINO: "Femenino",
};

export const MARITAL_STATUS_LABELS: Record<MaritalStatusEnum, string> = {
  SOLTERO: "Soltero/a",
  CASADO: "Casado/a",
  DIVORCIADO: "Divorciado/a",
  VIUDO: "Viudo/a",
  UNION_LIBRE: "Unión Libre",
  SEPARADO: "Separado/a",
};

export const CULTURAL_GROUP_LABELS: Record<CulturalGroupEnum, string> = {
  MESTIZO: "Mestizo",
  MONTUBIO: "Montubio",
  INDIGENA: "Indígena",
  AFROECUATORIANO: "Afroecuatoriano",
  MULATO: "Mulato",
  BLANCO: "Blanco",
  OTRO: "Otro",
};

export const EDUCATION_LEVEL_LABELS: Record<EducationLevelEnum, string> = {
  NINGUNO: "Ninguno",
  EDUCACION_BASICA: "Educación Básica",
  BACHILLERATO: "Bachillerato",
  TERCER_NIVEL: "Tercer Nivel (Universidad)",
  CUARTO_NIVEL: "Cuarto Nivel (Postgrado)",
};

export const HEALTH_INSURANCE_LABELS: Record<HealthInsuranceTypeEnum, string> = {
  PUBLICO: "Público (IESS, ISSFA, etc.)",
  PRIVADO: "Privado",
  NINGUNO: "Ninguno",
};

export const INFORMATION_SOURCE_LABELS: Record<InformationSourceEnum, string> = {
  PACIENTE: "El propio paciente",
  FAMILIAR: "Familiar",
  AMIGO: "Amigo",
  CUIDADOR: "Cuidador",
  TUTOR: "Tutor",
  REPRESENTANTE_LEGAL: "Representante Legal",
  MEDICO_REFERENTE: "Médico Referente",
  PERSONAL_SALUD: "Personal de Salud",
  EMERGENCIA_PREHOSPITALARIA: "Emergencia Prehospitalaria",
  HISTORIA_CLINICA: "Historia Clínica / Expediente",
  INFORME_MEDICO: "Informe Médico",
  EXPEDIENTE_PREVIO: "Expediente Previo",
  AUTORIDAD: "Autoridad",
  OTRO: "Otro",
};

export const KINSHIP_LABELS: Record<KinshipEnum, string> = {
  PADRE: "Padre",
  MADRE: "Madre",
  CONYUGE: "Cónyuge",
  PAREJA: "Pareja",
  HIJO: "Hijo/a",
  HERMANO: "Hermano/a",
  ABUELO: "Abuelo/a",
  NIETO: "Nieto/a",
  TIO: "Tío/a",
  SOBRINO: "Sobrino/a",
  PRIMO: "Primo/a",
  TUTOR: "Tutor",
  REPRESENTANTE_LEGAL: "Representante Legal",
  CUIDADOR: "Cuidador",
  AMIGO: "Amigo/a",
  COMPANERO_TRABAJO: "Compañero de Trabajo",
  VECINO: "Vecino/a",
  OTRO: "Otro",
};

export const ANTECEDENT_TYPE_LABELS: Record<AntecedentTypeEnum, string> = {
  ALERGICO: "Alérgico",
  CLINICO: "Clínico",
  GINECOLOGICO: "Ginecológico",
  OBSTETRICO: "Obstétrico",
  TRAUMATOLOGICO: "Traumatológico",
  QUIRURGICO: "Quirúrgico",
  FARMACOLOGICO: "Farmacológico",
  TRANSFUSIONAL: "Transfusional",
  FAMILIAR: "Familiar",
  PATOLOGICO: "Patológico",
  INMUNOLOGICO: "Inmunológico",
  HABITO: "Hábito",
  PSIQUIATRICO: "Psiquiátrico",
  NEONATAL: "Neonatal",
  OTRO: "Otro",
};

export type AntecedentTone =
  | "danger"
  | "warning"
  | "primary"
  | "info"
  | "success"
  | "neutral"
  | "violet"
  | "teal";

export const ANTECEDENT_TYPE_TONES: Record<AntecedentTypeEnum, AntecedentTone> = {
  ALERGICO: "danger",
  CLINICO: "primary",
  GINECOLOGICO: "violet",
  OBSTETRICO: "violet",
  TRAUMATOLOGICO: "warning",
  QUIRURGICO: "warning",
  FARMACOLOGICO: "info",
  TRANSFUSIONAL: "danger",
  FAMILIAR: "teal",
  PATOLOGICO: "primary",
  INMUNOLOGICO: "success",
  HABITO: "neutral",
  PSIQUIATRICO: "violet",
  NEONATAL: "teal",
  OTRO: "neutral",
};

export function formatPatientFullName(patient: Patient): string {
  return [patient.firstName, patient.middleName, patient.lastName, patient.secondLastName]
    .filter((part) => part && part.trim().length > 0)
    .join(" ")
    .trim();
}

export function formatPatientInitials(patient: Patient): string {
  const first = (patient.firstName?.charAt(0) || "").toUpperCase();
  const last = (patient.lastName?.charAt(0) || "").toUpperCase();
  return `${first}${last}` || "P";
}

export function formatBirthDate(birthDate: string | null | undefined): string {
  if (!birthDate) return "";
  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) return birthDate;
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatPatientAge(birthDate: string | null | undefined): string {
  if (!birthDate) return "";
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return "";
  const today = new Date();

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += previousMonth.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  if (years >= 1) {
    return `${years} ${years === 1 ? "año" : "años"}`;
  }
  if (months >= 1) {
    return `${months} ${months === 1 ? "mes" : "meses"}`;
  }
  return `${Math.max(days, 0)} ${days === 1 ? "día" : "días"}`;
}
