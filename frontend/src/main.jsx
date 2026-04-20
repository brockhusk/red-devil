import { datadogRum } from '@datadog/browser-rum';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

datadogRum.init({
    applicationId: '52f05f07-2887-4191-ac25-bb362fc6d36d',
    clientToken: 'pub9f4dffb6a8b7c1c84a2308f96c15018f',
    site: 'datadoghq.com',
    service: 'red-devil',
    env: 'production',
    // version: '1.0.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
    allowedTracingUrls: [
      { match: "https://brockhusk.com", propagatorTypes: ["datadog"] }
  ],
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
