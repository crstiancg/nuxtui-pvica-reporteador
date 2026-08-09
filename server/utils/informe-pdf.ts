import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import type { ReportePreviewEntry } from '#shared/types/reporte'
import { informeFontsBase64 } from './informe-fonts-data'

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
  periodoMes: number
  periodoAnio: number
  decreto: ReportePreviewEntry[]
  eca: ReportePreviewEntry[]
}

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]

let cachedFontsPath: string | null = null

// Las fuentes viajan embebidas en base64 dentro del bundle (informe-fonts-data.ts)
// porque pdfmake solo acepta rutas de archivo reales, y process.cwd() no es confiable
// una vez compilado (varia segun el hosting/preset de Nitro).
const ensureFontsOnDisk = () => {
  if (cachedFontsPath) return cachedFontsPath

  const dir = join(tmpdir(), 'armind7-informe-fonts')
  mkdirSync(dir, { recursive: true })

  for (const [filename, base64] of Object.entries(informeFontsBase64)) {
    writeFileSync(join(dir, filename), Buffer.from(base64, 'base64'))
  }

  cachedFontsPath = dir
  return dir
}

export const getInformeFonts = () => {
  const fontsPath = ensureFontsOnDisk()

  return {
    Roboto: {
      normal: join(fontsPath, 'Roboto-Regular.ttf'),
      bold: join(fontsPath, 'Roboto-Medium.ttf'),
      italics: join(fontsPath, 'Roboto-Italic.ttf'),
      bolditalics: join(fontsPath, 'Roboto-MediumItalic.ttf')
    }
  }
}

const formatFechaHoy = (ciudad: string | null | undefined) => {
  const now = new Date()
  const fecha = `${now.getDate().toString().padStart(2, '0')} de ${MONTHS[now.getMonth()]} del ${now.getFullYear()}`
  return ciudad ? `${ciudad}, ${fecha}` : fecha
}

const resultRows = (entries: ReportePreviewEntry[]) =>
  entries.filter(entry => entry.calculatedValue !== null && entry.cumple !== null)

const interpretacionLabel = (entry: ReportePreviewEntry) =>
  entry.cumple === false ? 'No cumple' : 'Cumple'

const formatParamLabel = (entry: ReportePreviewEntry) => {
  if (!entry.unidad || entry.unidad.toLowerCase() === 'ph') return entry.label
  return `${entry.label} (${entry.unidad})`
}

const tableLayout = {
  fillColor: (rowIndex: number) => rowIndex === 0 ? '#f1f5f9' : null,
  hLineWidth: () => 0.5,
  vLineWidth: () => 0.5,
  hLineColor: () => '#cbd5e1',
  vLineColor: () => '#cbd5e1'
}

const buildParamTable = (entries: ReportePreviewEntry[], headerParamLabel: string, headerValueLabel: string) => {
  const rows = resultRows(entries)

  if (!rows.length) {
    return { text: 'No se registraron valores evaluables para este grupo.', italics: true, color: '#666666', fontSize: 9 }
  }

  return {
    table: {
      headerRows: 1,
      widths: ['*', 'auto', 'auto'],
      body: [
        [
          { text: headerParamLabel, style: 'tableHeader' },
          { text: headerValueLabel, style: 'tableHeader' },
          { text: 'Interpretacion', style: 'tableHeader' }
        ],
        ...rows.map(entry => [
          { text: formatParamLabel(entry), fontSize: 9 },
          { text: String(entry.calculatedValue), fontSize: 9 },
          {
            text: interpretacionLabel(entry),
            fontSize: 9,
            color: entry.cumple === false ? '#b91c1c' : '#15803d',
            bold: true
          }
        ])
      ]
    },
    layout: tableLayout
  }
}

const buildConclusiones = (decreto: ReportePreviewEntry[], eca: ReportePreviewEntry[]) => {
  const all = [...resultRows(decreto), ...resultRows(eca)]
  const noCumple = all.filter(entry => entry.cumple === false)

  if (!all.length) {
    return {
      conclusiones: ['No se registraron valores suficientes para emitir una conclusión.'],
      recomendaciones: ['Se recomienda completar el registro de parámetros para el siguiente periodo.'],
      hayIncumplimientos: false
    }
  }

  if (!noCumple.length) {
    return {
      conclusiones: [
        'Todos los parámetros evaluados en el periodo fueron admisibles en la fuente de suministro.',
        'La calidad de agua de la Red y/o Reservorio cumple(n) con los parámetros evaluados.'
      ],
      recomendaciones: [
        'La fuente el suministro puede ser siguiendo empleado con simple de desinfección, por que es pertinente acciones de limpieza y mantenimiento de la fuente a fin de preservar esta calidad.'
      ],
      hayIncumplimientos: false
    }
  }

  return {
    conclusiones: [
      `Se identificaron ${noCumple.length} parámetro${noCumple.length === 1 ? '' : 's'} que no cumple${noCumple.length === 1 ? '' : 'n'} con el límite normado: ${noCumple.map(entry => entry.label).join(', ')}.`
    ],
    recomendaciones: [
      'Investigar de inmediato las causas de los parámetros que no cumplen y adoptar medidas correctivas.',
      'Reforzar la desinfección y el mantenimiento de la fuente, reservorio y red de distribución.'
    ],
    hayIncumplimientos: true
  }
}

