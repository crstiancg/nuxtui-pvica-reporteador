import prisma from '~~/lib/prisma'

const parsePositiveInteger = (value: unknown, fallback: number) => {
  const firstValue = Array.isArray(value) ? value[0] : value

  if (typeof firstValue !== 'string' && typeof firstValue !== 'number') {
    return fallback
  }

  const parsed = Number(firstValue)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)
  await requirePermission(event, 'centros.ver')

  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const requestedSearchFields = typeof query.searchFields === 'string'
    ? query.searchFields.split(',').map(field => field.trim()).filter(Boolean)
    : []
  const allowedSearchFields = ['departamento', 'provincia', 'distrito', 'codigoUbigeo', 'nombreCentroPoblado'] as const
  const requestedValidFields = requestedSearchFields.filter((field): field is typeof allowedSearchFields[number] =>
    allowedSearchFields.includes(field as typeof allowedSearchFields[number])
  )
  const searchFields = requestedValidFields.length
    ? requestedValidFields
    : ['distrito', 'nombreCentroPoblado']
  const page = parsePositiveInteger(query.page, 1)
  const perPage = Math.min(parsePositiveInteger(query.perPage, 10), 100)
  const skip = (page - 1) * perPage

  const where = search
    ? {
        OR: searchFields.map(field => ({
          [field]: { contains: search }
        }))
      }
    : undefined

  const [total, centros] = await prisma.$transaction([
    prisma.centro.count({ where }),
    prisma.centro.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { id: 'desc' }
    })
  ])

  return {
    data: centros,
    meta: {
      page,
      perPage,
      total,
      pageCount: Math.ceil(total / perPage)
    }
  }
})
