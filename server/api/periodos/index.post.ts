import { periodoSchema } from '#shared/zod/periodo.schema'
import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)

  const body = await readValidatedBody(event, periodoSchema.parse)

  try {
    const periodo = await prisma.periodo.create({
      data: body
    })

    return {
      data: periodo
    }
  } catch (error: unknown) {
    if (isPrismaError(error, 'P2002')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Ya existe un periodo con ese año y mes'
      })
    }

    throw error
  }
})
