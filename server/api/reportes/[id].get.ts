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

  const reporte = await prisma.reporte.findUnique({
    include: {
      centro: true,
      periodo: true
    },
    where: { id }
  })

  if (!reporte) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Reporte not found'
    })
  }

  return {
    data: reporte
  }
})
