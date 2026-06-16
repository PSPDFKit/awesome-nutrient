import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@baseline-ui/core'
import '@baseline-ui/tokens/dist/index.css'
import '@baseline-ui/core/dist/index.css'
import { App } from './App'
import { demoDarkTheme } from './theme'
import './styles.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <ThemeProvider theme={demoDarkTheme}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
