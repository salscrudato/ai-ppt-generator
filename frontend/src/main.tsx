import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider
      initialThemeId="corporate-blue"
      persistTheme={true}
      enableGlobalTheme={false}
    >
      <App />
    </ThemeProvider>
  </StrictMode>,
)
