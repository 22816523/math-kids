import type { Entry } from './types'

export type PeriodSummary = {
  period: string
  total: number
  categoryTotals: Record<string, number>
}

export type NameSummary = {
  name: string
  amount: number
}

export function summarizeByMonth(entries: Entry[]): PeriodSummary[] {
  const buckets = new Map<string, PeriodSummary>()

  for (const entry of entries) {
    const period = entry.date.slice(0, 7)
    const current: PeriodSummary = buckets.get(period) ?? { period, total: 0, categoryTotals: {} }
    current.total += entry.amount
    current.categoryTotals[entry.category] = (current.categoryTotals[entry.category] ?? 0) + entry.amount
    buckets.set(period, current)
  }

  return [...buckets.values()].sort((left, right) => left.period.localeCompare(right.period))
}

export function summarizeByYear(entries: Entry[]): PeriodSummary[] {
  const buckets = new Map<string, PeriodSummary>()

  for (const entry of entries) {
    const period = entry.date.slice(0, 4)
    const current: PeriodSummary = buckets.get(period) ?? { period, total: 0, categoryTotals: {} }
    current.total += entry.amount
    current.categoryTotals[entry.category] = (current.categoryTotals[entry.category] ?? 0) + entry.amount
    buckets.set(period, current)
  }

  return [...buckets.values()].sort((left, right) => left.period.localeCompare(right.period))
}

export function summarizeByCategory(entries: Entry[]): NameSummary[] {
  const totals = new Map<string, number>()

  for (const entry of entries) {
    totals.set(entry.category, (totals.get(entry.category) ?? 0) + entry.amount)
  }

  return [...totals.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .filter((item) => item.amount > 0)
    .sort((left, right) => right.amount - left.amount)
}

export function summarizeByMember(entries: Entry[]): NameSummary[] {
  const totals = new Map<string, number>()

  for (const entry of entries) {
    totals.set(entry.member, (totals.get(entry.member) ?? 0) + entry.amount)
  }

  return [...totals.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .filter((item) => item.amount > 0)
    .sort((left, right) => right.amount - left.amount)
}
