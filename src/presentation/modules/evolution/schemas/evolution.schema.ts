import { z } from "zod";

export const EvolutionStatusSchema = z.enum(["ABIERTA", "EN_PROCESO", "CERRADA"]);
export const ClinicalCauseSchema = z.enum([
  "TRAUMA",
  "CAUSA_CLINICA",
  "CAUSA_GINECOLOGICA_OBSTETRICA",
  "CAUSA_QUIRURGICA",
  "OTRO",
]);
export const AccidentTypeSchema = z.enum([
  "TRANSITO",
  "CAIDA",
  "QUEMADURA",
  "MORDEDURA",
  "AHOGAMIENTO",
  "CUERPO_EXTRANO",
  "APLASTAMIENTO",
  "OTRO",
]);
export const ViolenceTypeSchema = z.enum([
  "ARMA_FUEGO",
  "RINA",
  "VIOLENCIA_FAMILIAR",
  "ABUSO_FISICO",
  "ABUSO_PSICOLOGICO",
  "ABUSO_SEXUAL",
  "OTRO",
]);
export const IntoxicationTypeSchema = z.enum([
  "ALCOHOLICA",
  "ALIMENTARIA",
  "DROGAS",
  "GASES",
  "ENVENENAMIENTO",
  "PICADURA",
  "ANAFILAXIA",
  "OTRO",
]);
export const DiagnosisTypeSchema = z.enum(["INGRESO", "ALTA"]);
export const DiagnosisCertaintySchema = z.enum(["PRESUNTIVO", "DEFINITIVO"]);
export const SystemReviewConditionSchema = z.enum([
  "VIA_AEREA_LIBRE",
  "VIA_AEREA_OBSTRUIDA",
  "CONDICION_ESTABLE",
  "CONDICION_INESTABLE",
]);
export const PhysicalExamRegionSchema = z.enum([
  "CABEZA",
  "CUELLO",
  "TORAX",
  "ABDOMEN",
  "COLUMNA",
  "PELVIS",
  "EXTREMIDADES",
  "OTRO",
]);
export const InjuryTypeSchema = z.enum([
  "HERIDA_PENETRANTE",
  "HERIDA_CORTANTE",
  "FRACTURA_CERRADA",
  "CUERPO_EXTRANO",
  "HEMORRAGIA",
  "MORDEDURA",
  "PICADURA",
  "EXCORIACION",
  "DEFORMIDAD_MASA",
  "HEMATOMA",
  "ERITEMA_INFLAMACION",
  "LUXACION_ESGUINCE",
  "QUEMADURA",
  "OTRO",
]);
export const DischargeTypeSchema = z.enum([
  "DOMICILIO",
  "CONSULTA_EXTERNA",
  "OBSERVACION",
  "INTERNACION",
  "REFERENCIA",
  "EGRESA_VIVO",
  "CONDICION_ESTABLE",
  "CONDICION_INESTABLE",
  "DIAS_INCAPACIDAD",
]);
export const ArrivalMethodSchema = z.enum(["AMBULATORIO", "AMBULANCIA", "OTRO"]);

export const EvolutionSystemReviewSchema = z.object({
  id: z.string().optional(),
  condition: SystemReviewConditionSchema,
  description: z.string().min(1, "La descripción es obligatoria"),
});

export const EvolutionPhysicalExamSchema = z.object({
  id: z.string().optional(),
  region: PhysicalExamRegionSchema,
  hasPathology: z.boolean(),
  description: z.string(),
});

export const EvolutionInjurySchema = z.object({
  id: z.string().optional(),
  injuryType: InjuryTypeSchema,
});

export const EvolutionDiagnosisSchema = z.object({
  id: z.string().optional(),
  cie10Id: z.string().min(1, "Debe seleccionar un diagnóstico CIE-10"),
  type: DiagnosisTypeSchema,
  certainty: DiagnosisCertaintySchema,
  description: z.string(),
});

export const EvolutionDischargeSchema = z.object({
  id: z.string().optional(),
  dischargeType: DischargeTypeSchema,
});

