import { describe, expect, it } from 'vitest'
import { summarizeByCategory, summarizeByMember, summarizeByMonth, summarizeByYear } from './statistics'
import type { Entry } from './types'

const entries: Entry[] = [
  { id: '1', date: '2026-04-01', amount: 10, category: '吃', member: '家长甲', note: '', source: '支付宝' },
  { id: '2', date: '2026-04-02', amount: 20, category: '吃', member: '家长乙', note: '', source: '微信' },
  { id: '3', date: '2026-05-01', amount: 30, category: '玩', member: '小家庭', note: '', source: '支付宝' }
]

describe('statistics', () => {
  it('summarizes by month', () => {
    expect(summarizeByMonth(entries)).toEqual([
      { period: '2026-04', total: 30, categoryTotals: { '吃': 30 } },
      { period: '2026-05', total: 30, categoryTotals: { '玩': 30 } }
    ])
  })

  it('summarizes by year', () => {
    expect(summarizeByYear(entries)).toEqual([
      { period: '2026', total: 60, categoryTotals: { '吃': 30, '玩': 30 } }
    ])
  })

  it('summarizes by category', () => {
    expect(summarizeByCategory(entries)).toEqual([
      { name: '吃', amount: 30 },
      { name: '玩', amount: 30 }
    ])
  })

  it('summarizes by member', () => {
    expect(summarizeByMember(entries)).toEqual([
      { name: '小家庭', amount: 30 },
      { name: '家长乙', amount: 20 },
      { name: '家长甲', amount: 10 }
    ])
  })
})
