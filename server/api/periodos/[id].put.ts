import { periodoSchema } from '#shared/zod/periodo.schema'
import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)

  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid periodo id'
    })
  }

  const body = await readValidatedBody(event, periodoSchema.parse)

  try {
    const periodo = await prisma.periodo.update({
      where: { id },
      data: body
    })

    return {
      data: periodo
    }
  } catch (error: unknown) {
    if (isPrismaError(error, 'P2025')) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Periodo not found'
      })
    }

    if (isPrismaError(error, 'P2002')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Ya existe un periodo con ese año y mes'
      })
    }

    throw error
  }
})
