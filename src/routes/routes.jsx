// routes/Routes.jsx
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import Layout from '../features/dashboard/Layout';
import Landing from '../features/landing/Landing';

// Pages Dashboard
import Dashboard from '../features/dashboard/components/Dashboard';
import Usuarios from '../features/dashboard/pages/Users/Users';
import Empleados from '../features/dashboard/pages/Employees/Employees';
import Clientes from '../features/dashboard/pages/Customers/Customer';
import Proveedores from '../features/dashboard/pages/Suppliers/Suppliers';
import CategoriasProductos from '../features/dashboard/pages/CatProducts/CatProducts';
import Productos from '../features/dashboard/pages/Products/Products';
import Compras from '../features/dashboard/pages/Shopping/Shopping';
import CategoriasServicios from '../features/dashboard/pages/CatServices/CatServices';
import Servicios from '../features/dashboard/pages/Services/Services';
import Citas from '../features/dashboard/pages/Quotes/Quotes';
import Pedidos from '../features/dashboard/pages/Orders/Orders';
import VentasProductos from '../features/dashboard/pages/SaleProducts/SalesProducts';/* 
import Configuracion from '../pages/Configuracion'; */
import RolesPage from '../features/dashboard/pages/Roles/RolesPage';

//Pages Landing


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
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'roles',
        element: <RolesPage />
      },
      {
        path: 'usuarios',
        element: <Usuarios />
      },
      {
        path: 'empleados',
        element: <Empleados />
      },
      {
        path: 'clientes',
        element: <Clientes />
      },
      {
        path: 'proveedores',
        element: <Proveedores />
      },
      {
        path: 'categorias-productos',
        element: <CategoriasProductos />
      },
      {
        path: 'productos',
        element: <Productos />
      },
      {
        path: 'compras',
        element: <Compras />
      },
      {
        path: 'categorias-servicios',
        element: <CategoriasServicios />
      },
      {
        path: 'servicios',
        element: <Servicios />
      },
      {
        path: 'citas',
        element: <Citas />
      },
      {
        path: 'pedidos',
        element: <Pedidos />
      },
      {
        path: 'ventas-productos',
        element: <VentasProductos />
      },
      /* {
        path: 'configuracion',
        element: <Configuracion />
      } */
    ]
  }
]);

export default router;