import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './shared/styles/App.css'
import './features/dashboard/sidebar.jsx'
import './features/dashboard/dashboard.jsx'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;