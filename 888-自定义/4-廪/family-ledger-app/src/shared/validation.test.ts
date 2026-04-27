import { describe, expect, it } from 'vitest'
import { isDuplicateEntry, validateEntryInput } from './validation'
import type { AppSettings, Entry } from './types'

const settings: AppSettings = {
  passwordHash: null,
  categories: ['吃', '住'],
  members: ['家长甲', '家长乙', '小朋友', '小家庭'],
  sources: ['支付宝', '微信']
}

const baseEntry = {
  date: '2026-04-27',
  amount: 123.45,
  category: '吃',
  member: '家长甲',
  note: '晚餐',
  source: '支付宝'
}

describe('validateEntryInput', () => {
  it('accepts a valid entry', () => {
    expect(validateEntryInput(baseEntry, settings)).toEqual([])
  })

  it('rejects invalid values', () => {
    const issues = validateEntryInput(
      { ...baseEntry, date: '2026/04/27', amount: -1, category: '买', member: '未知', source: '信用卡' },
      settings
    )

    expect(issues.map((issue) => issue.field)).toEqual(['date', 'amount', 'category', 'member', 'source'])
  })
})

describe('isDuplicateEntry', () => {
  it('detects exact duplicates only', () => {
    const entries: Entry[] = [{ id: '1', ...baseEntry }]

    expect(isDuplicateEntry(entries, baseEntry)).toBe(true)
    expect(isDuplicateEntry(entries, { ...baseEntry, note: '午餐' })).toBe(false)
  })
})
