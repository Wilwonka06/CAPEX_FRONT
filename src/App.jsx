// o la ruta correcta según tu estructura
import 'bootstrap-icons/font/bootstrap-icons.css';

import { RouterProvider } from 'react-router-dom';
import router from './routes/Routes';
import { SalesProvider } from './features/dashboard/pages/SaleProducts/context/SalesContext';
import { OrdersProvider } from './features/dashboard/pages/orders/context/OrdersContext';
import { AuthProvider } from './shared/contexts/AuthContext';

function App() {
  console.log('hoal')
  return (
    <div className="App">
      <AuthProvider>
        <SalesProvider>
          <OrdersProvider>
            <RouterProvider router={router} />
          </OrdersProvider>
        </SalesProvider>
      </AuthProvider>
    </div>
  );
}
export default App;