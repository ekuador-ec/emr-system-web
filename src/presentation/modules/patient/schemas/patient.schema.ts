import { z } from "zod";

export const emergencyContactSchema = z
  .object({
    id: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().uuid().optional().nullable(),
    ),
    name: z.string().min(1, "El nombre es requerido").max(200),
    kinship: z.enum(
      [
        "PADRE",
        "MADRE",
        "CONYUGE",
        "PAREJA",
        "HIJO",
        "HERMANO",
        "ABUELO",
        "NIETO",
        "TIO",
        "SOBRINO",
        "PRIMO",
        "TUTOR",
        "REPRESENTANTE_LEGAL",
        "CUIDADOR",
        "AMIGO",
        "COMPANERO_TRABAJO",
        "VECINO",
        "OTRO",
      ],
      { message: "El parentesco es requerido" },
    ),
    kinshipOther: z.string().max(100).nullable().optional(),
    phone: z.string().min(1, "El teléfono es requerido").max(20),
    address: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.kinship === "OTRO" && (!data.kinshipOther || data.kinshipOther.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: 'Debe especificar el parentesco cuando selecciona "OTRO"',
      path: ["kinshipOther"],
    },
  );

export const clinicalAntecedentSchema = z.object({
  id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional().nullable(),
  ),
  antecedentType: z.enum(
    [
      "ALERGICO",
      "CLINICO",
      "GINECOLOGICO",
      "OBSTETRICO",
      "TRAUMATOLOGICO",
      "QUIRURGICO",
      "FARMACOLOGICO",
      "TRANSFUSIONAL",
      "FAMILIAR",
      "PATOLOGICO",
      "INMUNOLOGICO",
      "HABITO",
      "PSIQUIATRICO",
      "NEONATAL",
      "OTRO",
    ],
    { message: "El tipo es requerido" },
  ),
  pathologyId: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid("Seleccione una patología válida").nullable().optional(),
  ),
  description: z.string().nullable().optional(),
  diagnosisDate: z.string().nullable().optional(),
  treatment: z.string().nullable().optional(),
});

export const patientSchema = z
  .object({
    // Base Info
    idNumber: z.string().min(1, "La cédula es requerida").max(20),
    firstName: z.string().min(1, "El primer nombre es requerido").max(100),
    middleName: z.string().max(100).nullable().optional(),
    lastName: z.string().min(1, "El apellido paterno es requerido").max(100),
    secondLastName: z.string().max(100).nullable().optional(),
    email: z.string().email("Email inválido").max(255).nullable().optional().or(z.literal("")),
    phone: z.string().max(20).nullable().optional(),
    bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).nullable().optional(),

    // Demographic Info
    birthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
    birthPlace: z.string().max(200).nullable().optional(),
    gender: z.enum(["MASCULINO", "FEMENINO"], { message: "El género es requerido" }),
    nationality: z.string().max(100).nullable().optional(),
    culturalGroup: z
      .enum(["MESTIZO", "MONTUBIO", "INDIGENA", "AFROECUATORIANO", "MULATO", "BLANCO", "OTRO"])
      .nullable()
      .optional(),
    culturalGroupOther: z.string().max(100).nullable().optional(),
    maritalStatus: z
      .enum(["SOLTERO", "CASADO", "DIVORCIADO", "VIUDO", "UNION_LIBRE", "SEPARADO"])
      .nullable()
      .optional(),
    educationLevel: z
      .enum(["NINGUNO", "EDUCACION_BASICA", "BACHILLERATO", "TERCER_NIVEL", "CUARTO_NIVEL"])
      .nullable()
      .optional(),
    occupationId: z.string().uuid().nullable().optional(),
    currentlyWorks: z.boolean().default(false),
    healthInsurance: z.enum(["PUBLICO", "PRIVADO", "NINGUNO"]).nullable().optional(),

    // Occupation/Work Info
    companyName: z.string().max(200).nullable().optional(),
    companyPosition: z.string().max(100).nullable().optional(),
    companyPhone: z.string().max(20).nullable().optional(),
    companyAddress: z.string().nullable().optional(),

    // Geographical Location
    homeAddress: z.string().min(1, "La dirección es requerida"),
    neighborhood: z.string().max(150).nullable().optional(),
    geographicLocationId: z.string().uuid().nullable().optional(),

    // Information Source
    infoSourceType: z.enum(
      [
        "PACIENTE",
        "FAMILIAR",
        "AMIGO",
        "CUIDADOR",
        "TUTOR",
        "REPRESENTANTE_LEGAL",
        "MEDICO_REFERENTE",
        "PERSONAL_SALUD",
        "EMERGENCIA_PREHOSPITALARIA",
        "HISTORIA_CLINICA",
        "INFORME_MEDICO",
        "EXPEDIENTE_PREVIO",
        "AUTORIDAD",
        "OTRO",
      ],
      { message: "La fuente de información es requerida" },
    ),
    infoSourceOther: z.string().max(100).nullable().optional(),
    infoSourceName: z.string().max(200).nullable().optional(),
    infoSourcePhone: z.string().max(20).nullable().optional(),
    infoSourceObservations: z.string().nullable().optional(),

    // Relations
    emergencyContacts: z.array(emergencyContactSchema).optional(),
    clinicalAntecedents: z.array(clinicalAntecedentSchema).optional(),
  })
  .refine(
    (data) => {
      if (
        data.culturalGroup === "OTRO" &&
        (!data.culturalGroupOther || data.culturalGroupOther.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Debe especificar el grupo cultural cuando selecciona "OTRO"',
      path: ["culturalGroupOther"],
    },
  )
  .refine(
    (data) => {
      if (
        data.infoSourceType === "OTRO" &&
        (!data.infoSourceOther || data.infoSourceOther.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Debe especificar la fuente de información cuando selecciona "OTRO"',
      path: ["infoSourceOther"],
    },
  );

export type PatientFormData = z.infer<typeof patientSchema>;
export type EmergencyContactFormData = z.infer<typeof emergencyContactSchema>;
export type ClinicalAntecedentFormData = z.infer<typeof clinicalAntecedentSchema>;
