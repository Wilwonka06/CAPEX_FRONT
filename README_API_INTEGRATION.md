# CAPEX Frontend - Integración API Modular

## Resumen del Proyecto

Este documento describe la implementación completa de una arquitectura API modular para el frontend de CAPEX, que se conecta al backend Node.js desplegado en Render (`https://capex-back.onrender.com/api`).

## 🚀 Características Implementadas

### ✅ Configuración Base
- **Axios configurado** con interceptores para autenticación y manejo de errores
- **URL base centralizada** para el backend en Render
- **Manejo automático de tokens JWT**
- **Interceptores de respuesta** para errores globales
- **Soporte para CORS** y headers personalizados

### ✅ Servicios API Modulares
- **Productos** (`/api/productos`) - CRUD completo + gestión de stock + imágenes
- **Categorías** (`/api/categorias-productos`) - CRUD + jerarquías + estadísticas
- **Proveedores** (`/api/proveedores`) - CRUD + validaciones + historial
- **Compras** (`/api/compras`) - CRUD + detalles + reportes + estados

### ✅ Custom Hooks React
- **useProductsAPI** - Hook completo para gestión de productos
- **useProduct** - Hook para producto individual
- **useLowStockProducts** - Hook para productos con stock bajo
- **Estado reactivo** automático con loading, error y paginación

### ✅ Utilidades y Helpers
- **Manejo de errores** normalizado
- **Validaciones** de email, teléfono, archivos
- **Formateo** de precios, fechas y datos
- **Cache simple** para optimización
- **Debounce y throttle** para búsquedas
- **Retry automático** para requests fallidos

### ✅ Documentación Completa
- **Guía de arquitectura** detallada
- **Ejemplos de uso** para cada servicio
- **Patrones de integración** con React
- **Mejores prácticas** y troubleshooting

## 📁 Estructura de Archivos Creados

```
CAPEX_FRONT/
├── src/
│   ├── shared/
│   │   ├── config/
│   │   │   ├── apiConfig.js                    # ✅ Configuración base de Axios
│   │   │   └── API_ARCHITECTURE.md             # ✅ Documentación completa
│   │   └── utils/
│   │       └── apiHelpers.js                   # ✅ Utilidades y helpers
│   └── features/
│       └── dashboard/
│           └── pages/
│               ├── products/
│               │   ├── API/
│               │   │   └── productsService.js   # ✅ Servicio de productos
│               │   ├── hooks/
│               │   │   └── useProductsAPI.js    # ✅ Hook personalizado
│               │   └── components/
│               │       └── ProductsListExample.jsx # ✅ Ejemplo de integración
│               ├── CatProducts/
│               │   └── API/
│               │       └── categoriesService.js # ✅ Servicio de categorías
│               ├── suppliers/
│               │   └── API/
│               │       └── suppliersService.js  # ✅ Servicio de proveedores
│               └── shopping/
│                   └── API/
│                       └── purchasesService.js  # ✅ Servicio de compras
```

## 🔧 Instalación y Configuración

### 1. Dependencias
```bash
cd CAPEX_FRONT
npm install axios  # ✅ Ya instalado
```

### 2. Configuración de Variables de Entorno
```env
# .env
REACT_APP_API_BASE_URL=https://capex-back.onrender.com/api
```

### 3. Importación en tu aplicación
```javascript
// En tu componente principal (App.jsx)
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="App">
      {/* Tu aplicación */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
```

## 📖 Guía de Uso Rápido

### 1. Usar Servicios API Directamente
```javascript
import productsService from '../API/productsService';

// Obtener productos
const products = await productsService.getAll({ page: 1, limit: 10 });

// Crear producto
const newProduct = await productsService.create({
  nombre: 'Producto Ejemplo',
  precio: 100,
  stock: 50,
  categoryId: 1,
});

// Buscar productos
const results = await productsService.search('término de búsqueda');
```

### 2. Usar Custom Hooks (Recomendado)
```javascript
import useProductsAPI from '../hooks/useProductsAPI';

const MyComponent = () => {
  const {
    products,
    loading,
    error,
    pagination,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    changePage,
  } = useProductsAPI();

  // El hook maneja automáticamente el estado y las operaciones
  
  return (
    <div>
      {loading && <div>Cargando...</div>}
      {error && <div>Error: {error}</div>}
      {products.map(product => (
        <div key={product.id}>{product.nombre}</div>
      ))}
    </div>
  );
};
```

### 3. Manejo de Errores Automático
```javascript
// Los errores se manejan automáticamente con toast notifications
try {
  await productsService.create(productData);
  // ✅ Toast de éxito automático
} catch (error) {
  // ❌ Toast de error automático
  // El error ya fue procesado por los interceptores
}
```

## 🎯 Endpoints Disponibles

### Productos (`/api/productos`)
- `GET /` - Listar productos con paginación y filtros
- `GET /:id` - Obtener producto específico
- `POST /` - Crear nuevo producto
- `PUT /:id` - Actualizar producto completo
- `PATCH /:id` - Actualización parcial
- `DELETE /:id` - Eliminar producto
- `PATCH /:id/status` - Cambiar estado
- `PATCH /:id/stock` - Actualizar stock
- `GET /low-stock` - Productos con stock bajo
- `POST /:id/image` - Subir imagen

