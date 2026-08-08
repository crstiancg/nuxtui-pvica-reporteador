import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)
  await requirePermission(event, 'usuarios.eliminar')

  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid role id'
    })
  }

  const role = await prisma.role.findUnique({
    where: { id },
    select: { _count: { select: { users: true } } }
  })

  if (!role) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Role not found'
    })
  }

  if (role._count.users > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: `No se puede eliminar: el rol esta asignado a ${role._count.users} usuario(s)`
    })
  }

  await prisma.role.delete({ where: { id } })

  return {
    data: true
  }
})
