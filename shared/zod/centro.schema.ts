import * as z from 'zod'

const requiredText = (field: string) =>
  z
    .string()
    .trim()
    .min(1, `${field} es requerido`)
    .max(100, `${field} no debe superar los 100 caracteres`)

export const centroSchema = z.object({
  departamento: requiredText('Departamento'),
  provincia: requiredText('Provincia'),
  distrito: requiredText('Distrito'),
  codigoUbigeo: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'El código ubigeo debe tener 6 dígitos')
})

export type CentroSchemaType = z.infer<typeof centroSchema>
