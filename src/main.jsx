import React, { Component } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles.css'

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('FinGuard failed to render:', error)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', fontFamily: 'DM Sans, sans-serif', background: '#f6f8fc', color: '#1c2744' }}>
        <section style={{ maxWidth: '420px', textAlign: 'center' }}>
          <h1 style={{ marginBottom: '8px', fontSize: '24px' }}>FinGuard could not load</h1>
          <p style={{ marginBottom: '20px', color: '#667085' }}>Refresh the app or clear its saved browser data, then try again.</p>
          <button type="button" onClick={() => window.location.reload()} style={{ border: 0, borderRadius: '10px', padding: '12px 18px', background: '#375cf5', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
            Reload FinGuard
          </button>
        </section>
      </main>
    )
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <HashRouter>
        <App />
      </HashRouter>
    </AppErrorBoundary>
  </React.StrictMode>
)
