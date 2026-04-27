import { createServer } from 'electron-vite'

delete process.env.ELECTRON_RUN_AS_NODE

await createServer(undefined, { rendererOnly: false })
