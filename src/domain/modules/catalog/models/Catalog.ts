export type GenderEnum = 'MASCULINO' | 'FEMENINO';
export type BloodTypeEnum = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type MaritalStatusEnum = 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'UNION_LIBRE' | 'SEPARADO';
export type CulturalGroupEnum = 'MESTIZO' | 'MONTUBIO' | 'INDIGENA' | 'AFROECUATORIANO' | 'MULATO' | 'BLANCO' | 'OTRO';
export type EducationLevelEnum = 'NINGUNO' | 'EDUCACION_BASICA' | 'BACHILLERATO' | 'TERCER_NIVEL' | 'CUARTO_NIVEL';
export type InformationSourceEnum = 'PACIENTE' | 'FAMILIAR' | 'AMIGO' | 'CUIDADOR' | 'TUTOR' | 'REPRESENTANTE_LEGAL' | 'MEDICO_REFERENTE' | 'PERSONAL_SALUD' | 'EMERGENCIA_PREHOSPITALARIA' | 'HISTORIA_CLINICA' | 'INFORME_MEDICO' | 'EXPEDIENTE_PREVIO' | 'AUTORIDAD' | 'OTRO';
export type KinshipEnum = 'PADRE' | 'MADRE' | 'CONYUGE' | 'PAREJA' | 'HIJO' | 'HERMANO' | 'ABUELO' | 'NIETO' | 'TIO' | 'SOBRINO' | 'PRIMO' | 'TUTOR' | 'REPRESENTANTE_LEGAL' | 'CUIDADOR' | 'AMIGO' | 'COMPANERO_TRABAJO' | 'VECINO' | 'OTRO';
export type AntecedentTypeEnum = 'ALERGICO' | 'CLINICO' | 'GINECOLOGICO' | 'OBSTETRICO' | 'TRAUMATOLOGICO' | 'QUIRURGICO' | 'FARMACOLOGICO' | 'TRANSFUSIONAL' | 'FAMILIAR' | 'PATOLOGICO' | 'INMUNOLOGICO' | 'HABITO' | 'PSIQUIATRICO' | 'NEONATAL' | 'OTRO';
export type HealthInsuranceTypeEnum = 'PUBLICO' | 'PRIVADO' | 'NINGUNO';

export interface Catalog {
  id: string;
  name: string;
  description: string | null;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogItem {
  id: string;
  catalogId: string;
  name: string;
  description: string | null;
  code: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cie10Pathology {
  id: string;
  code: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GeographicLocation {
  id: string;
  dpaCode: string;
  province: string;
  canton: string;
  parish: string;
  isActive: boolean;
}
