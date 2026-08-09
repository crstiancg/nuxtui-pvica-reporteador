import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)
  await requirePermission(event, 'reportes.ver')

  const [
    totalCentros,
    totalPeriodos,
    totalReportes,
    totalItems,
    latestPeriodoConReportes,
    latestPeriodoAbsoluto,
    periodosRecientes,
    periodosTrend,
    departamentos
  ] = await prisma.$transaction([
    prisma.centro.count(),
    prisma.periodo.count(),
    prisma.reporte.count(),
    prisma.reporteItem.count(),
    prisma.periodo.findFirst({
      where: {
        reportes: {
          some: {}
        }
      },
      include: {
        _count: {
          select: {
            reportes: true
          }
        }
      },
      orderBy: [
        { reportes: { _count: 'desc' } },
        { anio: 'desc' },
        { mes: 'desc' }
      ]
    }),
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
      take: 12
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

  const latestPeriodo = latestPeriodoConReportes ?? latestPeriodoAbsoluto

  const [latestPeriodoItems, provinciaTotales, reportesDelPeriodo] = latestPeriodo
    ? await Promise.all([
        prisma.reporteItem.count({
          where: {
            reporte: {
              periodoId: latestPeriodo.id
            }
          }
        }),
        prisma.centro.groupBy({
          by: ['provincia'],
          _count: { _all: true }
        }),
        prisma.reporte.findMany({
          where: { periodoId: latestPeriodo.id },
          select: { centro: { select: { provincia: true } } }
        })
      ])
    : [0, [], []]

  const reportadosPorProvincia = new Map<string, number>()
  for (const reporte of reportesDelPeriodo) {
    const provincia = reporte.centro.provincia
    reportadosPorProvincia.set(provincia, (reportadosPorProvincia.get(provincia) ?? 0) + 1)
  }

  const coberturaPorProvincia = provinciaTotales
    .map((item) => {
      const provinciaTotal = typeof item._count === 'object' && item._count && '_all' in item._count
        ? item._count._all ?? 0
        : 0
      const centrosReportados = reportadosPorProvincia.get(item.provincia) ?? 0

      return {
        provincia: item.provincia,
        totalCentros: provinciaTotal,
        centrosReportados,
        porcentaje: provinciaTotal > 0 ? Math.round((centrosReportados / provinciaTotal) * 1000) / 10 : 0
      }
    })
    .sort((a, b) => b.porcentaje - a.porcentaje)

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
          totalItems: latestPeriodoItems,
          centrosReportados: latestPeriodo._count.reportes,
          totalCentros,
          coberturaPorcentaje: totalCentros > 0
            ? Math.round((latestPeriodo._count.reportes / totalCentros) * 1000) / 10
            : 0,
          coberturaPorProvincia
        }
      : null,
    recentPeriodos: periodosRecientes.map(periodo => ({
      id: periodo.id,
      label: `${periodo.anio}-${String(periodo.mes).padStart(2, '0')}`,
      totalReportes: periodo._count.reportes
    })),
    periodosTrend: [...periodosTrend]
      .reverse()
      .map(periodo => ({
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
