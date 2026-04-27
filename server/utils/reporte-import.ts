import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const XLSX = require('xlsx') as typeof import('xlsx')

type ReporteItemImportInput = {
  codigoMuestreo: string | null
  codigoMuestra: string | null
  coordenadaEste: string | null
  coordenadaNorte: string | null
  husoBanda: string | null
  altura: string | null
  estadoMuestreo: string | null
  fechaMuestreo: string | null
  fechaFinalizado: string | null
  lugarMuestreoId: string | null
  lugarMuestreoUbicacion: string | null
  lugarMuestreoNombre: string | null
  continuidadHorasDia: string | null
  continuidadDiasSemana: string | null
  decretoAluminio: string | null
  decretoBacteriasColiformesFecales: string | null
  decretoBacteriasColiformesTotales: string | null
  decretoBacteriasHeterotroficas: string | null
  decretoCloro: number | null
  decretoCobre: string | null
  decretoConductividad: number | null
  decretoCromoTotal: string | null
  decretoEColiNmp: string | null
  decretoHierro: string | null
  decretoHuevosLarvasHelmintos: string | null
  decretoManganeso: string | null
  decretoNitratos: string | null
  decretoNitritosExposicionCorta: string | null
  decretoOrganismosVidaLibre: string | null
  decretoPh: number | null
  decretoSolidosTotalesDisueltos: string | null
  decretoSulfatos: string | null
  decretoTemperatura: number | null
  decretoTurbiedad: number | null
  ecaAluminio: string | null
  ecaCobre: string | null
  ecaColiformesTermotolerantes: string | null
  ecaColiformesTotales: string | null
  ecaConductividad: string | null
  ecaCromoTotal: string | null
  ecaEscherichiaColi: string | null
  ecaFormasParasitarias: string | null
  ecaHierro: string | null
  ecaManganeso: string | null
  ecaNitratos: string | null
  ecaNitritos: string | null
  ecaOrganismosVidaLibre: string | null
  ecaPh: string | null
  ecaSulfatos: string | null
  ecaTemperatura: string | null
  ecaTurbiedad: string | null
}

export type ParsedReporteImportRow = {
  codigoUbigeo: string
  item: ReporteItemImportInput
  rowNumber: number
}

type ColumnDescriptor = {
  group: string
  header: string
}

type FieldSpec = {
  groupAliases?: readonly string[]
  headerAliases: readonly string[]
  key: keyof ReporteItemImportInput | 'codigoUbigeo'
  required?: boolean
  type: 'number' | 'text'
}

const normalizeAliases = (aliases: readonly string[]) => aliases.map(alias => normalizeHeader(alias))

