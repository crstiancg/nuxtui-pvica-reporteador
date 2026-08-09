import { join } from 'node:path'
import type { ReportePreviewEntry } from '#shared/types/reporte'

type ConfiguracionLike = {
  entidadEmisora?: string | null
  ciudad?: string | null
  destinatarioNombre?: string | null
  destinatarioCargo?: string | null
  firmanteNombre?: string | null
  firmanteCargo?: string | null
  firmanteColegiatura?: string | null
}

type InformeReporte = {
  id: number
  centroNombre: string
  centroDistrito: string
  centroProvincia: string
  centroDepartamento: string
  centroUbigeo: string
  periodoLabel: string
  decreto: ReportePreviewEntry[]
  eca: ReportePreviewEntry[]
}

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]

const fontsPath = join(process.cwd(), 'server/assets/fonts/Roboto')

export const informeFonts = {
  Roboto: {
    normal: join(fontsPath, 'Roboto-Regular.ttf'),
    bold: join(fontsPath, 'Roboto-Medium.ttf'),
    italics: join(fontsPath, 'Roboto-Italic.ttf'),
    bolditalics: join(fontsPath, 'Roboto-MediumItalic.ttf')
  }
}

const formatFechaHoy = (ciudad: string | null | undefined) => {
  const now = new Date()
  const fecha = `${now.getDate().toString().padStart(2, '0')} de ${MONTHS[now.getMonth()]} del ${now.getFullYear()}`
  return ciudad ? `${ciudad}, ${fecha}` : fecha
}

const resultRows = (entries: ReportePreviewEntry[]) =>
  entries.filter(entry => entry.calculatedValue !== null)

const interpretacionLabel = (entry: ReportePreviewEntry) => {
  if (entry.cumple === true) return 'Cumple'
  if (entry.cumple === false) return 'No cumple'
  return 'Sin límite normado'
}

const buildResultTable = (entries: ReportePreviewEntry[]) => {
  const rows = resultRows(entries)

  if (!rows.length) {
    return { text: 'No se registraron valores para este grupo.', italics: true, color: '#666666', margin: [0, 4, 0, 12] }
  }

  return {
    table: {
      headerRows: 1,
      widths: ['*', 'auto', 'auto', 'auto'],
      body: [
        [
          { text: 'Parámetro', style: 'tableHeader' },
          { text: 'Valor', style: 'tableHeader' },
          { text: 'Límite', style: 'tableHeader' },
          { text: 'Interpretación', style: 'tableHeader' }
        ],
        ...rows.map(entry => [
          entry.label,
          `${entry.calculatedValue}${entry.unidad ? ` ${entry.unidad}` : ''}`,
          entry.limiteLabel ?? '—',
          {
            text: interpretacionLabel(entry),
            color: entry.cumple === false ? '#b91c1c' : entry.cumple === true ? '#15803d' : '#666666',
            bold: entry.cumple !== null
          }
        ])
      ]
    },
    layout: {
      fillColor: (rowIndex: number) => rowIndex === 0 ? '#f1f5f9' : null,
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#cbd5e1',
      vLineColor: () => '#cbd5e1'
    },
    margin: [0, 4, 0, 12]
  }
}

const buildConclusiones = (decreto: ReportePreviewEntry[], eca: ReportePreviewEntry[]) => {
  const all = [...resultRows(decreto), ...resultRows(eca)]
  const noCumple = all.filter(entry => entry.cumple === false)

  if (!all.length) {
    return { lines: ['No se registraron valores suficientes para emitir una conclusión.'], hayIncumplimientos: false }
  }

  if (!noCumple.length) {
    return {
      lines: [
        'Todos los parámetros evaluados en el periodo fueron admisibles.',
        'La calidad de agua de la fuente, reservorio y/o red cumple con los parámetros evaluados.'
      ],
      hayIncumplimientos: false
    }
  }

  return {
    lines: [
      `Se identificaron ${noCumple.length} parámetro${noCumple.length === 1 ? '' : 's'} que no cumple${noCumple.length === 1 ? '' : 'n'} con el límite normado: ${noCumple.map(entry => entry.label).join(', ')}.`,
      'Se recomienda investigar las causas y adoptar medidas correctivas de forma inmediata.'
    ],
    hayIncumplimientos: true
  }
}

