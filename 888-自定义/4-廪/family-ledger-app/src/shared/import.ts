import { isDuplicateEntry, normalizeAmount, validateEntryInput, type EntryInput } from './validation'
import type { AppSettings, Entry } from './types'

export const IMPORT_HEADER = ['日期', '金额', '分类', '成员', '备注', '来源平台'] as const

export type ImportRowError = {
  rowNumber: number
  reason: string
  values: string[]
}

export type ImportAnalysis = {
  headerValid: boolean
  totalRows: number
  validRows: number
  errorRows: number
  duplicateRows: number
  entries: Entry[]
  errors: ImportRowError[]
}

export function analyzeImportRows(rows: string[][], settings: AppSettings, existing: Entry[]): ImportAnalysis {
  const [header, ...dataRows] = rows
  const headerValid = isHeaderValid(header ?? [])

  if (!headerValid) {
    return {
      headerValid: false,
      totalRows: 0,
      validRows: 0,
      errorRows: 0,
      duplicateRows: 0,
      entries: [],
      errors: [{ rowNumber: 1, reason: '模板错误', values: header ?? [] }]
    }
  }

  const entries: Entry[] = []
  const errors: ImportRowError[] = []
  const seenKeys = new Set<string>()
  let validRows = 0
  let duplicateRows = 0

  dataRows.forEach((row, index) => {
    const values = normalizeRow(row)
    const input = toEntryInput(values)
    const issues = validateEntryInput(input, settings)
    const duplicate = seenKeys.has(buildKey(input)) || isDuplicateEntry([...existing, ...entries], input)

    if (duplicate) {
      duplicateRows += 1
      issues.push({ field: 'date', message: '重复记录' })
    }

    if (issues.length > 0) {
      errors.push({
        rowNumber: index + 2,
        reason: issues.map((item) => item.message).join('；'),
        values
      })
      return
    }

    validRows += 1
    seenKeys.add(buildKey(input))
    entries.push({
      id: createId(),
      ...input,
      amount: normalizeAmount(input.amount)
    })
  })

  return {
    headerValid: true,
    totalRows: dataRows.length,
    validRows,
    errorRows: errors.length,
    duplicateRows,
    entries,
    errors
  }
}

export function buildErrorSheetRows(analysis: ImportAnalysis): string[][] {
  return [
    [...IMPORT_HEADER, '错误原因'],
    ...analysis.errors.map((error) => [...error.values, error.reason])
  ]
}

function isHeaderValid(header: string[]) {
  return IMPORT_HEADER.every((value, index) => header[index] === value)
}

function normalizeRow(row: string[]) {
  const [date, amount, category, member, note, source] = row
  return [
    String(date ?? '').trim(),
    String(amount ?? '').trim(),
    String(category ?? '').trim(),
    String(member ?? '').trim(),
    String(note ?? '').trim(),
    String(source ?? '').trim()
  ]
}

function toEntryInput(values: string[]): EntryInput {
  return {
    date: values[0],
    amount: Number(values[1]),
    category: values[2],
    member: values[3],
    note: values[4],
    source: values[5]
  }
}

function buildKey(input: EntryInput) {
  return [input.date, input.amount, input.category, input.member, input.note, input.source].join('|')
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}
