import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)

  const configuracion = await prisma.configuracionInforme.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 }
  })

  return {
    data: configuracion
  }
})
