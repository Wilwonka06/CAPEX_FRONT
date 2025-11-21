// routes/Routes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "../features/auth/components/RequireAuth";
import RequirePrivilege from "../features/auth/components/RequirePrivilege";
import NotFound from "../shared/components/NotFound";

// Layouts
import Layout from "../features/dashboard/layout";
import Landing from "../features/landing/landing";

// Pages Dashboard
import CategoriasProductos from "../features/dashboard/pages/CatProducts/CatProducts";
import CategoriasServicios from "../features/dashboard/pages/CatServices/CatServices";
import Appointments from "../features/dashboard/pages/appointments/Appointments";
import Clientes from "../features/dashboard/pages/customers/Customer";
import Compras from "../features/dashboard/pages/purchases/Purchases";
import Dashboard from "../features/dashboard/components/Dashboard";
import Empleados from "../features/dashboard/pages/employees/Employees";
import Pedidos from "../features/dashboard/pages/orders/Orders";
import Productos from "../features/dashboard/pages/products/products";
import Proveedores from "../features/dashboard/pages/Suppliers/Suppliers";
import RolesPage from "../features/dashboard/pages/roles/RolesPage";
import SaleServices from "../features/dashboard/pages/SaleServices/SaleServices";
import Servicios from "../features/dashboard/pages/Services/Services";
import Users from "../features/dashboard/pages/users/Users";
import VentasProductos from "../features/dashboard/pages/SaleProducts/SalesProducts";
import Scheduling from "../features/dashboard/pages/scheduling/scheduling";
import { RolesProvider } from "../features/dashboard/pages/roles/hooks/useRoles";

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
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";
import EditProfilePage from "../shared/pages/EditProfilePage";
import RegisterPage from "../features/auth/pages/RegisterPage";

const AppRoutes = () => (
  <Routes>
    {/* Ruta raíz - Home público con navbar */}
    <Route path="/" element={<Landing />}>
      <Route index element={<Home />} />
    </Route>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/edit-profile" element={<EditProfile />} />
    <Route path="/perfil" element={<EditProfilePage />} />
    <Route path="/dashboard/perfil" element={<EditProfilePage />} />
    <Route path="/landing" element={<Landing />}>
      <Route index element={<Home />} />
      <Route path="cart" element={<Cart />} />
      <Route path="citas" element={<ClientAppointments />} />
      <Route path="pedidos" element={<Orders />} />
      <Route path="mis-pedidos" element={<Orders />} />
      <Route path="productos/:id" element={<ProductDetailPageCliente />} />
      <Route path="servicios" element={<ServicesPage />} />
      <Route path="citas-cliente" element={<ClientAppointments />} />
      <Route path="catalogo" element={<Catalogo />} />
      <Route path="checkout" element={<Checkout />} />
      <Route path="gracias" element={<ThankYou />} />
    </Route>
    <Route element={<RequireAuth />}>
      <Route path="/dashboard" element={<Layout />}>
        {/* Dashboard principal */}
        <Route
          index
          element={
            <RequirePrivilege module="Dashboard" action="Visualizar">
              <Dashboard />
            </RequirePrivilege>
          }
        />
        <Route
          path="roles"
          element={
            <RequirePrivilege module="Gestión de Usuarios" action="Visualizar">
              <RolesProvider>
                <RolesPage />
              </RolesProvider>
            </RequirePrivilege>
          }
        />
        <Route
          path="usuarios"
          element={
            <RequirePrivilege module="Gestión de Usuarios" action="Visualizar">
              <Users />
            </RequirePrivilege>
          }
        />
        <Route
          path="productos"
          element={
            <RequirePrivilege module="Gestión de Compras" action="Visualizar">
              <Productos />
            </RequirePrivilege>
          }
        />
        <Route
          path="compras"
          element={
            <RequirePrivilege module="Gestión de Compras" action="Visualizar">
              <Compras />
            </RequirePrivilege>
          }
        />
        <Route
          path="proveedores"
          element={
            <RequirePrivilege module="Gestión de Compras" action="Visualizar">
              <Proveedores />
            </RequirePrivilege>
          }
        />
        <Route
          path="categorias-productos"
          element={
            <RequirePrivilege module="Gestión de Compras" action="Visualizar">
              <CategoriasProductos />
            </RequirePrivilege>
          }
        />
        <Route
          path="servicios"
          element={
            <RequirePrivilege module="Gestión de Servicios" action="Visualizar">
              <Servicios />
            </RequirePrivilege>
          }
        />
        <Route
          path="empleados"
          element={
            <RequirePrivilege module="Gestión de Servicios" action="Visualizar">
              <Empleados />
            </RequirePrivilege>
          }
        />
        <Route
          path="categorias-servicios"
          element={
            <RequirePrivilege module="Gestión de Servicios" action="Visualizar">
              <CategoriasServicios />
            </RequirePrivilege>
          }
        />
        <Route
          path="ventas-servicios"
          element={
            <RequirePrivilege module="Ventas" action="Visualizar">
              <SaleServices />
            </RequirePrivilege>
          }
        />
        <Route
          path="ventas-productos"
          element={
            <RequirePrivilege module="Ventas" action="Visualizar">
              <VentasProductos />
            </RequirePrivilege>
          }
        />
        <Route
          path="pedidos"
          element={
            <RequirePrivilege module="Ventas" action="Visualizar">
              <Pedidos />
            </RequirePrivilege>
          }
        />
        <Route
          path="citas"
          element={
            <RequirePrivilege module="Ventas" action="Visualizar">
              <Appointments />
            </RequirePrivilege>
          }
        />
        <Route
          path="clientes"
          element={
            <RequirePrivilege module="Ventas" action="Visualizar">
              <Clientes />
            </RequirePrivilege>
          }
        />
        <Route
          path="programacion"
          element={
            <RequirePrivilege module="Dashboard" action="Visualizar">
              <Scheduling />
            </RequirePrivilege>
          }
        />
      </Route>
      <Route path="/roles" element={<Navigate to="/dashboard/roles" replace />} />
    </Route>
    <Route path="/catalogo" element={<Navigate to="/landing/catalogo" replace />} />
    <Route path="/servicios" element={<Navigate to="/landing/servicios" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;