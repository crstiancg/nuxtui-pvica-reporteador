import { configuracionInformeSchema } from '#shared/zod/configuracion-informe.schema'
import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)
  await requirePermission(event, 'usuarios.editar')

  const body = await readValidatedBody(event, configuracionInformeSchema.parse)

  const configuracion = await prisma.configuracionInforme.upsert({
    where: { id: 1 },
    update: body,
    create: { id: 1, ...body }
  })

  return {
    data: configuracion
  }
})
