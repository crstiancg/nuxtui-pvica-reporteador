import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)
  await requirePermission(event, 'periodos.ver')

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

  const [total, periodos, totalCentros] = await prisma.$transaction([
    prisma.periodo.count({ where }),
    prisma.periodo.findMany({
      where,
      skip,
      take: perPage,
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
      include: {
        _count: {
          select: { reportes: true }
        }
      }
    }),
    prisma.centro.count()
  ])

  return {
    data: periodos.map(periodo => ({
      id: periodo.id,
      anio: periodo.anio,
      mes: periodo.mes,
      createdAt: periodo.createdAt,
      updatedAt: periodo.updatedAt,
      totalReportes: periodo._count.reportes,
      totalCentros,
      coberturaPorcentaje: totalCentros > 0
        ? Math.round((periodo._count.reportes / totalCentros) * 1000) / 10
        : 0
    })),
    meta: {
      page,
      perPage,
      total,
      pageCount: Math.ceil(total / perPage)
    }
  }
})
