import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)
  await requirePermission(event, 'usuarios.ver')

  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const page = parsePositiveInteger(query.page, 1)
  const perPage = Math.min(parsePositiveInteger(query.perPage, 10), 100)
  const skip = (page - 1) * perPage

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } }
        ]
      }
    : undefined

  const select = {
    id: true,
    name: true,
    email: true,
    avatar: true,
    createdAt: true,
    roles: { select: { id: true, name: true, description: true } },
    permissions: { select: { id: true, name: true, description: true } }
  } as const

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { id: 'desc' },
      select
    })
  ])

  return {
    data: users,
    meta: {
      page,
      perPage,
      total,
      pageCount: Math.ceil(total / perPage)
    }
  }
})
