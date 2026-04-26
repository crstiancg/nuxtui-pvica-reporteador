import { reporteSchema } from '#shared/zod/reporte.schema'
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

  const body = await readValidatedBody(event, reporteSchema.parse)

  try {
    const reporte = await prisma.reporte.update({
      where: { id },
      data: {
        periodoId: body.periodoId,
        centroId: body.centroId,
        items: {
          deleteMany: {},
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
    if (isPrismaError(error, 'P2025')) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Reporte not found'
      })
    }

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
