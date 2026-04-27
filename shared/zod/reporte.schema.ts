import * as z from 'zod'

const optionalText = z.preprocess((value) => {
  const normalized = String(value ?? '').trim()

  if (!normalized || normalized.toLowerCase() === 'null') {
    return null
  }

  return normalized
}, z.string().nullable())

const optionalMeasurement = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return null
  }

  const normalized = String(value).trim().replace(',', '.')

  if (!normalized || normalized.toLowerCase() === 'null') {
    return null
  }

  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : value
}, z.number({ error: 'Debe ser un numero valido' }).finite('Debe ser un numero valido').nullable())

export const reporteItemSchema = z.object({
  codigoMuestreo: optionalText,
  codigoMuestra: optionalText,
  coordenadaEste: optionalText,
  coordenadaNorte: optionalText,
  husoBanda: optionalText,
  altura: optionalText,
  estadoMuestreo: optionalText,
  fechaMuestreo: optionalText,
  fechaFinalizado: optionalText,
  lugarMuestreoId: optionalText,
  lugarMuestreoUbicacion: optionalText,
  lugarMuestreoNombre: optionalText,
  continuidadHorasDia: optionalText,
  continuidadDiasSemana: optionalText,
  decretoAluminio: optionalText,
  decretoBacteriasColiformesFecales: optionalText,
  decretoBacteriasColiformesTotales: optionalText,
  decretoBacteriasHeterotroficas: optionalText,
  decretoCloro: optionalMeasurement,
  decretoCobre: optionalText,
  decretoConductividad: optionalMeasurement,
  decretoCromoTotal: optionalText,
  decretoEColiNmp: optionalText,
  decretoHierro: optionalText,
  decretoHuevosLarvasHelmintos: optionalText,
  decretoManganeso: optionalText,
  decretoNitratos: optionalText,
  decretoNitritosExposicionCorta: optionalText,
  decretoOrganismosVidaLibre: optionalText,
  decretoPh: optionalMeasurement,
  decretoSolidosTotalesDisueltos: optionalText,
  decretoSulfatos: optionalText,
  decretoTemperatura: optionalMeasurement,
  decretoTurbiedad: optionalMeasurement,
  ecaAluminio: optionalText,
  ecaCobre: optionalText,
  ecaColiformesTermotolerantes: optionalText,
  ecaColiformesTotales: optionalText,
  ecaConductividad: optionalText,
  ecaCromoTotal: optionalText,
  ecaEscherichiaColi: optionalText,
  ecaFormasParasitarias: optionalText,
  ecaHierro: optionalText,
  ecaManganeso: optionalText,
  ecaNitratos: optionalText,
  ecaNitritos: optionalText,
  ecaOrganismosVidaLibre: optionalText,
  ecaPh: optionalText,
  ecaSulfatos: optionalText,
  ecaTemperatura: optionalText,
  ecaTurbiedad: optionalText
}).superRefine((item, ctx) => {
  const hasValue = Object.values(item).some(value => value !== null && value !== '')

  if (!hasValue) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Debes completar al menos un dato en el item'
    })
  }
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
