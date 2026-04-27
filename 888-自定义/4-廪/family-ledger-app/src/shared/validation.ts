import type { AppSettings, Entry, ValidationIssue } from './types'

export type EntryInput = Omit<Entry, 'id'>

export function validateEntryInput(input: EntryInput, settings: AppSettings): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (!isValidDate(input.date)) {
    issues.push({ field: 'date', message: '日期格式不正确' })
  }

  if (!isPositiveAmount(input.amount)) {
    issues.push({ field: 'amount', message: '金额必须是正数且最多保留两位小数' })
  }

  if (!settings.categories.includes(input.category)) {
    issues.push({ field: 'category', message: '分类不存在' })
  }

  if (!settings.members.includes(input.member)) {
    issues.push({ field: 'member', message: '成员不存在' })
  }

  if (!settings.sources.includes(input.source)) {
    issues.push({ field: 'source', message: '来源平台不存在' })
  }

  if (input.note.includes('\n')) {
    issues.push({ field: 'note', message: '备注不能包含换行' })
  }

  return issues
}

export function isDuplicateEntry(existing: Entry[], candidate: EntryInput): boolean {
  return existing.some((item) =>
    item.date === candidate.date &&
    item.amount === candidate.amount &&
    item.category === candidate.category &&
    item.member === candidate.member &&
    item.note === candidate.note &&
    item.source === candidate.source
  )
}

export function normalizeAmount(value: number): number {
  return Number(value.toFixed(2))
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isPositiveAmount(value: number): boolean {
  return Number.isFinite(value) && value > 0 && Number(value.toFixed(2)) === value
}
