import { app, dialog, shell } from 'electron'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createEmptyLedgerState, parseLedgerState, withPassword } from '@shared/backup'
import type { LedgerState } from '@shared/types'

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function getDataDir() {
  return path.join(app.getPath('documents'), '家庭记账', '数据')
}

function getLedgerPath() {
  return path.join(getDataDir(), 'ledger.json')
}

async function ensureDataDir() {
  await fs.mkdir(getDataDir(), { recursive: true })
}

async function readStateFromDisk(): Promise<LedgerState | null> {
  try {
    const raw = await fs.readFile(getLedgerPath(), 'utf8')
    return parseLedgerState(raw)
  } catch {
    return null
  }
}

async function writeStateToDisk(state: LedgerState) {
  await ensureDataDir()
  await fs.writeFile(getLedgerPath(), JSON.stringify(state, null, 2), 'utf8')
}

export async function getState() {
  return readStateFromDisk()
}

export async function createLedger(password: string) {
  const state = createEmptyLedgerState(hashPassword(password))
  await writeStateToDisk(state)
  return state
}

export async function unlockLedger(password: string) {
  const state = await readStateFromDisk()
  if (!state) {
    return null
  }

  return state.settings.passwordHash === hashPassword(password) ? state : null
}

export async function saveLedger(state: LedgerState) {
  await writeStateToDisk({
    ...state,
    updatedAt: new Date().toISOString()
  })
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const state = await readStateFromDisk()
  if (!state || state.settings.passwordHash !== hashPassword(oldPassword)) {
    return null
  }

  const nextState = withPassword(state, hashPassword(newPassword))
  await writeStateToDisk(nextState)
  return nextState
}

export async function exportBackup(state: LedgerState) {
  const result = await dialog.showSaveDialog({
    defaultPath: path.join(app.getPath('documents'), '家庭记账_备份.json'),
    filters: [{ name: 'JSON', extensions: ['json'] }]
  })

  if (result.canceled || !result.filePath) {
    return { canceled: true as const }
  }

  await fs.writeFile(result.filePath, JSON.stringify(state, null, 2), 'utf8')
  return { canceled: false as const, filePath: result.filePath }
}

export async function restoreBackup(raw: string, password: string) {
  const state = parseLedgerState(raw)
  const nextState = withPassword(state, hashPassword(password))
  await writeStateToDisk(nextState)
  return nextState
}

export async function openDataDir() {
  await ensureDataDir()
  await shellOpenPath(getDataDir())
}

async function shellOpenPath(targetPath: string) {
  await shell.openPath(targetPath)
}

export async function previewBackup(raw: string) {
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
