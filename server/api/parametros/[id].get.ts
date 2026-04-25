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

  const parametro = await prisma.parametro.findUnique({
    where: { id }
  })

  if (!parametro) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Parametro not found'
    })
  }

  return {
    data: parametro
  }
})
