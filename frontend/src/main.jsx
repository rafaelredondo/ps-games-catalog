import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initializeErrorSuppression } from './utils/errorSuppression'

// Inicializar supressão de erros de extensões
initializeErrorSuppression();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
