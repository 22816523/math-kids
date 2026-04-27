import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'

class RootErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: string | null }> {
  state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error: error.message }
  }

  render() {
    if (this.state.error) {
      return <div className="startup"><div className="startup-panel">启动失败：{this.state.error}</div></div>
    }
    return this.props.children
  }
}

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

window.addEventListener('error', (event) => {
  console.error('[renderer] error:', event.error ?? event.message)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('[renderer] unhandledrejection:', event.reason)
})

void import('./App')
  .then(({ default: App }) => {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <RootErrorBoundary>
          <App />
        </RootErrorBoundary>
      </React.StrictMode>
    )
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[renderer] boot error:', error)
    ReactDOM.createRoot(root).render(
      <div className="startup">
        <div className="startup-panel">启动失败：{message}</div>
      </div>
    )
  })
