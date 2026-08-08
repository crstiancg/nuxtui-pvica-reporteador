import { userRolesSchema } from '#shared/zod/user-roles.schema'
import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  const session = await requireAuthenticatedSession(event)
  await requirePermission(event, 'usuarios.editar')

  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user id'
    })
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { email: true }
  })

  if (!target) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found'
    })
  }

  if (target.email === session.user.email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No puedes modificar tus propios roles y permisos'
    })
  }

  const body = await readValidatedBody(event, userRolesSchema.parse)

  const user = await prisma.user.update({
    where: { id },
    data: {
      roles: { set: body.roleIds.map(roleId => ({ id: roleId })) },
      permissions: { set: body.permissionIds.map(permissionId => ({ id: permissionId })) }
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      createdAt: true,
      roles: { select: { id: true, name: true, description: true } },
      permissions: { select: { id: true, name: true, description: true } }
    }
  })

  return {
    data: user
  }
})
