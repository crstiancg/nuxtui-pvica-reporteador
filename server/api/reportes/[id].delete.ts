import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)

  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid reporte id'
    })
  }

  try {
    await prisma.reporte.delete({
      where: { id }
    })

    return {
      ok: true
    }
  } catch (error: unknown) {
    if (isPrismaError(error, 'P2025')) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Reporte not found'
      })
    }

    throw error
  }
})
