import * as XLSX from 'xlsx'

export type CentroImportInput = {
  departamento: string
  provincia: string
  distrito: string
  codigoUbigeo: string
  nombreCentroPoblado: string | null
  codigoUbigeoDistrito: string | null
  establecimientoSalud: string | null
  codigoRenipress: string | null
  validadoMinsa: boolean | null
  tieneSistemaAgua: boolean | null
  quintil: string | null
  poblacionTotal: number | null
  poblacionServida: number | null
  poblacionVigilada: number | null
  coordenadaEste: string | null
  coordenadaNorte: string | null
  huso: string | null
  banda: string | null
  latitud: number | null
  longitud: number | null
  altitud: number | null
  ambito: string | null
}

export type ParsedCentroImportRow = {
  centro: CentroImportInput
  rowNumber: number
}

type ColumnDescriptor = {
  group: string
  header: string
}

type FieldType = 'boolean' | 'integer' | 'number' | 'text'

type FieldSpec = {
  groupAliases?: readonly string[]
  headerAliases: readonly string[]
  key: keyof CentroImportInput
  required?: boolean
  type: FieldType
}

const normalizeAliases = (aliases: readonly string[]) => aliases.map(alias => normalizeHeader(alias))

const FIELD_SPECS: readonly FieldSpec[] = [
  { key: 'departamento', headerAliases: ['departamento'], required: true, type: 'text' },
  { key: 'provincia', headerAliases: ['provincia'], required: true, type: 'text' },
  { key: 'distrito', headerAliases: ['distrito'], required: true, type: 'text' },
  { key: 'codigoUbigeoDistrito', headerAliases: ['ubigeo'], type: 'text' },
  { key: 'codigoUbigeo', headerAliases: ['ubigeo centropoblado'], required: true, type: 'text' },
  { key: 'nombreCentroPoblado', headerAliases: ['nombre del centro poblado'], type: 'text' },
  { key: 'codigoRenipress', groupAliases: ['establecimiento de salud'], headerAliases: ['codigo renipress'], type: 'text' },
  { key: 'establecimientoSalud', groupAliases: ['establecimiento de salud'], headerAliases: ['establecimiento'], type: 'text' },
  { key: 'validadoMinsa', headerAliases: ['validado por minsa'], type: 'boolean' },
  { key: 'tieneSistemaAgua', headerAliases: ['tiene sistema de agua'], type: 'boolean' },
  { key: 'quintil', headerAliases: ['quintil'], type: 'text' },
  { key: 'poblacionTotal', groupAliases: ['poblacion'], headerAliases: ['total'], type: 'integer' },
  { key: 'poblacionServida', groupAliases: ['poblacion'], headerAliases: ['servida'], type: 'integer' },
  { key: 'poblacionVigilada', groupAliases: ['poblacion'], headerAliases: ['vigilada'], type: 'integer' },
  { key: 'coordenadaEste', groupAliases: ['coordenadas utm wgs84'], headerAliases: ['este'], type: 'text' },
  { key: 'coordenadaNorte', groupAliases: ['coordenadas utm wgs84'], headerAliases: ['norte'], type: 'text' },
  { key: 'huso', groupAliases: ['coordenadas utm wgs84'], headerAliases: ['huso'], type: 'text' },
  { key: 'banda', groupAliases: ['coordenadas utm wgs84'], headerAliases: ['banda'], type: 'text' },
  { key: 'latitud', groupAliases: ['coordenadas'], headerAliases: ['latitud'], type: 'number' },
  { key: 'longitud', groupAliases: ['coordenadas'], headerAliases: ['longitud'], type: 'number' },
  { key: 'altitud', headerAliases: ['altitud'], type: 'integer' },
  { key: 'ambito', headerAliases: ['ambito'], type: 'text' }
] as const

function normalizeHeader(value: unknown) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()
}

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

const parseOptionalInteger = (value: unknown, field: string, rowNumber: number) => {
  const parsed = parseOptionalNumber(value, field, rowNumber)
  return parsed === null ? null : Math.round(parsed)
}

const parseOptionalBoolean = (value: unknown) => {
  const normalized = normalizeCellValue(value).toLowerCase()

  if (!normalized) {
    return null
  }

  if (['si', 'sí', 'yes', 'true', '1'].includes(normalized)) {
    return true
  }

  if (['no', 'false', '0'].includes(normalized)) {
    return false
  }

  return null
}

