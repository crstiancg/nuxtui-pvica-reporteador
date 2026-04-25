import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)

  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const page = parsePositiveInteger(query.page, 1)
  const perPage = Math.min(parsePositiveInteger(query.perPage, 10), 100)
  const skip = (page - 1) * perPage
  const searchNumber = Number(search)

  const where = search
    ? Number.isInteger(searchNumber)
      ? {
        OR: [
          { anio: searchNumber },
          { mes: searchNumber }
        ]
      }
      : { id: -1 }
    : undefined

  const [total, periodos] = await prisma.$transaction([
    prisma.periodo.count({ where }),
    prisma.periodo.findMany({
      where,
      skip,
      take: perPage,
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }]
    })
  ])

  return {
    data: periodos,
    meta: {
      page,
      perPage,
      total,
      pageCount: Math.ceil(total / perPage)
    }
  }
})
