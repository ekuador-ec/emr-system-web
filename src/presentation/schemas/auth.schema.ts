import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email("Ingresa un correo electrónico válido")
    .min(1, "El correo electrónico es requerido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
