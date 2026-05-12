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
    phone: z.string().min(1, "El telefono es requerido").max(20),
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
    z.string().uuid("Seleccione una patologia valida").nullable().optional(),
  ),
  description: z.string().nullable().optional(),
  diagnosisDate: z.string().nullable().optional(),
  treatment: z.string().nullable().optional(),
});

function validateEcCedulaFormat(cedula: string): boolean {
  if (!/^[0-9]{10}$/.test(cedula)) return false;
  const province = parseInt(cedula.substring(0, 2), 10);
  if (province < 1 || province > 24) return false;
  if (parseInt(cedula[2], 10) >= 6) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let value = parseInt(cedula[i], 10);
    if (i % 2 === 0) {
      value *= 2;
      if (value > 9) value -= 9;
    }
    sum += value;
  }
  return (10 - (sum % 10)) % 10 === parseInt(cedula[9], 10);
}

export const patientSchema = z
  .object({
    useTemporaryId: z.boolean().default(false),

    idNumber: z.string().max(20).nullable().optional(),
    firstName: z.string().min(1, "El primer nombre es requerido").max(100),
    middleName: z.string().max(100).nullable().optional(),
    lastName: z.string().min(1, "El apellido paterno es requerido").max(100),
    secondLastName: z.string().max(100).nullable().optional(),
    email: z.preprocess((val) => (val === "" ? undefined : val), z.string().email("Email invalido").max(255).nullable().optional()),
    phone: z.string().max(20).nullable().optional(),
    bloodType: z.preprocess((val) => (val === "" ? undefined : val), z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).nullable().optional()),

    birthDate: z.preprocess((val) => (val === "" ? undefined : val), z.string().nullable().optional()),
    birthPlace: z.string().max(200).nullable().optional(),
    gender: z.enum(["MASCULINO", "FEMENINO"], { message: "El genero es requerido" }),
    nationality: z.string().max(100).nullable().optional(),
    culturalGroup: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.enum(["MESTIZO", "MONTUBIO", "INDIGENA", "AFROECUATORIANO", "MULATO", "BLANCO", "OTRO"]).nullable().optional()
    ),
    culturalGroupOther: z.string().max(100).nullable().optional(),
    maritalStatus: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.enum(["SOLTERO", "CASADO", "DIVORCIADO", "VIUDO", "UNION_LIBRE", "SEPARADO"]).nullable().optional()
    ),
    educationLevel: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.enum(["NINGUNO", "EDUCACION_BASICA", "BACHILLERATO", "TERCER_NIVEL", "CUARTO_NIVEL"]).nullable().optional()
    ),
    occupationId: z.string().uuid().nullable().optional(),
    currentlyWorks: z.boolean().default(false),
    healthInsurance: z.preprocess((val) => (val === "" ? undefined : val), z.enum(["PUBLICO", "PRIVADO", "NINGUNO"]).nullable().optional()),

    companyName: z.string().max(200).nullable().optional(),
    companyPosition: z.string().max(100).nullable().optional(),
    companyPhone: z.string().max(20).nullable().optional(),
    companyAddress: z.string().nullable().optional(),

    homeAddress: z.preprocess((val) => (val === "" ? undefined : val), z.string().nullable().optional()),
    neighborhood: z.string().max(150).nullable().optional(),
    geographicLocationId: z.string().uuid().nullable().optional(),

    infoSourceType: z.preprocess((val) => (val === "" ? undefined : val), z.enum([
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
    ]).nullable().optional()),
    infoSourceOther: z.string().max(100).nullable().optional(),
    infoSourceName: z.string().max(200).nullable().optional(),
    infoSourcePhone: z.string().max(20).nullable().optional(),
    infoSourceObservations: z.string().nullable().optional(),

    emergencyContacts: z.array(emergencyContactSchema).optional(),
    clinicalAntecedents: z.array(clinicalAntecedentSchema).optional(),
  })
  .refine(
    (data) => {
      if (!data.useTemporaryId) {
        if (!data.idNumber || data.idNumber.trim() === "") return false;
      }
      return true;
    },
    {
      message: "La cedula es requerida cuando no se usa identificacion temporal",
      path: ["idNumber"],
    },
  )
  .refine(
    (data) => {
      if (!data.useTemporaryId && data.idNumber && data.idNumber.trim() !== "") {
        return validateEcCedulaFormat(data.idNumber);
      }
      return true;
    },
    {
      message: "La cedula ingresada no es valida (verificacion Modulo 10 fallida)",
      path: ["idNumber"],
    },
  )
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
      message: 'Debe especificar la fuente de informacion cuando selecciona "OTRO"',
      path: ["infoSourceOther"],
    },
  );

export const registerCedulaSchema = z.object({
  idNumber: z
    .string()
    .min(10, "La cedula debe tener 10 digitos")
    .max(10, "La cedula debe tener 10 digitos")
    .refine(validateEcCedulaFormat, {
      message: "La cedula ingresada no es valida (verificacion Modulo 10 fallida)",
    }),
});

export type PatientFormData = z.infer<typeof patientSchema>;
export type EmergencyContactFormData = z.infer<typeof emergencyContactSchema>;
export type ClinicalAntecedentFormData = z.infer<typeof clinicalAntecedentSchema>;
export type RegisterCedulaFormData = z.infer<typeof registerCedulaSchema>;
