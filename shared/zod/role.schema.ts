import * as z from 'zod'

export const roleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es requerido')
    .max(50, 'El nombre no debe superar los 50 caracteres'),
  description: z
    .string()
    .trim()
    .max(191, 'La descripcion no debe superar los 191 caracteres')
    .optional()
    .or(z.literal('')),
  permissionIds: z.array(z.number().int().positive()).default([])
})

export type RoleSchemaType = z.infer<typeof roleSchema>
