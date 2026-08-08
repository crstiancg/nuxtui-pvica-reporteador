import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)
  await requirePermission(event, 'usuarios.ver')

  const roles = await prisma.role.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      permissions: { select: { id: true, name: true, description: true } },
      _count: { select: { users: true } }
    }
  })

  return {
    data: roles
  }
})
