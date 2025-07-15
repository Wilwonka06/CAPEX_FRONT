// routes/Routes.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import RequireAuth from '../features/auth/components/RequireAuth';
import RequirePrivilege from '../features/auth/components/RequirePrivilege';
import NotFound from '../shared/components/NotFound';

// Layouts
import Layout from '../features/dashboard/Layout';
import Landing from '../features/landing/Landing';

// Pages Dashboard
import CategoriasProductos from '../features/dashboard/pages/CatProducts/CatProducts';
import CategoriasServicios from '../features/dashboard/pages/CatServices/CatServices';
import Appointments from '../features/dashboard/pages/appointments/Appointments';
import Clientes from '../features/dashboard/pages/Customers/Customer';
import Compras from '../features/dashboard/pages/Shopping/Shopping';
import Dashboard from '../features/dashboard/components/Dashboard';
import Empleados from '../features/dashboard/pages/employees/Employees';  
import Pedidos from '../features/dashboard/pages/Orders/Orders';
import Productos from '../features/dashboard/pages/products/products';
import Proveedores from '../features/dashboard/pages/Suppliers/Suppliers';
import RolesPage from '../features/dashboard/pages/roles/RolesPage';
import SaleServices from '../features/dashboard/pages/SaleServices/SaleServices';
import Servicios from '../features/dashboard/pages/Services/Services';
import Users from '../features/dashboard/pages/users/Users';
import VentasProductos from '../features/dashboard/pages/SaleProducts/SalesProducts';
import Scheduling from '../features/dashboard/pages/scheduling/scheduling';

// Pages Landing
import Cart from '../features/landing/pages/cart/Cart';
import CuidadoCapilar from '../features/landing/pages/products/pages/CuidadoCapilar';
import Extensiones from '../features/landing/pages/products/pages/Extensiones';
import Home from '../features/landing/components/Home';
import Orders from '../features/landing/pages/orders/Orders';
import Products from '../features/landing/pages/products/Products';
import ClientAppointments from '../features/landing/pages/ClientAppointments/ClientAppointments';
import ProductDetailPageCliente from '../features/landing/pages/products/pages/ProductDetailPageCliente';
import Quotes from '../features/landing/pages/quotes/Quotes';
import ServicesPage from '../features/landing/pages/ServicesPage/ServicesPage';
import Checkout from '../features/landing/pages/checkout/Checkout';
import ThankYou from '../features/landing/pages/checkout/ThankYou';
import EditProfile from '../features/landing/components/EditProfile';

import LoginPage from '../features/auth/pages/LoginPage';
import ForgotPassword from '../features/auth/pages/ForgotPassword';
import ResetPassword from '../features/auth/pages/ResetPassword';
import EditProfilePage from '../shared/pages/EditProfilePage';
import RegisterPage from '../features/auth/pages/RegisterPage';

const router = createBrowserRouter([
  // Rutas públicas de autenticación
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/edit-profile',
    element: <EditProfile />,
  },
  {
    path: '/perfil',
    element: <EditProfilePage />,
  },
  {
    path: '/dashboard/perfil',
    element: <EditProfilePage />,
  },
  
  // Rutas protegidas
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      // Dashboard con rutas protegidas por privilegios
      {
        path: '/dashboard',
        element: <Layout />,
        children: [
          {
            index: true,
            element: (
              <RequirePrivilege module="Dashboard" action="Visualizar">
                <Dashboard />
              </RequirePrivilege>
            )
          },
          {
            path: 'roles',
            element: (
              <RequirePrivilege module="Gestión de Usuarios" action="Visualizar">
                <RolesPage />
              </RequirePrivilege>
            )
          },
          {
            path: 'usuarios',
            element: (
              <RequirePrivilege module="Gestión de Usuarios" action="Visualizar">
                <Users />
              </RequirePrivilege>
            )
          },
          {
            path: 'productos',
            element: (
              <RequirePrivilege module="Gestión de Compras" action="Visualizar">
                <Productos />
              </RequirePrivilege>
            )
          },
          {
            path: 'compras',
            element: (
              <RequirePrivilege module="Gestión de Compras" action="Visualizar">
                <Compras />
              </RequirePrivilege>
            )
          },
          {
            path: 'proveedores',
            element: (
              <RequirePrivilege module="Gestión de Compras" action="Visualizar">
                <Proveedores />
              </RequirePrivilege>
            )
          },
          {
            path: 'categorias-productos',
            element: (
              <RequirePrivilege module="Gestión de Compras" action="Visualizar">
                <CategoriasProductos />
              </RequirePrivilege>
            )
          },
          {
            path: 'servicios',
            element: (
              <RequirePrivilege module="Gestión de Servicios" action="Visualizar">
                <Servicios />
              </RequirePrivilege>
            )
          },
          {
            path: 'empleados',
            element: (
              <RequirePrivilege module="Gestión de Servicios" action="Visualizar">
                <Empleados />
              </RequirePrivilege>
            )
          },
          {
            path: 'categorias-servicios',
            element: (
              <RequirePrivilege module="Gestión de Servicios" action="Visualizar">
                <CategoriasServicios />
              </RequirePrivilege>
            )
          },
          {
            path: 'ventas-servicios',
            element: (
              <RequirePrivilege module="Ventas" action="Visualizar">
                <SaleServices />
              </RequirePrivilege>
            )
          },
          {
            path: 'ventas-productos',
            element: (
              <RequirePrivilege module="Ventas" action="Visualizar">
                <VentasProductos />
              </RequirePrivilege>
            )
          },
          {
            path: 'pedidos',
            element: (
              <RequirePrivilege module="Ventas" action="Visualizar">
                <Pedidos />
              </RequirePrivilege>
            )
          },
          {
            path: 'citas',
            element: (
              <RequirePrivilege module="Ventas" action="Visualizar">
                <Appointments />
              </RequirePrivilege>
            )
          },
          {
            path: 'clientes',
            element: (
              <RequirePrivilege module="Ventas" action="Visualizar">
                <Clientes />
              </RequirePrivilege>
            )
          },
          {
            path: 'programacion',
            element: <Scheduling />
          }
        ]
      },
      // Landing page del cliente
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
            element: <ClientAppointments />
          },
          {
            path: 'pedidos',
            element: <Orders />
          },
          {
            path: 'productos',
            element: <Products />
          },
          {
            path: 'productos/:id',
            element: <ProductDetailPageCliente />
          },
          {
            path: 'servicios',
            element: <ServicesPage />
          },
          {
            path: 'servicespage',
            element: <ServicesPage />
          },
          {
            path: 'citas-cliente',
            element: <ClientAppointments />
          },
          {
            path: 'mis-pedidos',
            element: <Orders />
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
            path: 'quotes',
            element: <Quotes />
          }
        ]
      },
      // Redirección para compatibilidad
      {
        path: '/roles',
        element: <Navigate to="/dashboard/roles" replace />
      }
    ]
  },
  {
    path: '*',
    element: <NotFound />
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