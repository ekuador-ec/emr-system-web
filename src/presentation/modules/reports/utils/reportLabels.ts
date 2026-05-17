import {
  ARRIVAL_METHOD_LABELS,
  CLINICAL_CAUSE_LABELS,
  DISCHARGE_TYPE_LABELS,
  EVOLUTION_STATUS_LABELS,
} from "@/presentation/modules/evolution/utils/evolutionLabels";

const GENDER_LABELS: Record<string, string> = {
  MASCULINO: "Masculino",
  FEMENINO: "Femenino",
  SIN_DATO: "Sin dato",
};

const INSURANCE_LABELS: Record<string, string> = {
  PUBLICO: "Publico",
  PRIVADO: "Privado",
  NINGUNO: "Ninguno",
  SIN_DATO: "Sin dato",
};

const CULTURAL_LABELS: Record<string, string> = {
  MESTIZO: "Mestizo",
  MONTUBIO: "Montubio",
  INDIGENA: "Indigena",
  AFROECUATORIANO: "Afroecuatoriano",
  MULATO: "Mulato",
  BLANCO: "Blanco",
  OTRO: "Otro",
  SIN_DATO: "Sin dato",
};

const AGE_GROUP_LABELS: Record<string, string> = {
  "0-4": "0 a 4 anos",
  "5-14": "5 a 14 anos",
  "15-29": "15 a 29 anos",
  "30-44": "30 a 44 anos",
  "45-64": "45 a 64 anos",
  "65+": "65+ anos",
  SIN_DATO: "Sin dato",
};

function lookupLabel(map: Record<string, string>, key: string): string {
  return map[key] ?? key;
}

export function labelEvolutionStatus(key: string): string {
  return EVOLUTION_STATUS_LABELS[key as keyof typeof EVOLUTION_STATUS_LABELS] ?? key;
}

export function labelArrivalMethod(key: string): string {
  if (key === "SIN_DATO") return "Sin dato";
  return ARRIVAL_METHOD_LABELS[key as keyof typeof ARRIVAL_METHOD_LABELS] ?? key;
}

export function labelClinicalCause(key: string): string {
  if (key === "SIN_DATO") return "Sin dato";
  return CLINICAL_CAUSE_LABELS[key as keyof typeof CLINICAL_CAUSE_LABELS] ?? key;
}

export function labelDischargeType(key: string): string {
  return DISCHARGE_TYPE_LABELS[key as keyof typeof DISCHARGE_TYPE_LABELS] ?? key;
}

export function labelGender(key: string): string {
  return lookupLabel(GENDER_LABELS, key);
}

export function labelInsurance(key: string): string {
  return lookupLabel(INSURANCE_LABELS, key);
}

export function labelCulturalGroup(key: string): string {
  return lookupLabel(CULTURAL_LABELS, key);
}

export function labelAgeGroup(key: string): string {
  return lookupLabel(AGE_GROUP_LABELS, key);
}
