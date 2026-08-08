import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)
  await requirePermission(event, 'usuarios.ver')

  const permissions = await prisma.permission.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true
    }
  })

  return {
    data: permissions
  }
})
