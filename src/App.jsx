import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-toastify/dist/ReactToastify.css';

import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AppRoutes from './routes/routes';
import { AuthProvider } from './shared/contexts/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;