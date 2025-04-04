import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import {SmartAgentProvider} from "../src/main";
import SmartComponentManager from "../src/internal/SmartComponentManager";
import {azureOpenAIClient} from "../src/components/SmartAgentProvider/openAI";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <SmartComponentManager>
          <SmartAgentProvider openAIClient={azureOpenAIClient()}>
             <App />
          </SmartAgentProvider>
      </SmartComponentManager>
  </StrictMode>,
)
