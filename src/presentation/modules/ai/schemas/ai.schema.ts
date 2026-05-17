import { z } from "zod";

export const aiModelPreferenceSchema = z.enum(["deepseek", "auto"]);
export const aiSummaryKindSchema = z.enum(["medical_record", "evolution"]);

export const aiChatMessageSchema = z.object({
  message: z.string().trim().min(1, "El mensaje no puede estar vacio").max(4000),
});

export type AiChatMessageFormValues = z.infer<typeof aiChatMessageSchema>;
