import * as z from 'zod'

const requiredText = (field: string) =>
  z
    .string()
    .trim()
    .min(1, `${field} es requerido`)
    .max(100, `${field} no debe superar los 100 caracteres`)

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(''))
    .nullable()

const optionalInt = () =>
  z
    .number()
    .int()
    .nonnegative()
    .optional()
    .nullable()

const optionalFloat = () =>
  z
    .number()
    .optional()
    .nullable()

const optionalBoolean = () =>
  z
    .boolean()
    .optional()
    .nullable()

export const centroSchema = z.object({
  departamento: requiredText('Departamento'),
  provincia: requiredText('Provincia'),
  distrito: requiredText('Distrito'),
  codigoUbigeo: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'El código ubigeo debe tener 10 dígitos'),

  // Ubicacion / referencia
  nombreCentroPoblado: optionalText(150),
  codigoUbigeoDistrito: optionalText(6),
  ambito: optionalText(20),
  quintil: optionalText(5),

  // Salud
  establecimientoSalud: optionalText(150),
  codigoRenipress: optionalText(20),
  validadoMinsa: optionalBoolean(),

  // Servicio de agua / poblacion
  tieneSistemaAgua: optionalBoolean(),
  poblacionTotal: optionalInt(),
  poblacionServida: optionalInt(),
  poblacionVigilada: optionalInt(),

  // Coordenadas
  coordenadaEste: optionalText(20),
  coordenadaNorte: optionalText(20),
  huso: optionalText(5),
  banda: optionalText(5),
  latitud: optionalFloat(),
  longitud: optionalFloat(),
  altitud: optionalInt()
})

export type CentroSchemaType = z.infer<typeof centroSchema>
