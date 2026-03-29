import { z } from 'zod';

export const organizationConfigSchema = z.object({
  institutionName: z
    .string()
    .min(1, 'El nombre de la institucion es obligatorio')
    .max(150, 'Maximo 150 caracteres'),
  operationalUnit: z
    .string()
    .min(1, 'La unidad operativa es obligatoria')
    .max(150, 'Maximo 150 caracteres'),
  operationalUnitCode: z
    .string()
    .max(20, 'Maximo 20 caracteres')
    .optional()
    .or(z.literal('')),
  provinceCode: z
    .string()
    .max(10, 'Maximo 10 caracteres')
    .optional()
    .or(z.literal('')),
  cantonCode: z
    .string()
    .max(10, 'Maximo 10 caracteres')
    .optional()
    .or(z.literal('')),
  parishCode: z
    .string()
    .max(10, 'Maximo 10 caracteres')
    .optional()
    .or(z.literal('')),
});

export type OrganizationConfigFormValues = z.infer<typeof organizationConfigSchema>;
