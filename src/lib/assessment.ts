export function calculateOverall(items: Record<string, number | null | undefined>): number {
  const values = Object.values(items).filter((v): v is number => typeof v === 'number')
  if (values.length === 0) return 0
  const sum = values.reduce((acc, v) => acc + v, 0)
  const average = sum / values.length
  return Math.round(average * 100) / 100
}
