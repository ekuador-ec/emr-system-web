import { z } from "zod";

export interface PrescriptionDiagnosisFormValue {
  cie10Id: string | null;
  cie10Code: string;
  cie10Description: string;
}

export const PrescriptionSchema = z.object({
  issueDate: z.string().min(1, "La fecha de registro es obligatoria."),
  validityDate: z.string().min(1, "La fecha de vigencia es obligatoria."),
  allergies: z.string().nullable().optional(),
  rpText: z.string().nullable().optional(),
  indicationsText: z.string().nullable().optional(),
});

export type PrescriptionFormValues = z.infer<typeof PrescriptionSchema> & {
  diagnoses: PrescriptionDiagnosisFormValue[];
};

export function addDaysToDate(isoDate: string, days: number): string {
  const base = new Date(`${isoDate}T00:00:00`);
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

export function buildDefaultPrescriptionValues(): PrescriptionFormValues {
  const today = new Date().toISOString().slice(0, 10);
  return {
    issueDate: today,
    validityDate: addDaysToDate(today, 3),
    allergies: "",
    rpText: "",
    indicationsText: "",
    diagnoses: [],
  };
}

export function validatePrescription(values: PrescriptionFormValues): string[] {
  const errors: string[] = [];

  const parsed = PrescriptionSchema.safeParse(values);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(issue.message);
    }
  }

  if (!values.rpText || !values.rpText.trim()) {
    errors.push("La prescripción médica (Rp) no puede estar vacía.");
  }

  if (values.issueDate && values.validityDate && values.validityDate < values.issueDate) {
    errors.push("La fecha de vigencia no puede ser anterior a la fecha de registro.");
  }

  return errors;
}
