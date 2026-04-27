import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)

  const [
    totalCentros,
    totalPeriodos,
    totalReportes,
    totalItems,
    latestPeriodo,
    periodosRecientes,
    departamentos
  ] = await prisma.$transaction([
    prisma.centro.count(),
    prisma.periodo.count(),
    prisma.reporte.count(),
    prisma.reporteItem.count(),
    prisma.periodo.findFirst({
      include: {
        _count: {
          select: {
            reportes: true
          }
        }
      },
      orderBy: [
        { anio: 'desc' },
        { mes: 'desc' }
      ]
    }),
    prisma.periodo.findMany({
      include: {
        _count: {
          select: {
            reportes: true
          }
        }
      },
      orderBy: [
        { anio: 'desc' },
        { mes: 'desc' }
      ],
      take: 5
    }),
    prisma.centro.groupBy({
      by: ['departamento'],
      _count: {
        _all: true
      },
      orderBy: {
        _count: {
          departamento: 'desc'
        }
      },
      take: 5
    })
  ])

  const latestPeriodoStats = latestPeriodo
    ? await prisma.reporteItem.count({
        where: {
          reporte: {
            periodoId: latestPeriodo.id
          }
        }
      })
    : 0

  return {
    summary: {
      totalCentros,
      totalPeriodos,
      totalReportes,
      totalItems
    },
    latestPeriodo: latestPeriodo
      ? {
          id: latestPeriodo.id,
          label: `${latestPeriodo.anio}-${String(latestPeriodo.mes).padStart(2, '0')}`,
          totalReportes: latestPeriodo._count.reportes,
          totalItems: latestPeriodoStats
        }
      : null,
    recentPeriodos: periodosRecientes.map(periodo => ({
      id: periodo.id,
      label: `${periodo.anio}-${String(periodo.mes).padStart(2, '0')}`,
      totalReportes: periodo._count.reportes
    })),
    topDepartamentos: departamentos.map((item) => {
      const totalCentros = typeof item._count === 'object' && item._count && '_all' in item._count
        ? item._count._all ?? 0
        : 0

      return {
        departamento: item.departamento,
        totalCentros
      }
    })
  }
})