### Categorías (`/api/categorias-productos`)
- `GET /` - Listar categorías
- `GET /active` - Categorías activas
- `GET /:id` - Obtener categoría específica
- `POST /` - Crear nueva categoría
- `PUT /:id` - Actualizar categoría
- `DELETE /:id` - Eliminar categoría
- `GET /with-products` - Categorías con productos
- `GET /:id/stats` - Estadísticas de categoría

### Proveedores (`/api/proveedores`)
- `GET /` - Listar proveedores
- `GET /active` - Proveedores activos
- `GET /:id` - Obtener proveedor específico
- `POST /` - Crear nuevo proveedor
- `PUT /:id` - Actualizar proveedor
- `DELETE /:id` - Eliminar proveedor
- `GET /:id/products` - Productos del proveedor
- `GET /:id/purchase-history` - Historial de compras

### Compras (`/api/compras`)
- `GET /` - Listar compras
- `GET /:id` - Obtener compra específica
- `POST /` - Crear nueva compra
- `PUT /:id` - Actualizar compra
- `DELETE /:id` - Eliminar compra
- `PATCH /:id/status` - Cambiar estado
- `GET /stats` - Estadísticas de compras
- `GET /report` - Generar reportes

## 🔐 Autenticación

### Token JWT Automático
```javascript
// Los tokens se manejan automáticamente
// Solo necesitas almacenarlos después del login:
localStorage.setItem('authToken', token);
// o
sessionStorage.setItem('authToken', token);

// Los interceptores los agregarán automáticamente a todas las requests
```

### Manejo de Expiración
```javascript
// Los interceptores manejan automáticamente tokens expirados:
// - Limpian el token del storage
// - Muestran mensaje de error
// - Opcionalmente redirigen al login
```

## 🚀 Optimizaciones Implementadas

### 1. Cache Inteligente
```javascript
import { cachedRequest } from '../shared/utils/apiHelpers';

// Request con cache automático
const products = await cachedRequest(
  'products-list',
  () => productsService.getAll(),
  5 * 60 * 1000 // 5 minutos
);
```

### 2. Debounce para Búsquedas
```javascript
import { debounce } from '../shared/utils/apiHelpers';

const debouncedSearch = debounce((term) => {
  searchProducts(term);
}, 300);
```

### 3. Retry Automático
```javascript
import { retryRequest } from '../shared/utils/apiHelpers';

// Retry automático para requests fallidos
const data = await retryRequest(
  () => productsService.getAll(),
  3, // 3 reintentos
  1000 // 1 segundo de delay
);
```

## 📱 Responsive y UX

### Loading States
- Estados de carga automáticos en hooks
- Indicadores visuales durante operaciones
- Deshabilitación de botones durante requests

### Error Handling
- Mensajes de error contextuales
- Toast notifications automáticas
- Recuperación de errores con botones de retry

### Paginación
- Paginación automática en hooks
- Navegación intuitiva
- Información de resultados

## 🧪 Testing y Debug

### Logs de Desarrollo
```javascript
// Los logs automáticos están habilitados en desarrollo
// Verifica la consola para ver requests y responses
```

### Variables de Entorno
```javascript
// Cambiar entre entornos fácilmente
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://capex-back.onrender.com/api'
  : 'http://localhost:3000/api';
```

## 🔧 Personalización

### Agregar Nuevos Servicios
1. Crear carpeta `API` en el módulo
2. Copiar estructura de `productsService.js`
3. Adaptar endpoints y operaciones
4. Crear hook personalizado si es necesario

### Personalizar Interceptores
```javascript
// En apiConfig.js
apiClient.interceptors.request.use(
  (config) => {
    // Tu lógica personalizada
    return config;
  }
);
```

### Personalizar Manejo de Errores
```javascript
// En apiHelpers.js
export const handleApiError = (error, options = {}) => {
  // Tu lógica personalizada de errores
};
```

## 📞 Soporte y Troubleshooting

### Problemas Comunes

1. **Error de CORS**
   - Verificar configuración del backend
   - Comprobar headers permitidos

2. **Token expirado**
   - Los interceptores lo manejan automáticamente
   - Verificar almacenamiento del token

3. **Timeout de requests**
   - Ajustar timeout en `apiConfig.js`
   - Verificar conectividad con el backend

4. **Errores de validación**
   - Los errores 422 se muestran automáticamente
   - Verificar formato de datos enviados

### Debug Avanzado
```javascript
// Habilitar logs detallados
if (process.env.NODE_ENV === 'development') {
  console.log('API Debug Mode Enabled');
}
```

## 🎉 Conclusión

La arquitectura API modular está completamente implementada y lista para usar. Proporciona:

- ✅ **Escalabilidad** - Fácil agregar nuevos módulos
- ✅ **Mantenibilidad** - Código organizado y documentado
- ✅ **Reutilización** - Hooks y servicios reutilizables
- ✅ **UX Optimizada** - Loading states y error handling
- ✅ **Performance** - Cache y optimizaciones
- ✅ **Seguridad** - Manejo automático de autenticación

¡La integración está lista para ser utilizada en producción! 🚀