// Relaxed schema for drafting/auto-saving
export const UpdateEvolutionDraftSchema = z.object({
  medicalRecordId: z.string().uuid(),
  status: EvolutionStatusSchema.optional(),

  // S0: Admisión
  arrivalMethod: ArrivalMethodSchema.nullable().optional(),
  arrivalMethodObservations: z.string().nullable().optional(),
  informationSource: z.string().nullable().optional(),
  referringPerson: z.string().nullable().optional(),
  contactNumber: z.string().nullable().optional(),

  // S1: Inicio
  attentionDate: z.string().nullable().optional(),
  attentionTime: z.string().nullable().optional(),
  clinicalCause: ClinicalCauseSchema.nullable().optional(),
  clinicalCauseDescription: z.string().nullable().optional(),
  notifyPolice: z.boolean().optional(),
  // Flag set from Motivo tab to indicate this is an obstetric emergency
  isObstetricEmergency: z.boolean().optional(),

  // S2: Evento
  eventDateTime: z.string().nullable().optional(),
  eventLocation: z.string().nullable().optional(),
  eventAddress: z.string().nullable().optional(),
  requiresPoliceCustody: z.boolean().optional(),
  alcoholicBreath: z.boolean().optional(),
  alcocheckValue: z.number().nullable().optional(),
  accidentType: AccidentTypeSchema.nullable().optional(),
  violenceType: ViolenceTypeSchema.nullable().optional(),
  intoxicationType: IntoxicationTypeSchema.nullable().optional(),
  eventObservations: z.string().nullable().optional(),

  // S4: Signos vitales
  bpRight: z.string().nullable().optional(),
  bpLeft: z.string().nullable().optional(),
  heartRate: z.number().nullable().optional(),
  respiratoryRate: z.number().nullable().optional(),
  temperature: z.number().nullable().optional(),
  bmi: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  rightPupilReaction: z.string().nullable().optional(),
  leftPupilReaction: z.string().nullable().optional(),
  capillaryRefillTime: z.number().nullable().optional(),
  oxygenSaturation: z.number().nullable().optional(),
  glasgowOcular: z.number().min(1).max(4).nullable().optional(),
  glasgowVerbal: z.number().min(1).max(5).nullable().optional(),
  glasgowMotor: z.number().min(1).max(6).nullable().optional(),
  glasgowTotal: z.number().min(3).max(15).nullable().optional(),

  // S7: Obstetricia
  gestations: z.number().nullable().optional(),
  parturitions: z.number().nullable().optional(),
  abortions: z.number().nullable().optional(),
  cesareans: z.number().nullable().optional(),
  lastMenstruationDate: z.string().nullable().optional(),
  gestationalWeeks: z.number().nullable().optional(),
  fetalMovement: z.boolean().nullable().optional(),
  fetalHeartRate: z.number().nullable().optional(),
  rupturedMembranes: z.boolean().nullable().optional(),
  rupturedTime: z.string().nullable().optional(),
  uterineHeight: z.number().nullable().optional(),
  presentation: z.string().nullable().optional(),
  dilation: z.number().nullable().optional(),
  effacement: z.number().nullable().optional(),
  plane: z.string().nullable().optional(),
  usefulPelvis: z.boolean().nullable().optional(),
  vaginalBleeding: z.boolean().nullable().optional(),
  contractions: z.boolean().nullable().optional(),

  // S13: Alta (Scalar)
  incapacityDays: z.number().nullable().optional(),
  referralService: z.string().nullable().optional(),
  referralFacility: z.string().nullable().optional(),
  deathInEmergency: z.boolean().optional(),
  deathCause: z.string().nullable().optional(),

  // Relaciones
  systemsReview: z.array(EvolutionSystemReviewSchema).optional(),
  physicalExams: z.array(EvolutionPhysicalExamSchema).optional(),
  injuries: z.array(EvolutionInjurySchema).optional(),
  diagnoses: z.array(EvolutionDiagnosisSchema).optional(),
  discharges: z.array(EvolutionDischargeSchema).optional(),
});

export type UpdateEvolutionDraftFormValues = z.infer<typeof UpdateEvolutionDraftSchema>;

// Strict schema for Closing the Evolution
export const CloseEvolutionStrictSchema = UpdateEvolutionDraftSchema.extend({
  // S0: Admisión
  arrivalMethod: ArrivalMethodSchema.refine((val) => val !== null && val !== undefined, {
    message: "La forma de llegada es obligatoria para cerrar la evolución",
  }),

  // S1: Inicio
  attentionDate: z.string().min(1, "La fecha de atención es obligatoria"),
  attentionTime: z.string().min(1, "La hora de atención es obligatoria"),
  clinicalCause: ClinicalCauseSchema,
  clinicalCauseDescription: z.string().min(1, "La descripción de la causa es obligatoria"),
  notifyPolice: z.boolean(),

  // Event (Requiring at least the event date/time or an observation to register the event)
  eventObservations: z
    .string()
    .min(
      1,
      "El registro del evento (accidente, violencia, etc.) o sus observaciones son obligatorios",
    ),

  // Vitals - ALL mandatory
  bpRight: z.string().min(1, "PA Derecha obligatoria"),
  bpLeft: z.string().min(1, "PA Izquierda obligatoria"),
  heartRate: z.number({ message: "FC obligatoria" }).min(1),
  respiratoryRate: z.number({ message: "FR obligatoria" }).min(1),
  temperature: z.number({ message: "Temperatura obligatoria" }).min(1),
  bmi: z.number({ message: "IMC obligatorio" }).min(0),
  weight: z.number({ message: "Peso obligatorio" }).min(0.1),
  height: z.number({ message: "Talla obligatoria" }).min(0.1),
  rightPupilReaction: z.string().min(1, "Reacción Pupilar Der. obligatoria"),
  leftPupilReaction: z.string().min(1, "Reacción Pupilar Izq. obligatoria"),
  capillaryRefillTime: z.number({ message: "Llenado capilar obligatorio" }).min(0),
  oxygenSaturation: z.number({ message: "Saturación obligatoria" }).min(1),
  glasgowOcular: z.number({ message: "Glasgow Ocular obligatorio" }).min(1).max(4),
  glasgowVerbal: z.number({ message: "Glasgow Verbal obligatorio" }).min(1).max(5),
  glasgowMotor: z.number({ message: "Glasgow Motor obligatorio" }).min(1).max(6),

  // Relations - required to have at least 1 item for mandatory sections
  physicalExams: z
    .array(EvolutionPhysicalExamSchema)
    .min(1, "Debe registrar al menos un examen físico regional"),
  injuries: z
    .array(EvolutionInjurySchema)
    .min(1, 'Debe registrar la localización de al menos una lesión (o marcar "Ninguna/Otro")'),
  diagnoses: z
    .array(EvolutionDiagnosisSchema)
    .min(1, "Debe registrar al menos un diagnóstico (Ingreso o Alta)"),
  discharges: z
    .array(EvolutionDischargeSchema)
    .min(1, "Debe registrar al menos una condición de alta"),
});
