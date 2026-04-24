import type { CentroSchemaType } from '#shared/zod/centro.schema'

export type Centro = CentroSchemaType & {
  id: number
  createdAt: string
  updatedAt: string
}

export type CentrosPaginationMeta = {
  page: number
  perPage: number
  total: number
  pageCount: number
}

export type CentrosResponse = {
  data: Centro[]
  meta: CentrosPaginationMeta
}
