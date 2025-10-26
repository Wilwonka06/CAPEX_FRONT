// o la ruta correcta según tu estructura
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-toastify/dist/ReactToastify.css';

import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import router from './routes/Routes';
import { AuthProvider } from './shared/contexts/AuthContext';

function App() {
  console.log('hoal')
  return (
    <AuthProvider>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  );
}
export default App;