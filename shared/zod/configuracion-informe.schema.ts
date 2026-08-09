import * as z from 'zod'

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(''))
    .nullable()

export const configuracionInformeSchema = z.object({
  entidadEmisora: optionalText(200),
  ciudad: optionalText(100),
  destinatarioNombre: optionalText(150),
  destinatarioCargo: optionalText(150),
  firmanteNombre: optionalText(150),
  firmanteCargo: optionalText(150),
  firmanteColegiatura: optionalText(50)
})

export type ConfiguracionInformeSchemaType = z.infer<typeof configuracionInformeSchema>