export const buildInformeDocDefinition = (reporte: InformeReporte, configuracion: ConfiguracionLike) => {
  const { conclusiones, recomendaciones } = buildConclusiones(reporte.decreto, reporte.eca)
  const monthName = (MONTHS[reporte.periodoMes - 1] ?? '').toUpperCase()
  const entidadLines = (configuracion.entidadEmisora ?? '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  return {
    pageMargins: [40, 40, 40, 60],
    content: [
      { text: `INFORME N° ${reporte.id}-${new Date().getFullYear()}`, style: 'title', margin: [0, 0, 0, 12] },

      {
        columns: [
          { width: 60, text: 'PARA :', bold: true },
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
          { width: 60, text: 'ASUNTO :', bold: true },
          {
            width: '*',
            text: [
              { text: 'Informe de monitoreo – ' },
              { text: reporte.centroNombre, bold: true }
            ]
          }
        ],
        margin: [0, 0, 0, 4]
      },
      {
        columns: [
          { width: 60, text: 'FECHA :', bold: true },
          { width: '*', text: formatFechaHoy(configuracion.ciudad) }
        ],
        margin: [0, 0, 0, 16]
      },

      {
        text: `Previo cordial saludo, mediante la presente le informo la calidad de agua en base a parámetros obligatorios de la fuente de suministro, reservorio y redes, de la localidad de ${reporte.centroNombre} registrado en el SIVICA en el mes de ${monthName} del ${reporte.periodoAnio}; se emite la presente para las acciones correspondientes.`,
        margin: [0, 0, 0, 16]
      },

      { text: 'I. Objetivo', style: 'sectionTitle' },
      {
        text: `Determinar los riesgos sanitarios de la calidad de agua del sistema de abastecimiento de agua para consumo humano de ${reporte.centroNombre}.`,
        margin: [0, 4, 0, 16]
      },

      { text: 'II. Resultados', style: 'sectionTitle' },
      { text: monthName, alignment: 'center', bold: true, fontSize: 10, margin: [0, 4, 0, 4] },
      {
        columns: [
          buildParamTable(reporte.eca, 'Parametros (DECRETO SUPREMO N° 004-2017-MINAM)', 'Captacion'),
          buildParamTable(reporte.decreto, 'Parametros D.S. N° 031-2010-SA', 'Reservorio y/o Red')
        ],
        columnGap: 12
      },
      { text: 'Fuente: http://pvica.minsa.gob.pe/', fontSize: 8, italics: true, color: '#666666', margin: [0, 4, 0, 16] },

      { text: 'III. Conclusiones', style: 'sectionTitle' },
      {
        stack: conclusiones.map(line => ({ text: `- ${line}`, margin: [0, 2, 0, 0] })),
        margin: [0, 4, 0, 16]
      },

      { text: 'IV. Recomendaciones', style: 'sectionTitle' },
      {
        stack: recomendaciones.map(line => ({ text: `- ${line}`, margin: [0, 2, 0, 0] })),
        margin: [0, 4, 0, 20]
      },

      {
        columns: [
          { width: '*', text: '' },
          {
            width: 240,
            stack: [
              entidadLines.length
                ? { stack: entidadLines.map(line => ({ text: line, alignment: 'center', bold: true, fontSize: 8 })), margin: [0, 0, 0, 20] }
                : null,
              { text: '_______________________________', alignment: 'center' },
              { text: configuracion.firmanteNombre || '(firmante no configurado)', alignment: 'center', bold: true, margin: [0, 4, 0, 0] },
              configuracion.firmanteColegiatura ? { text: configuracion.firmanteColegiatura, alignment: 'center', fontSize: 9 } : null,
              configuracion.firmanteCargo ? { text: configuracion.firmanteCargo, alignment: 'center', fontSize: 9 } : null
            ].filter(Boolean)
          }
        ]
      }
    ],
    styles: {
      title: { fontSize: 13, bold: true },
      sectionTitle: { fontSize: 12, bold: true, margin: [0, 8, 0, 0] },
      tableHeader: { bold: true, fontSize: 9 }
    },
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
      lineHeight: 1.2
    }
  }
}
