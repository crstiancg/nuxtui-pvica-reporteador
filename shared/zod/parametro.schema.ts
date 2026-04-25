import * as z from 'zod'

const requiredText = (field: string, max = 100) =>
  z
    .string()
    .trim()
    .min(1, `${field} es requerido`)
    .max(max, `${field} no debe superar los ${max} caracteres`)

export const parametroSchema = z.object({
  codigoCabecera: requiredText('Codigo cabecera'),
  valor: requiredText('Valor', 191)
})

export type ParametroSchemaType = z.infer<typeof parametroSchema>
