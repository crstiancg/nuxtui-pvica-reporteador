import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)
  await requirePermission(event, 'centros.ver')

  const centros = await prisma.centro.findMany({
    where: {
      latitud: { not: null },
      longitud: { not: null }
    },
    select: {
      id: true,
      departamento: true,
      provincia: true,
      distrito: true,
      nombreCentroPoblado: true,
      codigoUbigeo: true,
      ambito: true,
      tieneSistemaAgua: true,
      poblacionTotal: true,
      poblacionVigilada: true,
      latitud: true,
      longitud: true
    },
    orderBy: { id: 'asc' }
  })

  return {
    data: centros
  }
})
