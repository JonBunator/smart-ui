import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import SmartComponentManager from "../src/components/SmartComponentManager";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <SmartComponentManager>
         <App />
      </SmartComponentManager>
  </StrictMode>,
)
