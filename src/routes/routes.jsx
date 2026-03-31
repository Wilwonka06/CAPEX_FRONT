import { createBrowserRouter, Navigate } from "react-router-dom";
import RequireAuth from "../features/auth/components/RequireAuth";
import RequirePrivilege from "../features/auth/components/RequirePrivilege";
import RequireAdminAccess from "../features/auth/components/RequireAdminAccess";
import NotFound from "../shared/components/NotFound";

// Layouts
import Layout from "../features/dashboard/layout";
import Landing from "../features/landing/landing";

// Pages Dashboard
import CategoriasProductos from "../features/dashboard/pages/CatProducts/CatProducts";
import CategoriasServicios from "../features/dashboard/pages/CatServices/CatServices";
import Appointments from "../features/dashboard/pages/appointments/Appointments";
import Clientes from "../features/dashboard/pages/customers/customers";
import Compras from "../features/dashboard/pages/purchases/Purchases";
import Dashboard from "../features/dashboard/components/dashboard";
import Empleados from "../features/dashboard/pages/employees/Employees";
import EmployeeDetailPage from "../features/dashboard/pages/employees/components/EmployeeDetailPage";
import Pedidos from "../features/dashboard/pages/orders/orders";
import Productos from "../features/dashboard/pages/products/products";
import Proveedores from "../features/dashboard/pages/suppliers/Suppliers";
import RolesPage from "../features/dashboard/pages/roles/Roles";
import SaleServices from "../features/dashboard/pages/SaleServices/SaleServices";
import Servicios from "../features/dashboard/pages/services/services";
import Users from "../features/dashboard/pages/users/users";
import VentasProductos from "../features/dashboard/pages/SaleProducts/SalesProducts";
import Scheduling from "../features/dashboard/pages/scheduling/scheduling";

// Pages Landing
import Cart from "../features/landing/pages/cart/Cart";
import Catalogo from "../features/landing/pages/products/Catalogo";
import Home from "../features/landing/components/Home";
import Orders from "../features/landing/pages/orders/Orders";
import ClientAppointments from "../features/landing/pages/ClientAppointments/ClientAppointments";
import ProductDetailPageCliente from "../features/landing/pages/products/pages/ProductDetailPageCliente";
import ServicesPage from "../features/landing/pages/ServicesPage/ServicesPage";
import Checkout from "../features/landing/pages/checkout/Checkout";
import ThankYou from "../features/landing/pages/checkout/ThankYou";
import EditProfile from "../features/landing/components/EditProfile";

import LoginPage from "../features/auth/pages/LoginPage";
import { ForgotPassword } from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";
import EditProfilePage from "../shared/pages/EditProfilePage";
import RegisterPage from "../features/auth/pages/RegisterPage";

const router = createBrowserRouter([
  // Ruta raíz - Home público con navbar
  {
    path: "/",
    element: <Landing />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
  {
    path: "/iniciar-sesion",
    element: <LoginPage />,
  },
  {
    path: "/registrarse",
    element: <RegisterPage />,
  },
  {
    path: "/olvide-contrasena",
    element: <ForgotPassword />,
  },
  {
    path: "/restablecer-contrasena",
    element: <ResetPassword />,
  },
  {
    path: "/edit-profile",
    element: <EditProfile />,
  },
  {
    path: "/perfil",
    element: <EditProfilePage />,
  },
  {
    path: "/dashboard/perfil",
    element: <EditProfilePage />,
  },
  {
    path: "/landing",
    element: <Landing />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "pedidos",
        element: <Orders />,
      },
      {
        path: "mis-pedidos",
        element: <Orders />,
      },
      {
        path: "productos/:id",
        element: <ProductDetailPageCliente />,
      },
      {
        path: "servicios",
        element: <ServicesPage />,
      },
      {
        path: "catalogo",
        element: <Catalogo />,
      },
      {
        path: "checkout",
        element: <Checkout />,
      },
      {
        path: "gracias",
        element: <ThankYou />,
      },
      // Rutas de citas - acceso público pero con mensaje si no está autenticado
      {
        path: "citas",
        element: <ClientAppointments />,
      },
      {
        path: "citas-cliente",
        element: <ClientAppointments />,
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/dashboard",
        element: (
          <RequireAdminAccess>
            <Layout />
          </RequireAdminAccess>
        ),
        children: [
          // Dashboard principal
          // Permitir acceso si tiene Dashboard o algún módulo administrativo
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "roles",
            element: (
              <RequirePrivilege module="Gestión de Usuarios" action="Visualizar">
                <RolesPage />
              </RequirePrivilege>
            ),
          },
          {
            path: "usuarios",
            element: (
              <RequirePrivilege module="Gestión de Usuarios" action="Visualizar">
                <Users />
              </RequirePrivilege>
            ),
          },
          {
            path: "productos",
            element: (
              <RequirePrivilege module="Productos" action="Visualizar">
                <Productos />
              </RequirePrivilege>
            ),
          },
          {
            path: "compras",
            element: (
              <RequirePrivilege module="Compras" action="Visualizar">
                <Compras />
              </RequirePrivilege>
            ),
          },
          {
            path: "proveedores",
            element: (
              <RequirePrivilege module="Proveedores" action="Visualizar">
                <Proveedores />
              </RequirePrivilege>
            ),
          },
          {
            path: "categorias-productos",
            element: (
              <RequirePrivilege module="Categorías de Productos" action="Visualizar">
                <CategoriasProductos />
              </RequirePrivilege>
            ),
          },
          {
            path: "servicios",
            element: (
              <RequirePrivilege module="Servicios" action="Visualizar">
                <Servicios />
              </RequirePrivilege>
            ),
          },
          {
            path: "empleados",
            element: (
              <RequirePrivilege module="Empleados" action="Visualizar">
                <Empleados />
              </RequirePrivilege>
            ),
          },
          {
            path: "empleados/:id",
            element: (
              <RequirePrivilege module="Empleados" action="Visualizar">
                <EmployeeDetailPage />
              </RequirePrivilege>
            ),
          },
          {
            path: "categorias-servicios",
            element: (
              <RequirePrivilege module="Categorías de Servicios" action="Visualizar">
                <CategoriasServicios />
              </RequirePrivilege>
            ),
          },
          {
            path: "ventas-servicios",
            element: (
              <RequirePrivilege module="Ventas" action="Visualizar">
                <SaleServices />
              </RequirePrivilege>
            ),
          },
          {
            path: "ventas-productos",
            element: (
              <RequirePrivilege module="Venta de Productos" action="Visualizar">
                <VentasProductos />
              </RequirePrivilege>
            ),
          },
          {
            path: "pedidos",
            element: (
              <RequirePrivilege module="Pedidos" action="Visualizar">
                <Pedidos />
              </RequirePrivilege>
            ),
          },
          {
            path: "citas",
            element: (
              <RequirePrivilege module="Citas" action="Visualizar">
                <Appointments />
              </RequirePrivilege>
            ),
          },
          {
            path: "clientes",
            element: (
              <RequirePrivilege module="Clientes" action="Visualizar">
                <Clientes />
              </RequirePrivilege>
            ),
          },
          {
            path: "programacion",
            element: (
              <RequirePrivilege module="Programación" action="Visualizar">
                <Scheduling />
              </RequirePrivilege>
            ),
          },
        ],
      },
      {
        path: "/roles",
        element: <Navigate to="/dashboard/roles" replace />,
      },
    ],
  },
  {
    path: "/catalogo",
    element: <Navigate to="/landing/catalogo" replace />,
  },
  {
    path: "/servicios",
    element: <Navigate to="/landing/servicios" replace />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
