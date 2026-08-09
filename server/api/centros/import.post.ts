import prisma from '~~/lib/prisma'
import { parseCentroImportWorkbook } from '~~/server/utils/centro-import'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)
  await requirePermission(event, 'centros.crear')

  const formData = await readFormData(event)
  const file = formData.get('file')

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
    const parsedRows = parseCentroImportWorkbook(buffer)
    const uniqueByUbigeo = new Map(parsedRows.map(row => [row.centro.codigoUbigeo, row.centro]))
    const codigosUbigeo = [...uniqueByUbigeo.keys()]

    const existingCentros = await prisma.centro.findMany({
      where: { codigoUbigeo: { in: codigosUbigeo } },
      select: { codigoUbigeo: true }
    })
    const existingSet = new Set(existingCentros.map(centro => centro.codigoUbigeo))

    let created = 0
    let updated = 0

    await prisma.$transaction(async (tx) => {
      for (const centro of uniqueByUbigeo.values()) {
        if (existingSet.has(centro.codigoUbigeo)) {
          updated += 1
        } else {
          created += 1
        }

        await tx.centro.upsert({
          where: { codigoUbigeo: centro.codigoUbigeo },
          update: centro,
          create: centro
        })
      }
    })

    return {
      data: {
        filasProcesadas: parsedRows.length,
        centrosDetectados: uniqueByUbigeo.size,
        centrosCreados: created,
        centrosActualizados: updated
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
