import type { ReportePreview } from '#shared/types/reporte'

type PreviewGroup = 'decreto' | 'eca'

type ParametroLike = {
  codigoCabecera: string
  valor: string
}

type PreviewItemSource = Record<string, unknown>

type PreviewDescriptor = {
  field: string
  group: PreviewGroup
  label: string
}

const previewDescriptors: PreviewDescriptor[] = [
  {
    field: 'decretoAluminio',
    group: 'decreto',
    label: 'Aluminio'
  },
  {
    field: 'decretoBacteriasColiformesFecales',
    group: 'decreto',
    label: 'Bacterias Coliformes Fecales (UFC)'
  },
  {
    field: 'decretoBacteriasColiformesTotales',
    group: 'decreto',
    label: 'Bacterias Coliformes Totales'
  },
  {
    field: 'decretoBacteriasHeterotroficas',
    group: 'decreto',
    label: 'Bacterias Heterotroficas'
  },
  {
    field: 'decretoCloro',
    group: 'decreto',
    label: 'Cloro'
  },
  {
    field: 'decretoCobre',
    group: 'decreto',
    label: 'Cobre'
  },
  {
    field: 'decretoConductividad',
    group: 'decreto',
    label: 'Conductividad'
  },
  {
    field: 'decretoCromoTotal',
    group: 'decreto',
    label: 'Cromo total'
  },
  {
    field: 'decretoEColiNmp',
    group: 'decreto',
    label: 'E. coli (NMP)'
  },
  {
    field: 'decretoHierro',
    group: 'decreto',
    label: 'Hierro'
  },
  {
    field: 'decretoHuevosLarvasHelmintos',
    group: 'decreto',
    label: 'Huevos Larvas Helmintos'
  },
  {
    field: 'decretoManganeso',
    group: 'decreto',
    label: 'Manganeso'
  },
  {
    field: 'decretoNitratos',
    group: 'decreto',
    label: 'Nitratos'
  },
  {
    field: 'decretoNitritosExposicionCorta',
    group: 'decreto',
    label: 'Nitritos (Exposicion Corta)'
  },
  {
    field: 'decretoOrganismosVidaLibre',
    group: 'decreto',
    label: 'Organismos de vida libre'
  },
  {
    field: 'decretoPh',
    group: 'decreto',
    label: 'pH'
  },
  {
    field: 'decretoSolidosTotalesDisueltos',
    group: 'decreto',
    label: 'Solidos Totales Disueltos'
  },
  {
    field: 'decretoSulfatos',
    group: 'decreto',
    label: 'Sulfatos'
  },
  {
    field: 'decretoTemperatura',
    group: 'decreto',
    label: 'Temperatura'
  },
  {
    field: 'decretoTurbiedad',
    group: 'decreto',
    label: 'Turbiedad'
  },
  {
    field: 'ecaAluminio',
    group: 'eca',
    label: 'Aluminio'
  },
  {
    field: 'ecaCobre',
    group: 'eca',
    label: 'Cobre'
  },
  {
    field: 'ecaColiformesTermotolerantes',
    group: 'eca',
    label: 'Coliformes Termotolerantes'
  },
  {
    field: 'ecaColiformesTotales',
    group: 'eca',
    label: 'Coliformes Totales'
  },
  {
    field: 'ecaConductividad',
    group: 'eca',
    label: 'Conductividad'
  },
  {
    field: 'ecaCromoTotal',
    group: 'eca',
    label: 'Cromo total'
  },
  {
    field: 'ecaEscherichiaColi',
    group: 'eca',
    label: 'Escherichia coli'
  },
  {
    field: 'ecaFormasParasitarias',
    group: 'eca',
    label: 'Formas parasitarias'
  },
  {
    field: 'ecaHierro',
    group: 'eca',
    label: 'Hierro'
  },
  {
    field: 'ecaManganeso',
    group: 'eca',
    label: 'Manganeso'
  },
  {
    field: 'ecaNitratos',
    group: 'eca',
    label: 'Nitratos'
  },
  {
    field: 'ecaNitritos',
    group: 'eca',
    label: 'Nitritos'
  },
  {
    field: 'ecaOrganismosVidaLibre',
    group: 'eca',
    label: 'Organismos de vida libre'
  },
  {
    field: 'ecaPh',
    group: 'eca',
    label: 'pH'
  },
  {
    field: 'ecaSulfatos',
    group: 'eca',
    label: 'Sulfatos'
  },
  {
    field: 'ecaTemperatura',
    group: 'eca',
    label: 'Temperatura'
  },
  {
    field: 'ecaTurbiedad',
    group: 'eca',
    label: 'Turbiedad'
  }
]

const normalizeRule = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

const parseNumber = (value: unknown) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().replace(',', '.')

  if (!normalized) {
    return null
  }

  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : null
}

const formatNumber = (value: number) => {
  if (Number.isInteger(value)) {
    return String(value)
  }

  return String(Number(value.toFixed(3)))
}

const parsePresence = (value: unknown) => {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  const normalized = String(value).trim().toLowerCase()

  if (!normalized) {
    return null
  }

  if (['0', '0.0', 'ausencia', 'no', 'negativo', 'negative', 'false'].includes(normalized)) {
    return false
  }

  if (['1', 'si', 'sí', 'presencia', 'positivo', 'positive', 'true'].includes(normalized)) {
    return true
  }

  const numeric = parseNumber(normalized)

  if (numeric !== null) {
    return numeric !== 0
  }

  return true
}

const calculateValue = (rule: string, values: unknown[]) => {
  const normalizedRule = normalizeRule(rule)

  if (normalizedRule.includes('max')) {
    const numbers = values.map(parseNumber).filter((value): value is number => value !== null)
    return numbers.length ? formatNumber(Math.max(...numbers)) : null
  }

  if (normalizedRule.includes('min')) {
    const numbers = values.map(parseNumber).filter((value): value is number => value !== null)
    return numbers.length ? formatNumber(Math.min(...numbers)) : null
  }

  if (normalizedRule.includes('prom')) {
    const numbers = values.map(parseNumber).filter((value): value is number => value !== null)

    if (!numbers.length) {
      return null
    }

    const average = numbers.reduce((sum, value) => sum + value, 0) / numbers.length
    return formatNumber(average)
  }

  if (normalizedRule.includes('presencia') || normalizedRule.includes('ausencia')) {
    const presenceValues = values
      .map(parsePresence)
      .filter((value): value is boolean => value !== null)

    if (!presenceValues.length) {
      return null
    }

    return presenceValues.some(Boolean) ? 'Presencia' : 'Ausencia'
  }

  const firstValue = values.find(value => value !== null && value !== undefined && String(value).trim() !== '')

  return firstValue === undefined ? null : String(firstValue)
}

export const buildReportePreview = (
  items: PreviewItemSource[],
  parametros: ParametroLike[]
): ReportePreview => {
  const parametroMap = new Map(parametros.map(parametro => [parametro.codigoCabecera, parametro.valor]))

  const entries = previewDescriptors.map((descriptor) => {
    const rule = parametroMap.get(descriptor.field) || 'Sin regla'
    const fieldValues = items
      .map(item => item[descriptor.field])
      .filter(value => value !== null && value !== undefined && String(value).trim() !== '')

    return {
      calculatedValue: calculateValue(rule, fieldValues),
      codigoCabecera: descriptor.field,
      field: descriptor.field,
      group: descriptor.group,
      itemCount: fieldValues.length,
      label: descriptor.label,
      rule
    }
  })

  return {
    decreto: entries.filter(entry => entry.group === 'decreto'),
    eca: entries.filter(entry => entry.group === 'eca')
  }
}
