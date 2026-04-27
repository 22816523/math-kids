import type { LedgerState } from './types'
import { DEFAULT_CATEGORIES, DEFAULT_MEMBERS, DEFAULT_SOURCES } from './defaults'

export type BackupPreview = {
  createdAt: string
  updatedAt: string
  entriesCount: number
  categoriesCount: number
  membersCount: number
  sourcesCount: number
}

export function createEmptyLedgerState(passwordHash: string | null): LedgerState {
  const now = new Date().toISOString()

  return {
    settings: {
      passwordHash,
      categories: [...DEFAULT_CATEGORIES],
      members: [...DEFAULT_MEMBERS],
      sources: [...DEFAULT_SOURCES]
    },
    entries: [],
    createdAt: now,
    updatedAt: now
  }
}

export function parseLedgerState(raw: string): LedgerState {
  const value = JSON.parse(raw) as LedgerState

  if (!value?.settings || !Array.isArray(value.entries)) {
    throw new Error('Invalid backup file')
  }

  return value
}

export function previewLedgerState(raw: string): BackupPreview {
  const state = parseLedgerState(raw)

  return {
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
    entriesCount: state.entries.length,
    categoriesCount: state.settings.categories.length,
    membersCount: state.settings.members.length,
    sourcesCount: state.settings.sources.length
  }
}

export function withPassword(state: LedgerState, passwordHash: string): LedgerState {
  return {
    ...state,
    settings: {
      ...state.settings,
      passwordHash
    },
    updatedAt: new Date().toISOString()
  }
}
