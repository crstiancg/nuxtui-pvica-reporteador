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

  const periodo = await prisma.periodo.findUnique({
    where: { id }
  })

  if (!periodo) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Periodo not found'
    })
  }

  return {
    data: periodo
  }
})
