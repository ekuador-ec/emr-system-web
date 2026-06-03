import { z } from "zod";

// Relaxed schema for the "new atención" form (RHF resolver).
// Field-level requirements (evolution note always, vital signs on the first
// entry) are enforced at submit time in the workspace, because they depend on
// whether the document already has entries.
export const Form005EntrySchema = z.object({
  attentionDate: z.string().nullable().optional(),
  attentionTime: z.string().nullable().optional(),
  evolutionNote: z.string().nullable().optional(),
  prescriptions: z.string().nullable().optional(),

  // Signos vitales
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
});

export type Form005EntryFormValues = z.infer<typeof Form005EntrySchema>;

export const FORM005_ENTRY_DEFAULTS: Form005EntryFormValues = {
  attentionDate: null,
  attentionTime: null,
  evolutionNote: "",
  prescriptions: "",
  bpRight: null,
  bpLeft: null,
  heartRate: null,
  respiratoryRate: null,
  temperature: null,
  bmi: null,
  weight: null,
  height: null,
  rightPupilReaction: null,
  leftPupilReaction: null,
  capillaryRefillTime: null,
  oxygenSaturation: null,
  glasgowOcular: null,
  glasgowVerbal: null,
  glasgowMotor: null,
  glasgowTotal: null,
};

/**
 * Validates a new entry before submit. The evolution note is always required;
 * the first entry of a document additionally requires the core vital signs.
 * Returns a list of human-readable error messages (empty = valid).
 */
export function validateForm005Entry(
  values: Form005EntryFormValues,
  isFirstEntry: boolean,
): string[] {
  const errors: string[] = [];

  if (!values.evolutionNote || !values.evolutionNote.trim()) {
    errors.push("La nota de evolución es obligatoria.");
  }

  if (isFirstEntry) {
    const hasBloodPressure = Boolean(
      (values.bpRight && values.bpRight.trim()) || (values.bpLeft && values.bpLeft.trim()),
    );
    if (!hasBloodPressure) errors.push("La presión arterial es obligatoria en la primera atención.");
    if (values.heartRate === null || values.heartRate === undefined)
      errors.push("La frecuencia cardíaca es obligatoria en la primera atención.");
    if (values.respiratoryRate === null || values.respiratoryRate === undefined)
      errors.push("La frecuencia respiratoria es obligatoria en la primera atención.");
    if (values.temperature === null || values.temperature === undefined)
      errors.push("La temperatura es obligatoria en la primera atención.");
    if (values.oxygenSaturation === null || values.oxygenSaturation === undefined)
      errors.push("La saturación de oxígeno es obligatoria en la primera atención.");
  }

  return errors;
}
