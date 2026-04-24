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

  try {
    await prisma.centro.delete({
      where: { id }
    })

    return {
      ok: true
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

    throw error
  }
})
