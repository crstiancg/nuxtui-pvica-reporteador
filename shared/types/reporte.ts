import type { Centro } from '#shared/types/centro'
import type { PaginationMeta } from '#shared/types/pagination'
import type { Periodo } from '#shared/types/periodo'
import type { ReporteItemSchemaType, ReporteSchemaType } from '#shared/zod/reporte.schema'

export type ReporteItem = ReporteItemSchemaType & {
  id: number
  reporteId: number
  createdAt: string
  updatedAt: string
}

export type Reporte = Omit<ReporteSchemaType, 'items'> & {
  id: number
  createdAt: string
  updatedAt: string
  items: ReporteItem[]
  centro?: Centro
  periodo?: Periodo
}

export type ReportesResponse = {
  data: Reporte[]
  meta: PaginationMeta
}
