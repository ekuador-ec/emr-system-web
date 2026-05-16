import type { UserRole } from "@/domain/modules/users/models/User";

export type EvolutionStatus = "ABIERTA" | "EN_PROCESO" | "CERRADA";
export type ArrivalMethod = "AMBULATORIO" | "AMBULANCIA" | "OTRO";
export type ClinicalCause =
  | "TRAUMA"
  | "CAUSA_CLINICA"
  | "CAUSA_GINECOLOGICA_OBSTETRICA"
  | "CAUSA_QUIRURGICA"
  | "OTRO";
export type AccidentType =
  | "TRANSITO"
  | "CAIDA"
  | "QUEMADURA"
  | "MORDEDURA"
  | "AHOGAMIENTO"
  | "CUERPO_EXTRANO"
  | "APLASTAMIENTO"
  | "OTRO";
export type ViolenceType =
  | "ARMA_FUEGO"
  | "RINA"
  | "VIOLENCIA_FAMILIAR"
  | "ABUSO_FISICO"
  | "ABUSO_PSICOLOGICO"
  | "ABUSO_SEXUAL"
  | "OTRO";
export type IntoxicationType =
  | "ALCOHOLICA"
  | "ALIMENTARIA"
  | "DROGAS"
  | "GASES"
  | "ENVENENAMIENTO"
  | "PICADURA"
  | "ANAFILAXIA"
  | "OTRO";
export type DiagnosisType = "INGRESO" | "ALTA";
export type DiagnosisCertainty = "PRESUNTIVO" | "DEFINITIVO";
export type AirwayStatus = "VIA_AEREA_LIBRE" | "VIA_AEREA_OBSTRUIDA";
export type GeneralCondition = "CONDICION_ESTABLE" | "CONDICION_INESTABLE";
export type PhysicalExamRegion =
  | "CABEZA"
  | "CUELLO"
  | "TORAX"
  | "ABDOMEN"
  | "COLUMNA"
  | "PELVIS"
  | "EXTREMIDADES"
  | "OTRO";
export type InjuryType =
  | "HERIDA_PENETRANTE"
  | "HERIDA_CORTANTE"
  | "FRACTURA_CERRADA"
  | "CUERPO_EXTRANO"
  | "HEMORRAGIA"
  | "MORDEDURA"
  | "PICADURA"
  | "EXCORIACION"
  | "DEFORMIDAD_MASA"
  | "HEMATOMA"
  | "ERITEMA_INFLAMACION"
  | "LUXACION_ESGUINCE"
  | "QUEMADURA"
  | "OTRO";
export type DischargeType =
  | "DOMICILIO"
  | "CONSULTA_EXTERNA"
  | "OBSERVACION"
  | "INTERNACION"
  | "REFERENCIA"
  | "EGRESA_VIVO"
  | "CONDICION_ESTABLE"
  | "CONDICION_INESTABLE"
  | "DIAS_INCAPACIDAD";

export interface EvolutionSystemReview {
  id?: string;
  airwayStatus: AirwayStatus;
  generalCondition: GeneralCondition;
  description: string;
}

export interface EvolutionPhysicalExam {
  id?: string;
  region: PhysicalExamRegion;
  hasPathology: boolean;
  description: string;
}

export interface InjuryCircleMarker {
  shape: "CIRCLE";
  cx: number;
  cy: number;
  r: number;
}

export type InjuryMarker = InjuryCircleMarker;

export interface EvolutionInjury {
  id?: string;
  injuryType: InjuryType;
  description: string | null;
  marker: InjuryMarker | null;
}

export interface EvolutionDiagnosis {
  id?: string;
  cie10Id: string;
  cie10Code?: string;
  cie10Name?: string;
  type: DiagnosisType;
  certainty: DiagnosisCertainty;
  description: string;
}

export interface EvolutionDischarge {
  id?: string;
  dischargeType: DischargeType;
}