export const buildInformeDocDefinition = (reporte: InformeReporte, configuracion: ConfiguracionLike) => {
  const { lines: conclusiones, hayIncumplimientos } = buildConclusiones(reporte.decreto, reporte.eca)

  return {
    pageMargins: [40, 40, 40, 60],
    content: [
      configuracion.entidadEmisora
        ? { text: configuracion.entidadEmisora, style: 'letterhead', margin: [0, 0, 0, 16] }
        : null,

      { text: `INFORME N° ${reporte.id}-${new Date().getFullYear()}`, style: 'title', margin: [0, 0, 0, 12] },

      {
        columns: [
          { width: 60, text: 'PARA', bold: true },
          {
            width: '*',
            text: [
              configuracion.destinatarioNombre || '(destinatario no configurado)',
              configuracion.destinatarioCargo ? `\n${configuracion.destinatarioCargo}` : ''
            ]
          }
        ],
        margin: [0, 0, 0, 4]
      },
      {
        columns: [
          { width: 60, text: 'ASUNTO', bold: true },
          { width: '*', text: `Informe de monitoreo – ${reporte.centroNombre}` }
        ],
        margin: [0, 0, 0, 4]
      },
      {
        columns: [
          { width: 60, text: 'FECHA', bold: true },
          { width: '*', text: formatFechaHoy(configuracion.ciudad) }
        ],
        margin: [0, 0, 0, 16]
      },

      {
        text: `Previo cordial saludo, mediante la presente se informa la calidad de agua en base a parámetros obligatorios de la fuente de suministro, reservorio y redes, de la localidad de ${reporte.centroNombre} (${reporte.centroDistrito}, ${reporte.centroProvincia}, ${reporte.centroDepartamento} — Ubigeo ${reporte.centroUbigeo}), correspondiente al periodo ${reporte.periodoLabel}; se emite la presente para las acciones correspondientes.`,
        margin: [0, 0, 0, 16]
      },

      { text: 'I. Objetivo', style: 'sectionTitle' },
      {
        text: `Determinar los riesgos sanitarios de la calidad de agua del sistema de abastecimiento de agua para consumo humano de ${reporte.centroNombre}.`,
        margin: [0, 4, 0, 16]
      },

      { text: 'II. Resultados', style: 'sectionTitle' },
      { text: 'Captación (D.S. N° 004-2017-MINAM — ECA Categoría 1, Subcategoría A1)', style: 'subTitle' },
      buildResultTable(reporte.eca),
      { text: 'Reservorio y/o Red (D.S. N° 031-2010-SA)', style: 'subTitle' },
      buildResultTable(reporte.decreto),

      { text: 'III. Conclusiones', style: 'sectionTitle' },
      {
        ul: conclusiones,
        margin: [0, 4, 0, 16]
      },

      { text: 'IV. Recomendaciones', style: 'sectionTitle' },
      {
        ul: hayIncumplimientos
          ? [
              'Investigar de inmediato las causas de los parámetros que no cumplen y adoptar medidas correctivas.',
              'Reforzar la desinfección y mantenimiento de la fuente, reservorio y red de distribución.'
            ]
          : [
              'La fuente de suministro puede seguir siendo empleada, manteniendo la desinfección, ya que es pertinente continuar con las acciones de limpieza y mantenimiento de la fuente a fin de preservar esta calidad.'
            ],
        margin: [0, 4, 0, 20]
      },

      {
        columns: [
          { width: '*', text: '' },
          {
            width: 220,
            stack: [
              { text: '_______________________________', alignment: 'center' },
              { text: configuracion.firmanteNombre || '(firmante no configurado)', alignment: 'center', bold: true, margin: [0, 4, 0, 0] },
              configuracion.firmanteColegiatura ? { text: configuracion.firmanteColegiatura, alignment: 'center', fontSize: 9 } : null,
              configuracion.firmanteCargo ? { text: configuracion.firmanteCargo, alignment: 'center', fontSize: 9 } : null
            ].filter(Boolean)
          }
        ]
      }
    ].filter(Boolean),
    styles: {
      letterhead: { fontSize: 11, bold: true, alignment: 'center' },
      title: { fontSize: 13, bold: true },
      sectionTitle: { fontSize: 12, bold: true, margin: [0, 8, 0, 0] },
      subTitle: { fontSize: 10, bold: true, italics: true, margin: [0, 8, 0, 0] },
      tableHeader: { bold: true, fontSize: 9 }
    },
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
      lineHeight: 1.2
    }
  }
}
