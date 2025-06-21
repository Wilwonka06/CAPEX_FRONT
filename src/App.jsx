import React from 'react'
import './shared/styles/App.css'
import { RouterProvider } from 'react-router-dom';
import router from './routes/routes';


 function App() {
  console.log('hoal')
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}
export default App;