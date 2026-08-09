import * as z from 'zod'

const requiredText = (field: string, max = 100) =>
  z
    .string()
    .trim()
    .min(1, `${field} es requerido`)
    .max(max, `${field} no debe superar los ${max} caracteres`)

export const parametroSchema = z.object({
  codigoCabecera: requiredText('Codigo cabecera'),
  valor: requiredText('Valor', 191),
  limiteMin: z.number().optional().nullable(),
  limiteMax: z.number().optional().nullable(),
  unidad: z.string().trim().max(30).optional().or(z.literal('')).nullable(),
  norma: z.string().trim().max(100).optional().or(z.literal('')).nullable()
})

export type ParametroSchemaType = z.infer<typeof parametroSchema>
