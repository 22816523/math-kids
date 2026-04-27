import { describe, expect, it } from 'vitest'
import { analyzeImportRows, buildErrorSheetRows, IMPORT_HEADER } from './import'
import type { AppSettings, Entry } from './types'

const settings: AppSettings = {
  passwordHash: null,
  categories: ['吃', '买'],
  members: ['家长甲', '家长乙', '小朋友', '小家庭'],
  sources: ['支付宝', '微信']
}

const existing: Entry[] = [
  { id: '1', date: '2026-04-01', amount: 12.34, category: '吃', member: '家长甲', note: '早餐', source: '支付宝' }
]

describe('import analysis', () => {
  it('accepts valid rows', () => {
    const analysis = analyzeImportRows(
      [
        [...IMPORT_HEADER],
        ['2026-04-02', '10.00', '买', '家长乙', '零食', '微信']
      ],
      settings,
      existing
    )

    expect(analysis.headerValid).toBe(true)
    expect(analysis.totalRows).toBe(1)
    expect(analysis.validRows).toBe(1)
    expect(analysis.errorRows).toBe(0)
    expect(analysis.entries).toHaveLength(1)
  })

  it('flags duplicates and invalid rows', () => {
    const analysis = analyzeImportRows(
      [
        [...IMPORT_HEADER],
        ['2026-04-01', '12.34', '吃', '家长甲', '早餐', '支付宝'],
        ['2026/04/02', '-1', '买', '家长乙', '零食', '微信']
      ],
      settings,
      existing
    )

    expect(analysis.errorRows).toBe(2)
    expect(analysis.duplicateRows).toBe(1)
    expect(analysis.validRows).toBe(0)
    expect(buildErrorSheetRows(analysis)[1][6]).toContain('重复记录')
  })

  it('rejects invalid headers', () => {
    const analysis = analyzeImportRows([['foo']], settings, existing)

    expect(analysis.headerValid).toBe(false)
    expect(analysis.errors[0].reason).toBe('模板错误')
  })
})
