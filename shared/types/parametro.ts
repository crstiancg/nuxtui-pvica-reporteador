import type { PaginationMeta } from '#shared/types/pagination'
import type { ParametroSchemaType } from '#shared/zod/parametro.schema'

export type Parametro = ParametroSchemaType & {
  id: number
  createdAt: string
  updatedAt: string
}

export type ParametrosResponse = {
  data: Parametro[]
  meta: PaginationMeta
}
