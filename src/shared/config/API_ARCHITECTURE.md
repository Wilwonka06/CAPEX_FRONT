# Arquitectura API Modular - CAPEX Frontend

## Descripción General

Esta documentación describe la arquitectura API modular implementada para el proyecto CAPEX Frontend, que se conecta al backend Node.js desplegado en Render con la URL base `https://capex-back.onrender.com/api`.

## Estructura de Carpetas

```
src/
├── shared/
│   └── config/
│       └── apiConfig.js                 # Configuración base de Axios
├── features/
│   └── dashboard/
│       └── pages/
│           ├── products/
│           │   ├── API/
│           │   │   └── productsService.js
│           │   └── hooks/
│           │       └── useProductsAPI.js
│           ├── CatProducts/
│           │   └── API/
│           │       └── categoriesService.js
│           ├── suppliers/
│           │   └── API/
│           │       └── suppliersService.js
│           └── shopping/
│               └── API/
│                   └── purchasesService.js
```

## Componentes de la Arquitectura

### 1. Configuración Base (apiConfig.js)

**Ubicación:** `src/shared/config/apiConfig.js`

**Características:**
- Instancia de Axios configurada con URL base
- Interceptores de request para autenticación automática
- Interceptores de response para manejo global de errores
- Funciones helper para diferentes tipos de requests
- Soporte para upload de archivos
- Manejo de tokens de cancelación

**Funciones principales:**
```javascript
import apiRequest from '../shared/config/apiConfig';

// Métodos disponibles
apiRequest.get(url, config)
apiRequest.post(url, data, config)
apiRequest.put(url, data, config)
apiRequest.patch(url, data, config)
apiRequest.delete(url, config)
```

### 2. Servicios API Modulares

Cada módulo tiene su propio servicio API con operaciones CRUD completas:

#### Productos Service (`productsService.js`)
**Endpoint base:** `/productos`

**Operaciones disponibles:**
- `getAll(params)` - Obtener productos con paginación y filtros
- `getById(id)` - Obtener producto específico
- `create(productData)` - Crear nuevo producto
- `update(id, productData)` - Actualizar producto completo
- `patch(id, partialData)` - Actualización parcial
- `delete(id)` - Eliminar producto
- `changeStatus(id, status)` - Cambiar estado (activo/inactivo)
- `updateStock(id, stock, operation)` - Gestión de inventario
- `search(searchTerm, filters)` - Búsqueda avanzada
- `getByCategory(categoryId, params)` - Filtrar por categoría
- `getLowStock(threshold)` - Productos con stock bajo
- `uploadImage(id, imageFile, onUploadProgress)` - Subir imágenes

#### Categorías Service (`categoriesService.js`)
**Endpoint base:** `/categorias-productos`

**Operaciones disponibles:**
- `getAll(params)` - Obtener categorías con paginación
- `getActive()` - Categorías activas para dropdowns
- `getById(id)` - Obtener categoría específica
- `create(categoryData)` - Crear nueva categoría
- `update(id, categoryData)` - Actualizar categoría
- `patch(id, partialData)` - Actualización parcial
- `delete(id)` - Eliminar categoría
- `changeStatus(id, status)` - Cambiar estado
- `search(searchTerm, filters)` - Búsqueda
- `getWithProducts(params)` - Categorías con información de productos
- `getStats(id)` - Estadísticas de categoría
- `canDelete(id)` - Verificar si puede eliminarse
- `uploadImage(id, imageFile, onUploadProgress)` - Subir imágenes
- `getHierarchy()` - Jerarquía de categorías

#### Proveedores Service (`suppliersService.js`)
**Endpoint base:** `/proveedores`

**Operaciones disponibles:**
- `getAll(params)` - Obtener proveedores con filtros
- `getActive()` - Proveedores activos
- `getById(id)` - Obtener proveedor específico
- `create(supplierData)` - Crear nuevo proveedor
- `update(id, supplierData)` - Actualizar proveedor
- `patch(id, partialData)` - Actualización parcial
- `delete(id)` - Eliminar proveedor
- `changeStatus(id, status)` - Cambiar estado
- `search(searchTerm, filters)` - Búsqueda
- `getByCity(city, params)` - Filtrar por ciudad
- `getByCountry(country, params)` - Filtrar por país
- `getProducts(id, params)` - Productos del proveedor
- `getStats(id)` - Estadísticas del proveedor
- `canDelete(id)` - Verificar si puede eliminarse
- `getPurchaseHistory(id, params)` - Historial de compras
- `validateNit(nit, excludeId)` - Validar NIT/RUC
- `validateEmail(email, excludeId)` - Validar email

