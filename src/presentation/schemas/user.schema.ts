import { z } from 'zod';
import { validateEcCedula } from '@/domain/validators/validateEcCedula';

export const profileSchema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres").max(50, "Máximo 50 caracteres"),
  lastName: z.string().min(2, "Mínimo 2 caracteres").max(50, "Máximo 50 caracteres"),
  phone: z.string()
    .regex(/^\d*$/, "Solo debe contener números")
    .optional()
    .nullable()
    .refine((val) => !val || val.length === 10, "Debe tener exactamente 10 números"),
  identificationNumber: z.string()
    .regex(/^\d*$/, "Solo debe contener números")
    .optional()
    .nullable()
    .refine((val) => !val || val.length === 10, "Debe tener exactamente 10 números")
    .refine((val) => {
    if (!val) return true; // Optional, only validate if provided
    return validateEcCedula(val);
  }, "Número de identificación inválido"),
  medicalSpecialty: z.string().optional().nullable(),
  professionalCode: z.string().optional().nullable(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
