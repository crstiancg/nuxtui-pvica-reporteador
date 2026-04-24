import { centroSchema } from '#shared/zod/centro.schema'
import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)

  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid centro id'
    })
  }

  const body = await readValidatedBody(event, centroSchema.parse)

  try {
    const centro = await prisma.centro.update({
      where: { id },
      data: body
    })

    return {
      data: centro
    }
  } catch (error: unknown) {
    if (
      typeof error === 'object'
      && error !== null
      && 'code' in error
      && error.code === 'P2025'
    ) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Centro not found'
      })
    }

    if (
      typeof error === 'object'
      && error !== null
      && 'code' in error
      && error.code === 'P2002'
    ) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Ya existe un centro con ese código ubigeo'
      })
    }

    throw error
  }
})
