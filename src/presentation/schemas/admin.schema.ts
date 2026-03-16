import { z } from 'zod';

export const inviteUserSchema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres").max(50, "Máximo 50 caracteres").regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras"),
  lastName: z.string().min(2, "Mínimo 2 caracteres").max(50, "Máximo 50 caracteres").regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras"),
  email: z.string().email("Correo electrónico inválido"),
  role: z.enum(['admin', 'doctor', 'nurse', 'receptionist', 'lab_technician', 'pharmacist']),
});

export type InviteUserFormValues = z.infer<typeof inviteUserSchema>;
