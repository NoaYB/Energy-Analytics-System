import React from 'react'
import ReactDOM from 'react-dom/client'
import AbnormalDevicesDashboard from './AbnormalDevicesDashboard'
import './Dashboard.scss'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AbnormalDevicesDashboard />
  </React.StrictMode>,
)
