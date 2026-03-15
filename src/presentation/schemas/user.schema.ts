import { z } from 'zod';
import { validateEcCedula } from '@/domain/validators/validateEcCedula';

export const profileSchema = z.object({
  firstName: z.string()
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "Solo debe contener letras y espacios"),
  lastName: z.string()
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "Solo debe contener letras y espacios"),
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
  medicalSpecialty: z.string()
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.,-]*$/, "Formato inválido (Ej: Pediatría)")
    .optional()
    .nullable(),
  professionalCode: z.string()
    .optional()
    .nullable()
    .refine((val) => !val || /^[A-Z]+-\d+$/.test(val), "Formato inválido (Ej: MSP-12345)"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
