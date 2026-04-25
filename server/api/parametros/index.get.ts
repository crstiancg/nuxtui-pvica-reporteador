import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)

  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const page = parsePositiveInteger(query.page, 1)
  const perPage = Math.min(parsePositiveInteger(query.perPage, 10), 100)
  const skip = (page - 1) * perPage

  const where = search
    ? {
        OR: [
          { codigoCabecera: { contains: search } },
          { valor: { contains: search } }
        ]
      }
    : undefined

  const [total, parametros] = await prisma.$transaction([
    prisma.parametro.count({ where }),
    prisma.parametro.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { id: 'desc' }
    })
  ])

  return {
    data: parametros,
    meta: {
      page,
      perPage,
      total,
      pageCount: Math.ceil(total / perPage)
    }
  }
})
