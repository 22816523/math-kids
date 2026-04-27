import type { LedgerState } from '@shared/types'

declare global {
  interface Window {
    ledger: {
      getState(): Promise<LedgerState | null>
      createLedger(password: string): Promise<LedgerState>
      unlockLedger(password: string): Promise<LedgerState | null>
      saveLedger(state: LedgerState): Promise<void>
      changePassword(oldPassword: string, newPassword: string): Promise<LedgerState | null>
      exportBackup(state: LedgerState): Promise<{ canceled: boolean; filePath?: string }>
      previewBackup(raw: string): Promise<{
        createdAt: string
        updatedAt: string
        entriesCount: number
        categoriesCount: number
        membersCount: number
        sourcesCount: number
      }>
      restoreBackup(raw: string, password: string): Promise<LedgerState>
      openDataDir(): Promise<void>
    }
  }
}

export {}