export interface EvolutionTreatmentPlan {
  id?: string;
  indication: string;
  medication: string;
  posology: string;
}

export interface MedicalEvolution {
  id: string;
  medicalRecordId: string;
  status: EvolutionStatus;
  openedBy: string;
  openedByName?: string;
  closedBy: string | null;
  closedByName?: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // S0: Admisión
  arrivalMethod: ArrivalMethod | null;
  arrivalMethodObservations: string | null;
  informationSource: string | null;
  referringPerson: string | null;
  contactNumber: string | null;

  // S1
  attentionDate: string | null;
  attentionTime: string | null;
  clinicalCause: ClinicalCause | null;
  clinicalCauseDescription: string | null;
  notifyPolice: boolean;

  // S2
  eventDateTime: string | null;
  eventLocation: string | null;
  eventAddress: string | null;
  requiresPoliceCustody: boolean;
  alcoholicBreath: boolean;
  alcocheckValue: number | null;
  accidentType: AccidentType | null;
  violenceType: ViolenceType | null;
  intoxicationType: IntoxicationType | null;
  eventObservations: string | null;

  // S4
  bpRight: string | null;
  bpLeft: string | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  temperature: number | null;
  bmi: number | null;
  weight: number | null;
  height: number | null;
  rightPupilReaction: string | null;
  leftPupilReaction: string | null;
  capillaryRefillTime: number | null;
  oxygenSaturation: number | null;
  glasgowOcular: number | null;
  glasgowVerbal: number | null;
  glasgowMotor: number | null;
  glasgowTotal: number | null;

  // S7
  gestations: number | null;
  parturitions: number | null;
  abortions: number | null;
  cesareans: number | null;
  lastMenstruationDate: string | null;
  gestationalWeeks: number | null;
  fetalMovement: boolean | null;
  fetalHeartRate: number | null;
  rupturedMembranes: boolean | null;
  rupturedTime: string | null;
  uterineHeight: number | null;
  presentation: string | null;
  dilation: number | null;
  effacement: number | null;
  plane: string | null;
  usefulPelvis: boolean | null;
  vaginalBleeding: boolean | null;
  contractions: boolean | null;

  // S13 Scalar
  incapacityDays: number | null;
  referralService: string | null;
  referralFacility: string | null;
  deathInEmergency: boolean;
  deathCause: string | null;

  // Relations
  systemsReview?: EvolutionSystemReview[];
  physicalExams?: EvolutionPhysicalExam[];
  injuries?: EvolutionInjury[];
  diagnoses?: EvolutionDiagnosis[];
  treatmentPlans?: EvolutionTreatmentPlan[];
  discharges?: EvolutionDischarge[];
}

export interface MedicalEvolutionListItem {
  id: string;
  medicalRecordId: string;
  patientId: string;
  patientName: string;
  patientIdNumber: string;
  status: EvolutionStatus;
  attentionDate: string | null;
  attentionTime: string | null;
  openedByName: string | null;
  openedByRole: UserRole | null;
  closedByName: string | null;
  closedByRole: UserRole | null;
  closedAt: string | null;
  updatedByName: string | null;
  updatedByRole: UserRole | null;
  createdAt: string;
  updatedAt: string;
  clinicalCause: ClinicalCause | null;
  eventObservations: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface EvolutionFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export type CreateEvolutionPayload = Partial<
  Omit<
    MedicalEvolution,
    | "id"
    | "status"
    | "openedBy"
    | "closedBy"
    | "closedAt"
    | "createdAt"
    | "updatedAt"
    | "openedByName"
    | "closedByName"
  >
> & { medicalRecordId: string };
export type UpdateEvolutionPayload = Partial<
  Omit<
    MedicalEvolution,
    | "id"
    | "openedBy"
    | "closedBy"
    | "closedAt"
    | "createdAt"
    | "updatedAt"
    | "openedByName"
    | "closedByName"
  >
>;
