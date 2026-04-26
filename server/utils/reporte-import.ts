import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const XLSX = require('xlsx') as typeof import('xlsx')

type ReporteItemImportInput = {
  cloro: number
  conductividad: number
  ph: number
  temperatura: number
  turbiedad: number
}

export type ParsedReporteImportRow = {
  codigoUbigeo: string
  item: ReporteItemImportInput
  rowNumber: number
}

const HEADER_ALIASES = {
  ubigeo: ['ubigeo', 'codigo ubigeo', 'codigo_ubigeo', 'codigoubigeo'],
  cloro: ['cloro'],
  conductividad: ['conductividad'],
  ph: ['ph', 'p h', 'p_h'],
  temperatura: ['temperatura'],
  turbiedad: ['turbiedad', 'turbidez']
} as const

const normalizeHeader = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()

const rowHasAlias = (headers: string[], aliases: readonly string[]) =>
  headers.some(header => aliases.includes(header))

const getFirstMatchingValue = (row: Record<string, unknown>, aliases: readonly string[]) => {
  for (const alias of aliases) {
    if (alias in row) {
      return row[alias]
    }
  }

  return ''
}

const parseRequiredNumber = (value: unknown, field: string, rowNumber: number) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  const normalized = String(value ?? '')
    .trim()
    .replace(',', '.')

  if (!normalized) {
    throw new Error(`Fila ${rowNumber}: ${field} es requerido`)
  }

  const parsed = Number(normalized)

  if (!Number.isFinite(parsed)) {
    throw new Error(`Fila ${rowNumber}: ${field} debe ser numerico`)
  }

  return parsed
}

const detectHeaderRowIndex = (rows: unknown[][]) => {
  return rows.findIndex((row) => {
    const normalizedHeaders = row.map(normalizeHeader).filter(Boolean)

    if (!rowHasAlias(normalizedHeaders, HEADER_ALIASES.ubigeo)) {
      return false
    }

    const matchedMeasurementHeaders = [
      HEADER_ALIASES.cloro,
      HEADER_ALIASES.conductividad,
      HEADER_ALIASES.ph,
      HEADER_ALIASES.temperatura,
      HEADER_ALIASES.turbiedad
    ].filter(aliases => rowHasAlias(normalizedHeaders, aliases))

    return matchedMeasurementHeaders.length >= 3
  })
}

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
    throw new Error('No se encontraron las columnas requeridas en la hoja. Se espera Ubigeo, Cloro, Conductividad, PH, Temperatura y Turbiedad.')
  }

  const headerRow = rows[headerRowIndex]

  if (!headerRow) {
    throw new Error('No se pudo leer la fila de cabeceras del archivo')
  }

  const normalizedHeaders = headerRow.map(normalizeHeader)
  const requiredHeaders = [
    HEADER_ALIASES.ubigeo,
    HEADER_ALIASES.cloro,
    HEADER_ALIASES.conductividad,
    HEADER_ALIASES.ph,
    HEADER_ALIASES.temperatura,
    HEADER_ALIASES.turbiedad
  ]

  const missingHeaders = requiredHeaders.filter(aliases => !rowHasAlias(normalizedHeaders, aliases))

  if (missingHeaders.length) {
    throw new Error('Faltan columnas requeridas en el Excel para importar reportes.')
  }

  const parsedRows: ParsedReporteImportRow[] = []

  for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? []
    const rowNumber = rowIndex + 1
    const normalizedRow = Object.fromEntries(
      normalizedHeaders.map((header, index) => [header, row[index] ?? ''])
    )

    const rawUbigeo = getFirstMatchingValue(normalizedRow, HEADER_ALIASES.ubigeo)
    const rawCloro = getFirstMatchingValue(normalizedRow, HEADER_ALIASES.cloro)
    const rawConductividad = getFirstMatchingValue(normalizedRow, HEADER_ALIASES.conductividad)
    const rawPh = getFirstMatchingValue(normalizedRow, HEADER_ALIASES.ph)
    const rawTemperatura = getFirstMatchingValue(normalizedRow, HEADER_ALIASES.temperatura)
    const rawTurbiedad = getFirstMatchingValue(normalizedRow, HEADER_ALIASES.turbiedad)

    const isBlankRow = [rawUbigeo, rawCloro, rawConductividad, rawPh, rawTemperatura, rawTurbiedad]
      .every(value => String(value ?? '').trim() === '')

    if (isBlankRow) {
      continue
    }

    const codigoUbigeo = String(rawUbigeo ?? '')
      .replace(/\D/g, '')
      .trim()

    if (!codigoUbigeo) {
      throw new Error(`Fila ${rowNumber}: Ubigeo es requerido`)
    }

    parsedRows.push({
      rowNumber,
      codigoUbigeo,
      item: {
        cloro: parseRequiredNumber(rawCloro, 'Cloro', rowNumber),
        conductividad: parseRequiredNumber(rawConductividad, 'Conductividad', rowNumber),
        ph: parseRequiredNumber(rawPh, 'PH', rowNumber),
        temperatura: parseRequiredNumber(rawTemperatura, 'Temperatura', rowNumber),
        turbiedad: parseRequiredNumber(rawTurbiedad, 'Turbiedad', rowNumber)
      }
    })
  }

  if (!parsedRows.length) {
    throw new Error('El archivo no contiene filas validas para importar')
  }

  return parsedRows
}
