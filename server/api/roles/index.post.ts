import { roleSchema } from '#shared/zod/role.schema'
import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)
  await requirePermission(event, 'usuarios.crear')

  const body = await readValidatedBody(event, roleSchema.parse)

  try {
    const role = await prisma.role.create({
      data: {
        name: body.name,
        description: body.description || null,
        permissions: { connect: body.permissionIds.map(id => ({ id })) }
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
    if (isPrismaError(error, 'P2002')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Ya existe un rol con ese nombre'
      })
    }

    throw error
  }
})
