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

export type CentroMapPoint = {
  id: number
  departamento: string
  provincia: string
  distrito: string
  nombreCentroPoblado: string | null
  codigoUbigeo: string
  ambito: string | null
  tieneSistemaAgua: boolean | null
  poblacionTotal: number | null
  poblacionVigilada: number | null
  latitud: number
  longitud: number
}

export type CentrosMapResponse = {
  data: CentroMapPoint[]
}
