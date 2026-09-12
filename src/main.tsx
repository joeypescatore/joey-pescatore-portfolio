import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// SF Rounded isn't a distributable webfont (proprietary to Apple) — accessed
// via the CSS `ui-rounded` generic family, which resolves to it on
// Safari/macOS/iOS and falls back to the platform's normal system font
// everywhere else. Nothing to import.
import '@fontsource/geist-mono/500.css'
import '@fontsource/geist-mono/600.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