const detectHeaderRowIndex = (rows: unknown[][]) => {
  return rows.findIndex((row) => {
    const normalizedHeaders = row.map(normalizeHeader).filter(Boolean)

    return normalizedHeaders.includes('departamento') && normalizedHeaders.includes('ubigeo centropoblado')
  })
}

// La cabecera principal (primaryRow) trae el nombre directo de las columnas
// simples (Departamento, Ubigeo...) y, para las secciones fusionadas
// (Establecimiento de salud, Poblacion, Coordenadas), el titulo del grupo.
// El nombre real de esas sub-columnas viene en subRow, justo debajo.
const buildColumnDescriptors = (primaryRow: unknown[], subRow: unknown[] | undefined): ColumnDescriptor[] => {
  let currentGroup = ''

  return primaryRow.map((primaryHeader, index): ColumnDescriptor => {
    const normalizedPrimary = normalizeHeader(primaryHeader)
    const normalizedSub = normalizeHeader(subRow?.[index])

    if (normalizedSub) {
      if (normalizedPrimary) {
        currentGroup = normalizedPrimary
      }

      return { group: currentGroup, header: normalizedSub }
    }

    if (normalizedPrimary) {
      currentGroup = ''
      return { group: '', header: normalizedPrimary }
    }

    return { group: currentGroup, header: '' }
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

const parseFieldValue = (spec: FieldSpec, rawValue: unknown, rowNumber: number) => {
  switch (spec.type) {
    case 'number':
      return parseOptionalNumber(rawValue, spec.headerAliases[0] ?? String(spec.key), rowNumber)
    case 'integer':
      return parseOptionalInteger(rawValue, spec.headerAliases[0] ?? String(spec.key), rowNumber)
    case 'boolean':
      return parseOptionalBoolean(rawValue)
    default:
      return parseOptionalText(rawValue)
  }
}

export const parseCentroImportWorkbook = (buffer: Buffer) => {
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
    throw new Error('No se encontraron las columnas base del archivo. Se espera una fila con Departamento y Ubigeo Centropoblado.')
  }

  const headerRow = rows[headerRowIndex]

  if (!headerRow) {
    throw new Error('No se pudo leer la fila de cabeceras del archivo')
  }

  const subHeaderRow = rows[headerRowIndex + 1]
  const hasSubHeaderRow = Boolean(subHeaderRow?.some(cell => normalizeHeader(cell)))
  const columns = buildColumnDescriptors(headerRow, subHeaderRow)
  const dataStartOffset = hasSubHeaderRow ? 2 : 1

  const columnIndexByKey = new Map<FieldSpec['key'], number>()

  for (const spec of FIELD_SPECS) {
    const columnIndex = findColumnIndex(columns, spec)

    if (spec.required && columnIndex === -1) {
      throw new Error(`No se encontro la columna requerida "${spec.headerAliases[0]}" en el Excel`)
    }

    columnIndexByKey.set(spec.key, columnIndex)
  }

  const parsedRows: ParsedCentroImportRow[] = []

  for (let rowIndex = headerRowIndex + dataStartOffset; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? []
    const rowNumber = rowIndex + 1

    const getRaw = (key: FieldSpec['key']) => {
      const index = columnIndexByKey.get(key) ?? -1
      return index >= 0 ? row[index] : ''
    }

    const isBlankRow = FIELD_SPECS.every(spec => normalizeCellValue(getRaw(spec.key)) === '')

    if (isBlankRow) {
      continue
    }

    const rawUbigeoCentroPoblado = getRaw('codigoUbigeo')
    const codigoUbigeo = String(rawUbigeoCentroPoblado ?? '').replace(/\D/g, '').trim()

    if (!codigoUbigeo) {
      throw new Error(`Fila ${rowNumber}: Ubigeo Centropoblado es requerido`)
    }

    const centro = {} as CentroImportInput

    for (const spec of FIELD_SPECS) {
      const rawValue = getRaw(spec.key)
      const parsedValue = spec.key === 'codigoUbigeo'
        ? codigoUbigeo
        : parseFieldValue(spec, rawValue, rowNumber)

      ;(centro as Record<string, unknown>)[spec.key] = parsedValue
    }

    if (!centro.departamento || !centro.provincia || !centro.distrito) {
      throw new Error(`Fila ${rowNumber}: Departamento, Provincia y Distrito son requeridos`)
    }

    parsedRows.push({ rowNumber, centro })
  }

  if (!parsedRows.length) {
    throw new Error('El archivo no contiene filas validas para importar')
  }

  return parsedRows
}
