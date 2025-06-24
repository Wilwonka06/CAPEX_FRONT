import React from 'react'
// o la ruta correcta según tu estructura
import 'bootstrap-icons/font/bootstrap-icons.css';

import { RouterProvider } from 'react-router-dom';
import router from './routes/Routes';
import ServicesPage from './features/landing/pages/ServicesPage/ServicesPage';


 function App() {
  console.log('hoal')
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}
export default App;