import { z } from "zod";

const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const PHONE_REGEX = /^\d{7,10}$/;
const MULTI_PHONE_REGEX = /^\d{7,10}(?:-\d{7,10})*$/;
const PATIENT_PHONE_REGEX = /^\d{10}$/;
const COMPANY_PHONE_REGEX = /^\d{7,10}(?:-\d{7,10})*$/;
const BIRTH_PLACE_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,]+$/;

const normalizeOptionalText = (val: unknown): string | null | unknown => {
  if (typeof val !== "string") {
    return val;
  }
  const trimmed = val.trim();
  return trimmed === "" ? null : trimmed;
};

const normalizeRequiredText = (val: unknown): unknown => {
  if (typeof val !== "string") {
    return val;
  }
  return val.trim();
};

export const emergencyContactSchema = z
  .object({
    id: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().uuid().optional().nullable(),
    ),
    name: z.preprocess(
      normalizeRequiredText,
      z
        .string()
        .min(2, "Nombre requerido")
        .max(200, "Máx. 200 caracteres")
        .regex(NAME_REGEX, "Solo letras"),
    ),
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
      { message: "Parentesco requerido" },
    ),
    kinshipOther: z.preprocess(
      normalizeOptionalText,
      z.string().max(100, "Máx. 100 caracteres").nullable().optional(),
    ),
    phone: z.preprocess(
      normalizeRequiredText,
      z
        .string()
        .min(1, "Teléfono requerido")
        .max(50, "Máx. 50 caracteres")
        .regex(
          MULTI_PHONE_REGEX,
          "Solo números y signo \"-\"",
        ),
    ),
    address: z.preprocess(normalizeOptionalText, z.string().max(250).nullable().optional()),
  })
  .refine(
    (data) => {
      if (data.kinship === "OTRO" && (!data.kinshipOther || data.kinshipOther.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: "Especifica el parentesco",
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
  description: z.preprocess(
    normalizeOptionalText,
    z.string().max(1000, "La descripción no puede superar 1000 caracteres").nullable().optional(),
  ),
  diagnosisDate: z.preprocess(
    normalizeRequiredText,
    z
      .string()
      .min(1, "La fecha de diagnóstico es obligatoria")
      .refine((value) => !value || !Number.isNaN(Date.parse(value)), "La fecha de diagnóstico es inválida")
  ),
  treatment: z.preprocess(
    normalizeOptionalText,
    z.string().max(1000, "El tratamiento no puede superar 1000 caracteres").nullable().optional(),
  ),
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

    idNumber: z.preprocess(
      normalizeOptionalText,
      z
        .string()
        .regex(/^\d+$/, "La cédula solo debe contener números")
        .length(10, "La cédula debe tener exactamente 10 dígitos")
        .nullable()
        .optional(),
    ),
    firstName: z.preprocess(
      normalizeRequiredText,
      z
        .string()
        .min(2, "Mínimo 2 caracteres")
        .max(50, "Maximo 50 caracteres")
        .regex(NAME_REGEX, "Solo debe contener letras"),
    ),
    middleName: z.preprocess(
      normalizeOptionalText,
      z
        .string()
        .min(2, "Mínimo 2 caracteres")
        .max(50, "Maximo 50 caracteres")
        .regex(NAME_REGEX, "Solo debe contener letras")
        .nullable()
        .optional(),
    ),
    lastName: z.preprocess(
      normalizeRequiredText,
      z
        .string()
        .min(2, "Mínimo 2 caracteres")
        .max(50, "Maximo 50 caracteres")
        .regex(NAME_REGEX, "Solo debe contener letras"),
    ),
    secondLastName: z.preprocess(
      normalizeOptionalText,
      z
        .string()
        .min(2, "Mínimo 2 caracteres")
        .max(50, "Maximo 50 caracteres")
        .regex(NAME_REGEX, "Solo debe contener letras")
        .nullable()
        .optional(),
    ),
    email: z.preprocess(
      normalizeOptionalText,
      z.string().email("Email inválido").max(255).nullable().optional(),
    ),
    phone: z.preprocess(
      normalizeOptionalText,
      z
        .string()
        .regex(PATIENT_PHONE_REGEX, "El teléfono debe tener 10 dígitos")
        .nullable()
        .optional(),
    ),
    bloodType: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).nullable().optional(),
    ),

    birthDate: z.preprocess(
      normalizeOptionalText,
      z
        .string()
        .refine((value) => !Number.isNaN(Date.parse(value)), "La fecha de nacimiento inválida")
        .refine((value) => new Date(value) <= new Date(), "La fecha de nacimiento inválida")
        .nullable()
        .optional(),
    ),
    birthPlace: z.preprocess(
      normalizeOptionalText,
      z
        .string()
        .max(100, "Maximo 100 caracteres")
        .regex(BIRTH_PLACE_REGEX, "Solo debe contener texto")
        .nullable()
        .optional(),
    ),
    gender: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.enum(["MASCULINO", "FEMENINO"], { message: "El género es requerido" }),
    ),
    nationality: z.preprocess(
      normalizeOptionalText,
      z
        .string()
        .min(2, "Minimo 2 caracteres")
        .max(100, "Maximo 100 caracteres")
        .regex(NAME_REGEX, "Solo debe contener letras y espacios")
        .nullable()
        .optional(),
    ),
    culturalGroup: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z
        .enum(["MESTIZO", "MONTUBIO", "INDIGENA", "AFROECUATORIANO", "MULATO", "BLANCO", "OTRO"])
        .nullable()
        .optional(),
    ),
    culturalGroupOther: z.preprocess(
      normalizeOptionalText,
      z
        .string()
        .max(100, "Maximo 100 caracteres")
        .regex(NAME_REGEX, "Solo debe contener letras y espacios")
        .nullable()
        .optional(),
    ),
    maritalStatus: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z
        .enum(["SOLTERO", "CASADO", "DIVORCIADO", "VIUDO", "UNION_LIBRE", "SEPARADO"])
        .nullable()
        .optional(),
    ),
    educationLevel: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z
        .enum(["NINGUNO", "EDUCACION_BASICA", "BACHILLERATO", "TERCER_NIVEL", "CUARTO_NIVEL"])
        .nullable()
        .optional(),
    ),
    occupationId: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().uuid().nullable().optional(),
    ),
    currentlyWorks: z.boolean().default(false),
    healthInsurance: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.enum(["PUBLICO", "PRIVADO", "NINGUNO"]).nullable().optional(),
    ),

    companyName: z.preprocess(normalizeOptionalText, z.string().max(200).nullable().optional()),
    companyPosition: z.preprocess(normalizeOptionalText, z.string().max(100).nullable().optional()),
    companyPhone: z.preprocess(
      normalizeOptionalText,
      z
        .string()
        .max(50, "Máximo 50 caracteres")
        .regex(
          COMPANY_PHONE_REGEX,
          "Formato inválido. Usa 7-10 dígitos y separa con '-'",
        )
        .nullable()
        .optional(),
    ),
    companyAddress: z.preprocess(normalizeOptionalText, z.string().max(250).nullable().optional()),

    homeAddress: z.preprocess(normalizeOptionalText, z.string().max(250).nullable().optional()),
    neighborhood: z.preprocess(normalizeOptionalText, z.string().max(150).nullable().optional()),
    geographicLocationId: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().uuid().nullable().optional(),
    ),

    infoSourceType: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z
        .enum([
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
        ])
        .nullable()
        .optional(),
    ),
    infoSourceOther: z.preprocess(normalizeOptionalText, z.string().max(100).nullable().optional()),
    infoSourceName: z.preprocess(normalizeOptionalText, z.string().max(200).nullable().optional()),
    infoSourcePhone: z.preprocess(
      normalizeOptionalText,
      z
        .string()
        .max(50, "Máximo 50 caracteres")
        .regex(
          COMPANY_PHONE_REGEX,
          "Formato inválido. Usa 7-10 dígitos y separa con '-'",
        )
        .nullable()
        .optional(),
    ),
    infoSourceObservations: z.preprocess(
      normalizeOptionalText,
      z.string().max(1000).nullable().optional(),
    ),

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
      if (data.idNumber && data.idNumber.trim() !== "") {
        return validateEcCedulaFormat(data.idNumber);
      }
      return true;
    },
    {
      message: "La cédula ingresada no es válida.",
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
      message: "La cédula ingresada no es válida.",
    }),
});

export type PatientFormData = z.infer<typeof patientSchema>;
export type EmergencyContactFormData = z.infer<typeof emergencyContactSchema>;
export type ClinicalAntecedentFormData = z.infer<typeof clinicalAntecedentSchema>;
export type RegisterCedulaFormData = z.infer<typeof registerCedulaSchema>;
