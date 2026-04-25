import * as z from 'zod'

export const periodoSchema = z.object({
  anio: z.coerce
    .number({ error: 'Año es requerido' })
    .int('Año debe ser entero')
    .min(2000, 'Año debe ser mayor o igual a 2000')
    .max(2100, 'Año debe ser menor o igual a 2100'),
  mes: z.coerce
    .number({ error: 'Mes es requerido' })
    .int('Mes debe ser entero')
    .min(1, 'Mes debe estar entre 1 y 12')
    .max(12, 'Mes debe estar entre 1 y 12')
})

export type PeriodoSchemaType = z.infer<typeof periodoSchema>
