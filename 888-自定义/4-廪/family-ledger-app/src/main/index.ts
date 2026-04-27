import { join } from 'node:path'
import { app, BrowserWindow, ipcMain } from 'electron'
import {
  changePassword,
  createLedger,
  exportBackup,
  getState,
  openDataDir,
  previewBackup,
  restoreBackup,
  saveLedger,
  unlockLedger
} from './store'

app.disableHardwareAcceleration()
app.setPath('userData', join(process.env.TEMP ?? app.getPath('temp'), 'family-ledger-app-user-data'))

let mainWindow: InstanceType<typeof BrowserWindow> | null = null

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1280,
    minHeight: 840,
    backgroundColor: '#f7f8f4',
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs')
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    await mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    await mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  ipcMain.handle('ledger:get-state', () => getState())
  ipcMain.handle('ledger:create', (_event, password: string) => createLedger(password))
  ipcMain.handle('ledger:unlock', (_event, password: string) => unlockLedger(password))
  ipcMain.handle('ledger:save', (_event, state) => saveLedger(state))
  ipcMain.handle('ledger:change-password', (_event, oldPassword: string, newPassword: string) =>
    changePassword(oldPassword, newPassword)
  )
  ipcMain.handle('ledger:export-backup', (_event, state) => exportBackup(state))
  ipcMain.handle('ledger:preview-backup', (_event, raw: string) => previewBackup(raw))
  ipcMain.handle('ledger:restore-backup', (_event, raw: string, password: string) =>
    restoreBackup(raw, password)
  )
  ipcMain.handle('ledger:open-data-dir', () => openDataDir())

  await createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow()
  }
})
