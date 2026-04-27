import prisma from '~~/lib/prisma'
import { buildReportePreview } from '~~/server/utils/reporte-preview'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)

  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const periodoId = parsePositiveInteger(query.periodoId, 0)
  const page = parsePositiveInteger(query.page, 1)
  const perPage = Math.min(parsePositiveInteger(query.perPage, 10), 100)
  const skip = (page - 1) * perPage
  const searchNumber = Number(search)

  const filters: object[] = []

  if (periodoId) {
    filters.push({ periodoId })
  }

  if (search) {
    const orFilters: object[] = [
      { centro: { distrito: { contains: search } } },
      { centro: { codigoUbigeo: { contains: search } } },
      { centro: { departamento: { contains: search } } },
      { centro: { provincia: { contains: search } } }
    ]

    if (Number.isFinite(searchNumber)) {
      orFilters.push(
        { centro: { id: searchNumber } },
        { periodo: { anio: searchNumber } },
        { periodo: { mes: searchNumber } },
        {
          items: {
            some: {
              OR: [
                { decretoCloro: searchNumber },
                { decretoConductividad: searchNumber },
                { decretoPh: searchNumber },
                { decretoTemperatura: searchNumber },
                { decretoTurbiedad: searchNumber }
              ]
            }
          }
        }
      )
    }

    filters.push({ OR: orFilters })
  }

  const where = filters.length ? { AND: filters } : undefined

  const [total, reportes, parametros] = await prisma.$transaction([
    prisma.reporte.count({ where }),
    prisma.reporte.findMany({
      include: {
        centro: true,
        periodo: true,
        items: {
          orderBy: { id: 'asc' }
        }
      },
      where,
      skip,
      take: perPage,
      orderBy: { id: 'desc' }
    }),
    prisma.parametro.findMany({
      select: {
        codigoCabecera: true,
        valor: true
      }
    })
  ])

  return {
    data: reportes.map(reporte => ({
      ...reporte,
      preview: buildReportePreview(reporte.items as Record<string, unknown>[], parametros)
    })),
    meta: {
      page,
      perPage,
      total,
      pageCount: Math.ceil(total / perPage)
    }
  }
})
