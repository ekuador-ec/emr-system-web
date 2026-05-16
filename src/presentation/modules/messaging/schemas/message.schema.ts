import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Escribe un mensaje")
    .max(4000, "El mensaje no puede superar los 4000 caracteres"),
});

export type SendMessageSchema = z.infer<typeof sendMessageSchema>;
