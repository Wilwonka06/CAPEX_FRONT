import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './shared/styles/input.css';
import './shared/styles/output.css'
import 'bootstrap-icons/font/bootstrap-icons.css'; // o la ruta correcta según tu estructura
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
