// o la ruta correcta según tu estructura
import 'bootstrap-icons/font/bootstrap-icons.css';

import { RouterProvider } from 'react-router-dom';
import router from './routes/Routes';
import { SalesProvider } from './features/dashboard/pages/SaleProducts/context/SalesContext';
import { OrdersProvider } from './features/dashboard/pages/orders/context/OrdersContext';

function App() {
  console.log('hoal')
  return (
    <div className="App">
      <SalesProvider>
        <OrdersProvider>
          <RouterProvider router={router} />
        </OrdersProvider>
      </SalesProvider>
    </div>
  );
}
export default App;