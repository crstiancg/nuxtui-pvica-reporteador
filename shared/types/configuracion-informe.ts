import type { ConfiguracionInformeSchemaType } from '#shared/zod/configuracion-informe.schema'

export type ConfiguracionInforme = ConfiguracionInformeSchemaType & {
  id: number
  createdAt: string
  updatedAt: string
}
