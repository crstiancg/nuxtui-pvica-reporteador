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

  const centro = await prisma.centro.findUnique({
    where: { id }
  })

  if (!centro) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Centro not found'
    })
  }

  return {
    data: centro
  }
})