const FIELD_SPECS: readonly FieldSpec[] = [
  { key: 'codigoUbigeo', headerAliases: ['ubigeo'], required: true, type: 'text' },
  { key: 'codigoMuestreo', headerAliases: ['# muestreo'], type: 'text' },
  { key: 'codigoMuestra', headerAliases: ['# muestra'], type: 'text' },
  { key: 'coordenadaEste', groupAliases: ['coordenadas de la muestra'], headerAliases: ['este.'], type: 'text' },
  { key: 'coordenadaNorte', groupAliases: ['coordenadas de la muestra'], headerAliases: ['norte'], type: 'text' },
  { key: 'husoBanda', groupAliases: ['coordenadas de la muestra'], headerAliases: ['huso banda'], type: 'text' },
  { key: 'altura', groupAliases: ['coordenadas de la muestra'], headerAliases: ['altura'], type: 'text' },
  { key: 'estadoMuestreo', headerAliases: ['estado muestreo'], type: 'text' },
  { key: 'fechaMuestreo', headerAliases: ['fecha muestreo'], type: 'text' },
  { key: 'fechaFinalizado', headerAliases: ['fecha finalizado'], type: 'text' },
  { key: 'lugarMuestreoId', groupAliases: ['lugar de muestreo'], headerAliases: ['id'], type: 'text' },
  { key: 'lugarMuestreoUbicacion', groupAliases: ['lugar de muestreo'], headerAliases: ['ubicacion'], type: 'text' },
  { key: 'lugarMuestreoNombre', groupAliases: ['lugar de muestreo'], headerAliases: ['nombre'], type: 'text' },
  { key: 'continuidadHorasDia', groupAliases: ['continuidad'], headerAliases: ['horas dia'], type: 'text' },
  { key: 'continuidadDiasSemana', groupAliases: ['continuidad'], headerAliases: ['dias semana'], type: 'text' },
  { key: 'decretoAluminio', groupAliases: ['parametros decreto'], headerAliases: ['aluminio'], type: 'text' },
  { key: 'decretoBacteriasColiformesFecales', groupAliases: ['parametros decreto'], headerAliases: ['bacterias coliformes fecales ufc'], type: 'text' },
  { key: 'decretoBacteriasColiformesTotales', groupAliases: ['parametros decreto'], headerAliases: ['bacterias coliformes totales ufc'], type: 'text' },
  { key: 'decretoBacteriasHeterotroficas', groupAliases: ['parametros decreto'], headerAliases: ['bacterias heterotroficas'], type: 'text' },
  { key: 'decretoCloro', groupAliases: ['parametros decreto'], headerAliases: ['cloro'], required: true, type: 'number' },
  { key: 'decretoCobre', groupAliases: ['parametros decreto'], headerAliases: ['cobre'], type: 'text' },
  { key: 'decretoConductividad', groupAliases: ['parametros decreto'], headerAliases: ['conductividad'], required: true, type: 'number' },
  { key: 'decretoCromoTotal', groupAliases: ['parametros decreto'], headerAliases: ['cromo total'], type: 'text' },
  { key: 'decretoEColiNmp', groupAliases: ['parametros decreto'], headerAliases: ['e coli nmp'], type: 'text' },
  { key: 'decretoHierro', groupAliases: ['parametros decreto'], headerAliases: ['hierro'], type: 'text' },
  { key: 'decretoHuevosLarvasHelmintos', groupAliases: ['parametros decreto'], headerAliases: ['huevos larvas helmintos'], type: 'text' },
  { key: 'decretoManganeso', groupAliases: ['parametros decreto'], headerAliases: ['manganeso'], type: 'text' },
  { key: 'decretoNitratos', groupAliases: ['parametros decreto'], headerAliases: ['nitratos'], type: 'text' },
  { key: 'decretoNitritosExposicionCorta', groupAliases: ['parametros decreto'], headerAliases: ['nitritos exposicion corta'], type: 'text' },
  { key: 'decretoOrganismosVidaLibre', groupAliases: ['parametros decreto'], headerAliases: ['organismos de vida libre'], type: 'text' },
  { key: 'decretoPh', groupAliases: ['parametros decreto'], headerAliases: ['ph'], required: true, type: 'number' },
  { key: 'decretoSolidosTotalesDisueltos', groupAliases: ['parametros decreto'], headerAliases: ['solidos totales disueltos'], type: 'text' },
  { key: 'decretoSulfatos', groupAliases: ['parametros decreto'], headerAliases: ['sulfatos'], type: 'text' },
  { key: 'decretoTemperatura', groupAliases: ['parametros decreto'], headerAliases: ['temperatura'], required: true, type: 'number' },
  { key: 'decretoTurbiedad', groupAliases: ['parametros decreto'], headerAliases: ['turbiedad'], required: true, type: 'number' },
  { key: 'ecaAluminio', groupAliases: ['parametros eca'], headerAliases: ['aluminio'], type: 'text' },
  { key: 'ecaCobre', groupAliases: ['parametros eca'], headerAliases: ['cobre_'], type: 'text' },
  { key: 'ecaColiformesTermotolerantes', groupAliases: ['parametros eca'], headerAliases: ['coliformes termotolerantes  _'], type: 'text' },
  { key: 'ecaColiformesTotales', groupAliases: ['parametros eca'], headerAliases: ['coliformes totales  _'], type: 'text' },
  { key: 'ecaConductividad', groupAliases: ['parametros eca'], headerAliases: ['conductividad'], type: 'text' },
  { key: 'ecaCromoTotal', groupAliases: ['parametros eca'], headerAliases: ['cromo total_'], type: 'text' },
  { key: 'ecaEscherichiaColi', groupAliases: ['parametros eca'], headerAliases: ['escherichia  coli  _'], type: 'text' },
  { key: 'ecaFormasParasitarias', groupAliases: ['parametros eca'], headerAliases: ['formas parasitarias_'], type: 'text' },
  { key: 'ecaHierro', groupAliases: ['parametros eca'], headerAliases: ['hierro_'], type: 'text' },
  { key: 'ecaManganeso', groupAliases: ['parametros eca'], headerAliases: ['manganeso _'], type: 'text' },
  { key: 'ecaNitratos', groupAliases: ['parametros eca'], headerAliases: ['nitratos_'], type: 'text' },
  { key: 'ecaNitritos', groupAliases: ['parametros eca'], headerAliases: ['nitritos_'], type: 'text' },
  { key: 'ecaOrganismosVidaLibre', groupAliases: ['parametros eca'], headerAliases: ['organismos de vida libre algas protozoarios copepodos rotiferos nematodos en todos sus estadios evolutivos'], type: 'text' },
  { key: 'ecaPh', groupAliases: ['parametros eca'], headerAliases: ['ph'], type: 'text' },
  { key: 'ecaSulfatos', groupAliases: ['parametros eca'], headerAliases: ['sulfatos_'], type: 'text' },
  { key: 'ecaTemperatura', groupAliases: ['parametros eca'], headerAliases: ['temperatura'], type: 'text' },
  { key: 'ecaTurbiedad', groupAliases: ['parametros eca'], headerAliases: ['turbiedad'], type: 'text' }
] as const

