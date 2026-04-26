import { reporteSchema } from '#shared/zod/reporte.schema'
import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)

  const body = await readValidatedBody(event, reporteSchema.parse)

  try {
    const reporte = await prisma.reporte.create({
      data: {
        periodoId: body.periodoId,
        centroId: body.centroId,
        items: {
          create: body.items
        }
      },
      include: {
        centro: true,
        periodo: true,
        items: {
          orderBy: { id: 'asc' }
        }
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

    if (isPrismaError(error, 'P2002')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Ya existe un reporte para ese centro en el periodo seleccionado'
      })
    }

    throw error
  }
})
