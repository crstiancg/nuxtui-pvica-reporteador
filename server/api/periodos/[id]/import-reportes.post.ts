import prisma from '~~/lib/prisma'
import { parseReporteImportWorkbook } from '~~/server/utils/reporte-import'

const IMPORT_MODES = ['append', 'replace'] as const

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)

  const periodoId = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(periodoId) || periodoId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Periodo invalido'
    })
  }

  const formData = await readFormData(event)
  const modeValue = String(formData.get('mode') ?? 'replace')
  const file = formData.get('file')
  const mode = IMPORT_MODES.includes(modeValue as (typeof IMPORT_MODES)[number])
    ? modeValue as (typeof IMPORT_MODES)[number]
    : 'replace'

  if (!(file instanceof File)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Debes adjuntar un archivo de Excel'
    })
  }

  const lowerName = file.name.toLowerCase()

  if (!lowerName.endsWith('.xlsx') && !lowerName.endsWith('.xls')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Solo se aceptan archivos .xlsx o .xls'
    })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  try {
    const parsedRows = parseReporteImportWorkbook(buffer)
    const uniqueUbigeos = [...new Set(parsedRows.map(row => row.codigoUbigeo))]

    const [periodo, centros] = await prisma.$transaction([
      prisma.periodo.findUnique({
        where: { id: periodoId },
        select: { id: true }
      }),
      prisma.centro.findMany({
        where: {
          codigoUbigeo: {
            in: uniqueUbigeos
          }
        },
        select: {
          id: true,
          codigoUbigeo: true,
          distrito: true
        }
      })
    ])

    if (!periodo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Periodo no encontrado'
      })
    }

    const centroByUbigeo = new Map(centros.map(centro => [centro.codigoUbigeo, centro]))
    const missingCenters = uniqueUbigeos.filter(codigoUbigeo => !centroByUbigeo.has(codigoUbigeo))

    if (missingCenters.length) {
      throw createError({
        statusCode: 422,
        statusMessage: `No existen centros registrados para estos ubigeos: ${missingCenters.slice(0, 10).join(', ')}`
      })
    }

    const itemsByCentro = new Map<number, typeof parsedRows[number]['item'][]>()

    for (const row of parsedRows) {
      const centro = centroByUbigeo.get(row.codigoUbigeo)

      if (!centro) {
        throw createError({
          statusCode: 422,
          statusMessage: `Fila ${row.rowNumber}: no se encontro el centro con ubigeo ${row.codigoUbigeo}`
        })
      }

      const currentItems = itemsByCentro.get(centro.id) ?? []
      currentItems.push(row.item)
      itemsByCentro.set(centro.id, currentItems)
    }

    const centroIds = [...itemsByCentro.keys()]
    const existingReports = await prisma.reporte.findMany({
      where: {
        periodoId,
        centroId: {
          in: centroIds
        }
      },
      select: {
        id: true,
        centroId: true
      }
    })

    const existingCentroIds = new Set(existingReports.map(report => report.centroId))
    let created = 0
    let updated = 0

    await prisma.$transaction(async (tx) => {
      for (const centroId of centroIds) {
        const items = itemsByCentro.get(centroId) ?? []

        if (existingCentroIds.has(centroId)) {
          updated += 1

          await tx.reporte.update({
            where: {
              periodoId_centroId: {
                periodoId,
                centroId
              }
            },
            data: mode === 'replace'
              ? {
                  items: {
                    deleteMany: {},
                    create: items
                  }
                }
              : {
                  items: {
                    create: items
                  }
                }
          })
        } else {
          created += 1

          await tx.reporte.create({
            data: {
              periodoId,
              centroId,
              items: {
                create: items
              }
            }
          })
        }
      }
    })

    return {
      data: {
        mode,
        centrosAfectados: centroIds.length,
        filasProcesadas: parsedRows.length,
        itemsImportados: parsedRows.length,
        reportesCreados: created,
        reportesActualizados: updated
      }
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    if (error instanceof Error) {
      throw createError({
        statusCode: 422,
        statusMessage: error.message
      })
    }

    throw error
  }
})