#### Compras Service (`purchasesService.js`)
**Endpoint base:** `/compras`

**Operaciones disponibles:**
- `getAll(params)` - Obtener compras con filtros
- `getById(id)` - Obtener compra específica
- `create(purchaseData)` - Crear nueva compra
- `update(id, purchaseData)` - Actualizar compra
- `patch(id, partialData)` - Actualización parcial
- `delete(id)` - Eliminar compra
- `changeStatus(id, status)` - Cambiar estado
- `search(searchTerm, filters)` - Búsqueda
- `getBySupplier(supplierId, params)` - Compras por proveedor
- `getByDateRange(startDate, endDate, params)` - Filtrar por fechas
- `getDetails(id)` - Detalles de compra
- `addDetail(id, detailData)` - Agregar detalle
- `updateDetail(purchaseId, detailId, detailData)` - Actualizar detalle
- `deleteDetail(purchaseId, detailId)` - Eliminar detalle
- `getStats(params)` - Estadísticas de compras
- `generateReport(params)` - Generar reportes
- `confirmReception(id, receptionData)` - Confirmar recepción
- `cancel(id, reason)` - Cancelar compra

### 3. Custom Hooks

Los hooks personalizados facilitan la integración con componentes React:

#### useProductsAPI Hook
**Ubicación:** `src/features/dashboard/pages/products/hooks/useProductsAPI.js`

**Características:**
- Estado reactivo para productos, loading, error y paginación
- Funciones CRUD integradas con manejo de errores
- Búsqueda y filtrado automático
- Paginación integrada
- Notificaciones automáticas con toast

**Uso básico:**
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
};
```

**Hooks adicionales disponibles:**
- `useProduct(productId)` - Para un producto específico
- `useLowStockProducts(threshold)` - Para productos con stock bajo

## Patrones de Uso

### 1. Operaciones CRUD Básicas

```javascript
// Crear producto
try {
  const newProduct = await productsService.create({
    nombre: 'Producto Ejemplo',
    precio: 100,
    stock: 50,
    categoryId: 1,
  });
  console.log('Producto creado:', newProduct);
} catch (error) {
  console.error('Error:', error.message);
}

// Obtener productos con filtros
const products = await productsService.getAll({
  page: 1,
  limit: 10,
  search: 'ejemplo',
  categoryId: 1,
});

// Actualizar producto
const updatedProduct = await productsService.update(1, {
  nombre: 'Producto Actualizado',
  precio: 120,
});
```

### 2. Búsqueda y Filtrado

```javascript
// Búsqueda simple
const results = await productsService.search('término de búsqueda');

// Búsqueda con filtros
const filteredResults = await productsService.search('término', {
  categoryId: 1,
  status: 'activo',
  page: 1,
  limit: 20,
});

// Filtrar por categoría
const categoryProducts = await productsService.getByCategory(1, {
  page: 1,
  limit: 10,
});
```

### 3. Manejo de Estados

```javascript
// Cambiar estado de producto
await productsService.changeStatus(1, 'inactivo');

// Actualizar stock
await productsService.updateStock(1, 100, 'set'); // Establecer stock
await productsService.updateStock(1, 10, 'add');  // Agregar stock
await productsService.updateStock(1, 5, 'subtract'); // Restar stock
```

### 4. Upload de Archivos

```javascript
// Subir imagen con progreso
const handleImageUpload = async (productId, file) => {
  try {
    const result = await productsService.uploadImage(
      productId,
      file,
      (progress) => {
        console.log(`Progreso: ${progress}%`);
      }
    );
    console.log('Imagen subida:', result);
  } catch (error) {
    console.error('Error subiendo imagen:', error);
  }
};
```

### 5. Integración con React Components

```javascript
import React from 'react';
import useProductsAPI from '../hooks/useProductsAPI';

