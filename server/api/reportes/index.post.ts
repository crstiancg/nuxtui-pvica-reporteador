import { reporteSchema } from '#shared/zod/reporte.schema'
import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)

  const body = await readValidatedBody(event, reporteSchema.parse)

  try {
    const reporte = await prisma.reporte.create({
      data: body,
      include: {
        centro: true,
        periodo: true
      }
    })

    return {
      data: reporte
    }
  } catch (error: unknown) {
    if (isPrismaError(error, 'P2003')) {
      throw createError({
        statusCode: 422,
        statusMessage: 'El periodo o centro seleccionado no existe'
      })
    }

    throw error
  }
})
