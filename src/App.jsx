import 'bootstrap-icons/font/bootstrap-icons.css';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import router from './routes/routes';
import { AuthProvider } from './shared/contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          gutter={8}
          containerStyle={{
            top: 20,
            right: 20,
          }}
          // Prevenir duplicados: solo mostrar un toast a la vez con el mismo ID
          toastOptions={{
            duration: 4000,
            // Prevenir duplicados automáticamente
            id: undefined, // Se establecerá dinámicamente
            style: {
              background: '#fff',
              color: '#333',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
              style: {
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #86efac',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
              style: {
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fca5a5',
              },
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}

export default App;