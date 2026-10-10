import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error in render:', error, info)
  }

  render() {
    if (this.state.error) {
      const err = this.state.error
      return (
        <div style={{ padding: 24, fontFamily: 'system-ui, Arial' }}>
          <h2 style={{ color: '#b91c1c' }}>Application error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#111' }}>
            {String(err && err.message ? err.message : err)}
          </pre>
          <p>
            Check the browser console for the full stack trace.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