const normalizeHeader = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()

const normalizeCellValue = (value: unknown) => {
  const normalized = String(value ?? '').trim()

  if (!normalized || normalized.toLowerCase() === 'null') {
    return ''
  }

  return normalized
}

const parseOptionalText = (value: unknown) => {
  const normalized = normalizeCellValue(value)
  return normalized || null
}

const parseOptionalNumber = (value: unknown, field: string, rowNumber: number) => {
  const normalized = normalizeCellValue(value)

  if (!normalized) {
    return null
  }

  const parsed = Number(normalized.replace(',', '.'))

  if (!Number.isFinite(parsed)) {
    throw new Error(`Fila ${rowNumber}: ${field} debe ser numerico`)
  }

  return parsed
}

const detectHeaderRowIndex = (rows: unknown[][]) => {
  return rows.findIndex((row) => {
    const normalizedHeaders = row.map(normalizeHeader).filter(Boolean)

    return normalizedHeaders.includes('ubigeo') && normalizedHeaders.includes('cloro') && normalizedHeaders.includes('conductividad')
  })
}

const buildColumnDescriptors = (groupRow: unknown[] | undefined, headerRow: unknown[]) => {
  let currentGroup = ''

  return headerRow.map((header, index): ColumnDescriptor => {
    const normalizedGroup = normalizeHeader(groupRow?.[index])

    if (normalizedGroup) {
      currentGroup = normalizedGroup
    }

    return {
      group: currentGroup,
      header: normalizeHeader(header)
    }
  })
}

const matchesAliases = (value: string, aliases: readonly string[]) => normalizeAliases(aliases).includes(value)

const findColumnIndex = (columns: ColumnDescriptor[], spec: FieldSpec) =>
  columns.findIndex((column) => {
    const headerMatches = matchesAliases(column.header, spec.headerAliases)

    if (!headerMatches) {
      return false
    }

    if (!spec.groupAliases?.length) {
      return true
    }

    return matchesAliases(column.group, spec.groupAliases)
  })

const createEmptyItem = (): ReporteItemImportInput => ({
  codigoMuestreo: null,
  codigoMuestra: null,
  coordenadaEste: null,
  coordenadaNorte: null,
  husoBanda: null,
  altura: null,
  estadoMuestreo: null,
  fechaMuestreo: null,
  fechaFinalizado: null,
  lugarMuestreoId: null,
  lugarMuestreoUbicacion: null,
  lugarMuestreoNombre: null,
  continuidadHorasDia: null,
  continuidadDiasSemana: null,
  decretoAluminio: null,
  decretoBacteriasColiformesFecales: null,
  decretoBacteriasColiformesTotales: null,
  decretoBacteriasHeterotroficas: null,
  decretoCloro: null,
  decretoCobre: null,
  decretoConductividad: null,
  decretoCromoTotal: null,
  decretoEColiNmp: null,
  decretoHierro: null,
  decretoHuevosLarvasHelmintos: null,
  decretoManganeso: null,
  decretoNitratos: null,
  decretoNitritosExposicionCorta: null,
  decretoOrganismosVidaLibre: null,
  decretoPh: null,
  decretoSolidosTotalesDisueltos: null,
  decretoSulfatos: null,
  decretoTemperatura: null,
  decretoTurbiedad: null,
  ecaAluminio: null,
  ecaCobre: null,
  ecaColiformesTermotolerantes: null,
  ecaColiformesTotales: null,
  ecaConductividad: null,
  ecaCromoTotal: null,
  ecaEscherichiaColi: null,
  ecaFormasParasitarias: null,
  ecaHierro: null,
  ecaManganeso: null,
  ecaNitratos: null,
  ecaNitritos: null,
  ecaOrganismosVidaLibre: null,
  ecaPh: null,
  ecaSulfatos: null,
  ecaTemperatura: null,
  ecaTurbiedad: null
})

