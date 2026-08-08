import { roleSchema } from '#shared/zod/role.schema'
import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)
  await requirePermission(event, 'usuarios.editar')

  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid role id'
    })
  }

  const body = await readValidatedBody(event, roleSchema.parse)

  try {
    const role = await prisma.role.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description || null,
        permissions: { set: body.permissionIds.map(permissionId => ({ id: permissionId })) }
      },
      select: {
        id: true,
        name: true,
        description: true,
        permissions: { select: { id: true, name: true, description: true } },
        _count: { select: { users: true } }
      }
    })

    return {
      data: role
    }
  } catch (error: unknown) {
    if (isPrismaError(error, 'P2025')) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Role not found'
      })
    }

    if (isPrismaError(error, 'P2002')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Ya existe un rol con ese nombre'
      })
    }

    throw error
  }
})
