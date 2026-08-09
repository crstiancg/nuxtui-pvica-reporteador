import pdfMake from 'pdfmake'
import prisma from '~~/lib/prisma'
import { buildInformeDocDefinition, getInformeFonts } from '~~/server/utils/informe-pdf'
import { buildReportePreview } from '~~/server/utils/reporte-preview'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)
  await requirePermission(event, 'reportes.ver')

  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid reporte id'
    })
  }

  const [reporte, parametros, configuracion] = await Promise.all([
    prisma.reporte.findUnique({
      where: { id },
      include: {
        centro: true,
        periodo: true,
        items: { orderBy: { id: 'asc' } }
      }
    }),
    prisma.parametro.findMany({
      select: {
        codigoCabecera: true,
        valor: true,
        limiteMin: true,
        limiteMax: true,
        unidad: true,
        norma: true
      }
    }),
    prisma.configuracionInforme.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 }
    })
  ])

  if (!reporte) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Reporte not found'
    })
  }

  const preview = buildReportePreview(reporte.items as unknown as Record<string, unknown>[], parametros)
  const periodoLabel = `${reporte.periodo.anio}-${String(reporte.periodo.mes).padStart(2, '0')}`
  const centroNombre = reporte.centro.nombreCentroPoblado || reporte.centro.distrito

  const docDefinition = buildInformeDocDefinition(
    {
      id: reporte.id,
      centroNombre,
      centroDistrito: reporte.centro.distrito,
      centroProvincia: reporte.centro.provincia,
      centroDepartamento: reporte.centro.departamento,
      centroUbigeo: reporte.centro.codigoUbigeo,
      periodoMes: reporte.periodo.mes,
      periodoAnio: reporte.periodo.anio,
      decreto: preview.decreto,
      eca: preview.eca
    },
    configuracion
  )

  pdfMake.setFonts(getInformeFonts())
  pdfMake.setLocalAccessPolicy(() => true)

  const pdfDoc = pdfMake.createPdf(docDefinition as never)
  const buffer = await pdfDoc.getBuffer()

  const filename = `informe-${centroNombre.replace(/[^a-zA-Z0-9]+/g, '-')}-${periodoLabel}.pdf`

  setResponseHeaders(event, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="${filename}"`
  })

  return buffer
})