const ProductsList = () => {
  const {
    products,
    loading,
    error,
    pagination,
    searchProducts,
    changePage,
  } = useProductsAPI();

  const handleSearch = (searchTerm) => {
    searchProducts(searchTerm);
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <input 
        type="text" 
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar productos..."
      />
      
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.nombre}</h3>
          <p>Precio: ${product.precio}</p>
          <p>Stock: {product.stock}</p>
        </div>
      ))}
      
      {/* Paginación */}
      <div>
        {Array.from({ length: pagination.totalPages }, (_, i) => (
          <button 
            key={i + 1}
            onClick={() => changePage(i + 1)}
            disabled={pagination.currentPage === i + 1}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};
```

## Manejo de Errores

### 1. Errores Globales (Interceptores)

Los interceptores de Axios manejan automáticamente:
- Errores de autenticación (401) - Limpia tokens y redirige
- Errores de autorización (403) - Muestra mensaje de permisos
- Errores de validación (422) - Muestra errores específicos
- Errores de servidor (500) - Mensaje genérico
- Errores de red - Mensaje de conectividad

### 2. Errores Específicos en Servicios

```javascript
try {
  const product = await productsService.create(productData);
} catch (error) {
  // El error ya fue procesado por los interceptores
  // Aquí puedes manejar lógica específica del componente
  console.error('Error específico:', error.message);
}
```

### 3. Errores en Custom Hooks

Los hooks manejan automáticamente:
- Estados de loading
- Mensajes de error
- Notificaciones toast
- Actualización de estado reactivo

## Configuración de Autenticación

### 1. Tokens JWT

Los tokens se manejan automáticamente:
```javascript
// Los interceptores buscan tokens en:
localStorage.getItem('authToken')
sessionStorage.getItem('authToken')

// Y los agregan automáticamente a las headers:
Authorization: `Bearer ${token}`
```

### 2. Configuración Manual

```javascript
import { apiClient } from '../shared/config/apiConfig';

// Configurar token manualmente
apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Remover token
delete apiClient.defaults.headers.common['Authorization'];
```

## Optimizaciones y Mejores Prácticas

### 1. Caché y Performance

```javascript
// Usar React Query para caché avanzado (recomendado)
import { useQuery } from 'react-query';

const useProducts = (params) => {
  return useQuery(
    ['products', params],
    () => productsService.getAll(params),
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    }
  );
};
```

### 2. Cancelación de Requests

```javascript
import { createCancelToken } from '../shared/config/apiConfig';

const MyComponent = () => {
  useEffect(() => {
    const cancelToken = createCancelToken();
    
    const fetchData = async () => {
      try {
        const data = await productsService.getAll({}, {
          cancelToken: cancelToken.token
        });
      } catch (error) {
        if (!isCancel(error)) {
          console.error('Error:', error);
        }
      }
    };

    fetchData();

    return () => {
      cancelToken.cancel('Component unmounted');
    };
  }, []);
};
```

### 3. Validaciones del Cliente

```javascript
// Validaciones antes de enviar al servidor
const validateProduct = (productData) => {
  const errors = {};
  
  if (!productData.nombre?.trim()) {
    errors.nombre = 'El nombre es requerido';
  }
  
  if (!productData.precio || productData.precio <= 0) {
    errors.precio = 'El precio debe ser mayor a 0';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const handleCreateProduct = async (productData) => {
  const { isValid, errors } = validateProduct(productData);
  
  if (!isValid) {
    setFormErrors(errors);
    return;
  }
  
  try {
    await productsService.create(productData);
  } catch (error) {
    // Manejar errores del servidor
  }
};
```

## Extensibilidad

### 1. Agregar Nuevos Servicios

Para agregar un nuevo módulo:

1. Crear carpeta `API` en el módulo
2. Crear archivo de servicio siguiendo el patrón existente
3. Implementar operaciones CRUD básicas
4. Agregar operaciones específicas del dominio
5. Crear custom hook si es necesario

### 2. Personalizar Interceptores

```javascript
// Agregar interceptor personalizado
apiClient.interceptors.request.use(
  (config) => {
    // Lógica personalizada
    return config;
  },
  (error) => Promise.reject(error)
);
```

### 3. Configuración por Entorno

```javascript
// apiConfig.js
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://capex-back.onrender.com/api'
  : 'http://localhost:3000/api';
```

## Troubleshooting

### Problemas Comunes

1. **Error de CORS**: Verificar configuración del backend
2. **Token expirado**: Los interceptores manejan automáticamente
3. **Timeout**: Ajustar timeout en apiConfig.js
4. **Errores de red**: Verificar conectividad y URL del backend

### Debug

```javascript
// Habilitar logs detallados en desarrollo
if (process.env.NODE_ENV === 'development') {
  apiClient.interceptors.request.use(request => {
    console.log('Starting Request:', request);
    return request;
  });
}
```

Esta arquitectura proporciona una base sólida, escalable y mantenible para la gestión de APIs en el proyecto CAPEX Frontend.