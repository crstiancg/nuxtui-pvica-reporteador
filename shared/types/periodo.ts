import type { PaginationMeta } from '#shared/types/pagination'
import type { PeriodoSchemaType } from '#shared/zod/periodo.schema'

export type Periodo = PeriodoSchemaType & {
  id: number
  createdAt: string
  updatedAt: string
}

export type PeriodoWithStats = Periodo & {
  totalReportes: number
  totalCentros: number
  coberturaPorcentaje: number
}

export type PeriodosResponse = {
  data: PeriodoWithStats[]
  meta: PaginationMeta
}
