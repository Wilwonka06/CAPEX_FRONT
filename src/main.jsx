import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './shared/styles/input.css';
import './shared/styles/output.css'
import 'bootstrap-icons/font/bootstrap-icons.css'; // o la ruta correcta según tu estructura
import App from './App.jsx'
import { CategoriesProvider } from './features/dashboard/pages/CatProducts/hooks/useCategories';
import { ProductsProvider } from './features/dashboard/pages/products/hooks/useProducts';
import { SuppliersProvider } from './features/dashboard/pages/suppliers/hooks/useSuppliers';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CategoriesProvider>
      <ProductsProvider>
        <SuppliersProvider>
          <App />
        </SuppliersProvider>
      </ProductsProvider>
    </CategoriesProvider>
  </StrictMode>,
)
