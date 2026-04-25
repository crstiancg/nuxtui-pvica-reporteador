import { parametroSchema } from '#shared/zod/parametro.schema'
import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)

  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid parametro id'
    })
  }

  const body = await readValidatedBody(event, parametroSchema.parse)

  try {
    const parametro = await prisma.parametro.update({
      where: { id },
      data: body
    })

    return {
      data: parametro
    }
  } catch (error: unknown) {
    if (isPrismaError(error, 'P2025')) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Parametro not found'
      })
    }

    throw error
  }
})
