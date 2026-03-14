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

export const resetPasswordRequestSchema = z.object({
  email: z
    .email("Ingresa un correo electrónico válido")
    .min(1, "El correo electrónico es requerido"),
});

export type ResetPasswordRequestFormData = z.infer<typeof resetPasswordRequestSchema>;

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z
    .string()
    .min(1, "Confirma tu contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;
