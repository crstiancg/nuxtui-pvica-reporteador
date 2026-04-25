export const parsePositiveInteger = (value: unknown, fallback: number) => {
  const firstValue = Array.isArray(value) ? value[0] : value

  if (typeof firstValue !== 'string' && typeof firstValue !== 'number') {
    return fallback
  }

  const parsed = Number(firstValue)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}
