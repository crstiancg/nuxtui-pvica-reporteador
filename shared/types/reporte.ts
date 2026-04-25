import type { Centro } from '#shared/types/centro'
import type { PaginationMeta } from '#shared/types/pagination'
import type { Periodo } from '#shared/types/periodo'
import type { ReporteSchemaType } from '#shared/zod/reporte.schema'

export type Reporte = ReporteSchemaType & {
  id: number
  createdAt: string
  updatedAt: string
  centro?: Centro
  periodo?: Periodo
}

export type ReportesResponse = {
  data: Reporte[]
  meta: PaginationMeta
}
