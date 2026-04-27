import { contextBridge, ipcRenderer } from 'electron'
import type { LedgerState } from '@shared/types'

contextBridge.exposeInMainWorld('ledger', {
  getState: () => ipcRenderer.invoke('ledger:get-state') as Promise<LedgerState | null>,
  createLedger: (password: string) => ipcRenderer.invoke('ledger:create', password) as Promise<LedgerState>,
  unlockLedger: (password: string) => ipcRenderer.invoke('ledger:unlock', password) as Promise<LedgerState | null>,
  saveLedger: (state: LedgerState) => ipcRenderer.invoke('ledger:save', state) as Promise<void>,
  changePassword: (oldPassword: string, newPassword: string) =>
    ipcRenderer.invoke('ledger:change-password', oldPassword, newPassword) as Promise<LedgerState | null>,
  exportBackup: (state: LedgerState) =>
    ipcRenderer.invoke('ledger:export-backup', state) as Promise<{ canceled: boolean; filePath?: string }>,
  previewBackup: (raw: string) =>
    ipcRenderer.invoke('ledger:preview-backup', raw) as Promise<{
      createdAt: string
      updatedAt: string
      entriesCount: number
      categoriesCount: number
      membersCount: number
      sourcesCount: number
    }>,
  restoreBackup: (raw: string, password: string) =>
    ipcRenderer.invoke('ledger:restore-backup', raw, password) as Promise<LedgerState>,
  openDataDir: () => ipcRenderer.invoke('ledger:open-data-dir') as Promise<void>
})
