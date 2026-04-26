import * as z from 'zod'

const measurement = (field: string) =>
  z.coerce
    .number({ error: `${field} es requerido` })
    .finite(`${field} debe ser un numero valido`)

export const reporteItemSchema = z.object({
  cloro: measurement('Cloro'),
  conductividad: measurement('Conductividad'),
  ph: measurement('PH'),
  temperatura: measurement('Temperatura'),
  turbiedad: measurement('Turbiedad')
})

export const reporteSchema = z.object({
  periodoId: z.coerce
    .number({ error: 'Periodo es requerido' })
    .int('Periodo debe ser entero')
    .positive('Periodo es requerido'),
  centroId: z.coerce
    .number({ error: 'Centro es requerido' })
    .int('Centro debe ser entero')
    .positive('Centro es requerido'),
  items: z.array(reporteItemSchema)
    .min(1, 'Debes agregar al menos un item al reporte')
})

export type ReporteItemSchemaType = z.infer<typeof reporteItemSchema>
export type ReporteSchemaType = z.infer<typeof reporteSchema>