const asItemRecord = (item: ReporteItemImportInput) =>
  item as Record<keyof ReporteItemImportInput, string | number | null>

export const parseReporteImportWorkbook = (buffer: Buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const firstSheetName = workbook.SheetNames[0]

  if (!firstSheetName) {
    throw new Error('El archivo de Excel no contiene hojas')
  }

  const sheet = workbook.Sheets[firstSheetName]

  if (!sheet) {
    throw new Error('No se pudo leer la hoja principal del archivo')
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
    blankrows: false
  })

  const headerRowIndex = detectHeaderRowIndex(rows)

  if (headerRowIndex === -1) {
    throw new Error('No se encontraron las columnas base del archivo original. Se espera una fila con Ubigeo y los parametros principales.')
  }

  const headerRow = rows[headerRowIndex]

  if (!headerRow) {
    throw new Error('No se pudo leer la fila de cabeceras del archivo')
  }

  const groupRow = headerRowIndex > 0 ? rows[headerRowIndex - 1] : undefined
  const columns = buildColumnDescriptors(groupRow, headerRow)
  const columnIndexByKey = new Map<FieldSpec['key'], number>()

  for (const spec of FIELD_SPECS) {
    const columnIndex = findColumnIndex(columns, spec)

    if (spec.required && columnIndex === -1) {
      throw new Error(`No se encontro la columna requerida ${spec.headerAliases[0]} en el Excel`)
    }

    columnIndexByKey.set(spec.key, columnIndex)
  }

  const parsedRows: ParsedReporteImportRow[] = []

  for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? []
    const rowNumber = rowIndex + 1
    const codigoUbigeoIndex = columnIndexByKey.get('codigoUbigeo') ?? -1
    const rawUbigeo = codigoUbigeoIndex >= 0 ? row[codigoUbigeoIndex] : ''
    const trackedValues = FIELD_SPECS
      .filter(spec => spec.key !== 'codigoUbigeo')
      .map((spec) => {
        const index = columnIndexByKey.get(spec.key) ?? -1
        return index >= 0 ? row[index] : ''
      })

    const isBlankRow = [rawUbigeo, ...trackedValues].every(value => normalizeCellValue(value) === '')

    if (isBlankRow) {
      continue
    }

    const codigoUbigeo = String(rawUbigeo ?? '').replace(/\D/g, '').trim()

    if (!codigoUbigeo) {
      throw new Error(`Fila ${rowNumber}: Ubigeo es requerido`)
    }

    const item = createEmptyItem()

    for (const spec of FIELD_SPECS) {
      if (spec.key === 'codigoUbigeo') {
        continue
      }

      const columnIndex = columnIndexByKey.get(spec.key) ?? -1

      if (columnIndex < 0) {
        continue
      }

      const rawValue = row[columnIndex]
      const fieldLabel = spec.headerAliases[0] ?? String(spec.key)
      const parsedValue = (
        spec.type === 'number'
          ? parseOptionalNumber(rawValue, fieldLabel, rowNumber)
          : parseOptionalText(rawValue)
      ) as ReporteItemImportInput[keyof ReporteItemImportInput]

      asItemRecord(item)[spec.key as keyof ReporteItemImportInput] = parsedValue
    }

    const hasMeaningfulValue = Object.values(item).some(value => value !== null && value !== '')

    if (!hasMeaningfulValue) {
      continue
    }

    parsedRows.push({
      rowNumber,
      codigoUbigeo,
      item
    })
  }

  if (!parsedRows.length) {
    throw new Error('El archivo no contiene filas validas para importar')
  }

  return parsedRows
}
