// routes/routes.jsx
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import Layout from '../features/dashboard/layout';

// Pages
import Dashboard from '../features/dashboard/components/dashboard';
import Usuarios from '../features/dashboard/pages/users/users';
import Empleados from '../features/dashboard/pages/employees/employess';
import Clientes from '../features/dashboard/pages/customers/customer';
import Proveedores from '../features/dashboard/pages/suppliers/suppiliers';
import CategoriasProductos from '../features/dashboard/pages/cat_products/cat_products';
import Productos from '../features/dashboard/pages/products/products';
import Compras from '../features/dashboard/pages/shopping/shopping';
import CategoriasServicios from '../features/dashboard/pages/cat_services/cat_services';
import Servicios from '../features/dashboard/pages/services/services';
import Citas from '../features/dashboard/pages/quotes/quotes';
import Pedidos from '../features/dashboard/pages/orders/orders';
import VentasProductos from '../features/dashboard/pages/sale_products/sales_products';/* 
import Configuracion from '../pages/Configuracion'; */
import RolesPage from '../features/dashboard/pages/roles/RolesPage';

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