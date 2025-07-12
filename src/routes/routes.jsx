import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import Layout from '../features/dashboard/Layout';
import Landing from '../features/landing/Landing';

// Pages Dashboard
import CategoriasProductos from '../features/dashboard/pages/CatProducts/CatProducts';
import CategoriasServicios from '../features/dashboard/pages/CatServices/CatServices';
import Citas from '../features/dashboard/pages/Quotes/Quotes';
import Clientes from '../features/dashboard/pages/Customers/Customer';
import Compras from '../features/dashboard/pages/Shopping/Shopping';
import Dashboard from '../features/dashboard/components/Dashboard';
import Empleados from '../features/dashboard/pages/employees/Employees';  
import Pedidos from '../features/dashboard/pages/Orders/Orders';
import Productos from '../features/dashboard/pages/products/products';
import Proveedores from '../features/dashboard/pages/Suppliers/Suppliers';
import RolesPage from '../features/dashboard/pages/Roles/RolesPage';
import SaleServices from '../features/dashboard/pages/SaleServices/SaleServices';
import Servicios from '../features/dashboard/pages/Services/Services';
import Usuarios from '../features/dashboard/pages/Users/Users';
import VentasProductos from '../features/dashboard/pages/SaleProducts/SalesProducts';
import Scheduling from '../features/dashboard/pages/scheduling/scheduling';

// Pages Landing
import Cart from '../features/landing/pages/cart/Cart';
import CuidadoCapilar from '../features/landing/pages/products/pages/CuidadoCapilar';
import Extensiones from '../features/landing/pages/products/pages/Extensiones';
import Home from '../features/landing/components/Home';
import Orders from '../features/landing/pages/orders/Orders';
import ProductDetailPageCliente from '../features/landing/pages/products/pages/ProductDetailPageCliente';
import Quotes from '../features/landing/pages/quotes/Quotes';
import ServicesPage from '../features/landing/pages/ServicesPage/ServicesPage';
import Checkout from '../features/landing/pages/checkout/Checkout';
import ThankYou from '../features/landing/pages/checkout/ThankYou';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'categorias-productos',
        element: <CategoriasProductos />
      },
      {
        path: 'categorias-servicios',
        element: <CategoriasServicios />
      },
      {
        path: 'citas',
        element: <Citas />
      },
      {
        path: 'clientes',
        element: <Clientes />
      },
      {
        path: 'compras',
        element: <Compras />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'empleados',
        element: <Empleados />
      },
      {
        path: 'pedidos',
        element: <Pedidos />
      },
      {
        path: 'productos',
        element: <Productos />
      },
      {
        path: 'proveedores',
        element: <Proveedores />
      },
      {
        path: 'roles',
        element: <RolesPage />
      },
      {
        path: 'servicios',
        element: <Servicios />
      },
      {
        path: 'usuarios',
        element: <Usuarios />
      },
      {
        path: 'ventas-productos',
        element: <VentasProductos />
      },
      {
        path: 'ventas-servicios',
        element: <SaleServices />
      },
      {
        path: 'programacion',
        element: <Scheduling />
      }
    ]
  },
  {
    path: '/landing',
    element: <Landing />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'cart',
        element: <Cart />
      },
      {
        path: 'citas',
        element: <Quotes />
      },
      {
        path: 'cuidado-capilar',
        element: <CuidadoCapilar />
      },
      {
        path: 'extensiones',
        element: <Extensiones />
      },
      {
        path: 'mis-pedidos',
        element: <Orders />
      },
      {
        path: 'pedidos',
        element: <Orders />
      },
      {
        path: 'productos/:id',
        element: <ProductDetailPageCliente />
      },
      {
        path: 'servicespage',
        element: <ServicesPage />
      },
      {
        path: 'servicios',
        element: <ServicesPage />
      },
      {
        path: 'checkout',
        element: <Checkout />
      },
      {
        path: 'gracias',
        element: <ThankYou />
      },
    ]
  }
]);

export default router;