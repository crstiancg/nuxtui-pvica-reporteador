import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)

  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const periodoId = parsePositiveInteger(query.periodoId, 0)
  const page = parsePositiveInteger(query.page, 1)
  const perPage = Math.min(parsePositiveInteger(query.perPage, 10), 100)
  const skip = (page - 1) * perPage
  const searchNumber = Number(search)

  const filters = []

  if (periodoId) {
    filters.push({ periodoId })
  }

  if (search) {
    filters.push(Number.isFinite(searchNumber)
      ? {
          OR: [
            { cloro: searchNumber },
            { conductividad: searchNumber },
            { ph: searchNumber },
            { temperatura: searchNumber },
            { turbiedad: searchNumber },
            { centro: { id: searchNumber } },
            { periodo: { anio: searchNumber } },
            { periodo: { mes: searchNumber } }
          ]
        }
      : { id: -1 })
  }

  const where = filters.length ? { AND: filters } : undefined

  const [total, reportes] = await prisma.$transaction([
    prisma.reporte.count({ where }),
    prisma.reporte.findMany({
      include: {
        centro: true,
        periodo: true
      },
      where,
      skip,
      take: perPage,
      orderBy: { id: 'desc' }
    })
  ])

  return {
    data: reportes,
    meta: {
      page,
      perPage,
      total,
      pageCount: Math.ceil(total / perPage)
    }
  }
})
