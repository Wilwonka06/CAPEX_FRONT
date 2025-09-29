# Módulo de Gestión de Roles

Este módulo proporciona una interfaz completa para la gestión de roles y permisos del sistema.

## 🚀 Características

- **CRUD completo** de roles (Crear, Leer, Actualizar, Eliminar)
- **Gestión de permisos** por módulos y acciones
- **Cambio de estado** optimista (Activo/Inactivo)
- **Actualización optimista** para mejor UX
- **Validación** de datos en tiempo real
- **Búsqueda y paginación** de roles
- **Integración completa** con backend

## 📁 Estructura del Módulo

```
roles/
├── components/                    # Componentes de UI (Divide y Vencerás)
│   ├── CreateRole.jsx            # Modal para crear roles
│   ├── EditRole.jsx              # Modal para editar roles
│   ├── ViewRole.jsx              # Modal para visualizar roles
│   ├── RolesTable.jsx            # Tabla principal de roles
│   ├── PrivilegesTable.jsx       # Tabla de permisos y privilegios
│   ├── SearchRole.jsx            # Componente de búsqueda
│   ├── Paginator.jsx             # Componente de paginación
│   ├── StatusToggle.jsx          # Toggle para cambiar estado
│   ├── ActionButtons.jsx         # Botones de acción (Ver, Editar, Eliminar)
│   ├── RoleRow.jsx               # Fila individual de la tabla
│   ├── TableHeader.jsx           # Encabezado de la tabla
│   ├── EmptyState.jsx            # Estado vacío
│   ├── LoadingSpinner.jsx        # Spinner de carga
│   ├── ErrorState.jsx            # Estado de error
│   └── index.js                  # Exportaciones de componentes
├── hooks/                        # Lógica de negocio
│   └── useRoles.jsx              # Hook principal para gestión de roles
├── services/                     # Servicios de API (Divide y Vencerás)
│   ├── BaseService.js            # Servicio base con funcionalidades comunes
│   ├── DataMapper.js             # Mapeo de datos entre frontend y backend
│   ├── RolesApiService.js        # Servicio de API para roles
│   ├── RolesCacheService.js      # Servicio de caché para optimización
│   ├── RolesValidationService.js # Servicio de validación de datos
│   ├── index.js                  # Servicio principal combinado
│   └── RolesService.js           # [DEPRECATED] Servicio original
├── RolesPage.jsx                 # Página principal del módulo
├── index.js                      # Exportaciones del módulo
└── README.md                     # Documentación del módulo
```

## 🏗️ Arquitectura "Divide y Vencerás"

El módulo está diseñado siguiendo el principio de **"Divide y Vencerás"**, donde cada funcionalidad está separada en su propio componente:

### Componentes de UI Separados
- **SearchRole.jsx**: Búsqueda independiente y reutilizable
- **Paginator.jsx**: Paginación con lógica completa
- **StatusToggle.jsx**: Toggle de estado optimista
- **ActionButtons.jsx**: Botones de acción modulares
- **RoleRow.jsx**: Fila de tabla reutilizable
- **TableHeader.jsx**: Encabezado de tabla
- **EmptyState.jsx**: Estado vacío personalizable
- **LoadingSpinner.jsx**: Spinner de carga
- **ErrorState.jsx**: Manejo de errores

### Beneficios de esta Arquitectura
- ✅ **Reutilización**: Cada componente puede usarse independientemente
- ✅ **Mantenibilidad**: Cambios aislados en componentes específicos
- ✅ **Testabilidad**: Cada componente puede probarse por separado
- ✅ **Escalabilidad**: Fácil agregar nuevas funcionalidades
- ✅ **Legibilidad**: Código más limpio y organizado

## 🔧 Arquitectura de Servicios "Divide y Vencerás"

Los servicios también siguen el principio de separación de responsabilidades:

### Servicios Separados
- **BaseService.js**: Funcionalidades base (headers, manejo de errores, timeouts)
- **DataMapper.js**: Conversión de datos entre frontend y backend
- **RolesApiService.js**: Comunicación directa con la API
- **RolesCacheService.js**: Gestión de caché para optimización
- **RolesValidationService.js**: Validación de datos del frontend

### Servicio Principal Combinado
- **index.js**: Combina todos los servicios en una interfaz unificada

### Beneficios de esta Arquitectura de Servicios
- ✅ **Separación de responsabilidades**: Cada servicio tiene una función específica
- ✅ **Reutilización**: BaseService puede usarse en otros módulos
- ✅ **Optimización**: Caché automático para mejorar rendimiento
- ✅ **Validación**: Validación centralizada y reutilizable
- ✅ **Mantenibilidad**: Cambios aislados en servicios específicos
- ✅ **Testabilidad**: Cada servicio puede probarse independientemente

## 🎯 Componentes Principales

### RolesPage.jsx
Página principal que orquesta todos los componentes y maneja el estado global.

### RolesTable.jsx
Tabla que muestra la lista de roles con funcionalidades de:
- Búsqueda y filtrado
- Paginación
- Acciones (Ver, Editar, Eliminar, Cambiar estado)

### CreateRole.jsx
Modal para crear nuevos roles con:
- Formulario de validación
- Selección de permisos y privilegios
- Cierre automático tras creación exitosa

### EditRole.jsx
Modal para editar roles existentes con:
- Carga automática de datos del rol
- Actualización optimista
- Cierre automático tras edición exitosa

### ViewRole.jsx
Modal de solo lectura para visualizar detalles completos del rol.

### PrivilegesTable.jsx
Componente reutilizable para gestionar permisos por módulos:
- Compras
- Servicios
- Venta
- Configuración
- Usuarios

Con acciones: Create, Read, Edit, Delete

## 🔧 Hook useRoles

Proporciona toda la lógica de negocio para:
- Gestión de estado de roles
- Operaciones CRUD
- Actualización optimista
- Manejo de errores
- Sincronización con backend

## 🌐 Servicio RolesService

Maneja la comunicación con el backend:
- Mapeo de datos entre frontend y backend
- Manejo de errores HTTP
- Configuración de headers y autenticación
- Timeout y reintentos

## ⚡ Características de Rendimiento

### Actualización Optimista
- Los cambios se reflejan inmediatamente en la UI
- La sincronización con el backend ocurre en segundo plano
- Reversión automática si falla la sincronización
- **Creación de roles**: Modal se cierra inmediatamente, rol aparece en la lista al instante
- **Edición de roles**: Cambios se reflejan inmediatamente, modal se cierra al instante
- **Cambio de estado**: Toggle responde inmediatamente, sin estados de carga

### Sin Estados de Carga
- Interfaz siempre responsiva
- No hay bloqueos por operaciones de red
- Experiencia de usuario fluida
- Modales se cierran inmediatamente después de acciones

### Manejo de Errores Robusto
- Mensajes de error informativos
- Reversión automática de cambios fallidos
- Feedback inmediato al usuario
- Sincronización en segundo plano

### Utilidades Optimistas
- Utiliza el patrón de actualización optimista documentado en `src/shared/patterns/OptimisticUpdates.md`
- Funciones utilitarias en `src/shared/utils/optimisticUpdates.js`
- Reutilizable para otros módulos del sistema

## 🔗 Integración con Backend

El módulo se conecta con el backend desplegado en Render:
- **Base URL**: `https://capex-back.onrender.com/api/roles`
- **Proxy local**: Configurado en `vite.config.js` para desarrollo
- **Autenticación**: Headers de usuario incluidos automáticamente

## 📋 Endpoints Utilizados

- `GET /api/roles` - Obtener todos los roles
- `POST /api/roles` - Crear nuevo rol
- `PUT /api/roles/{id}` - Actualizar rol existente
- `DELETE /api/roles/{id}` - Eliminar rol
- `PATCH /api/roles/{id}/status` - Cambiar estado del rol

## 🎨 Estilos

Utiliza Tailwind CSS para estilos consistentes:
- Diseño responsivo
- Componentes reutilizables
- Tema coherente con el resto de la aplicación

## 🚀 Uso

### Uso Completo del Módulo
```jsx
import { RolesProvider } from './hooks/useRoles';
import RolesPage from './RolesPage';

function App() {
  return (
    <RolesProvider>
      <RolesPage />
    </RolesProvider>
  );
}
```

### Uso de Componentes Individuales
```jsx
// Importar componentes específicos
import { 
  SearchRole, 
  Paginator, 
  StatusToggle, 
  ActionButtons,
  EmptyState,
  LoadingSpinner,
  ErrorState 
} from './components';

// Usar componentes independientemente
<SearchRole 
  searchTerm={searchTerm} 
  onSearchChange={handleSearch} 
  placeholder="Buscar..." 
/>

<Paginator 
  currentPage={1} 
  totalPages={5} 
  onPageChange={handlePageChange}
  itemsPerPage={10}
  totalItems={50}
/>

<StatusToggle 
  role={role} 
  onStatusChange={handleStatusChange} 
/>
```

### Uso de Servicios Individuales
```jsx
// Importar servicios específicos
import { 
  RolesApiService, 
  DataMapper, 
  RolesCacheService,
  RolesValidationService 
} from './services';

// Usar servicios independientemente
const apiService = new RolesApiService();
const cacheService = new RolesCacheService();

// Validar datos
const validation = RolesValidationService.validateCreateRole(roleData);

// Mapear datos
const mappedData = DataMapper.mapRoleToBackend(roleData);

// Usar caché
const cachedRoles = cacheService.getRoles();
```

### Uso del Servicio Principal
```jsx
// Importar el servicio principal (recomendado)
import rolesService from './services';

// El servicio principal combina todas las funcionalidades
const roles = await rolesService.getAllRoles();
const newRole = await rolesService.createRole(roleData);
const updatedRole = await rolesService.updateRole(id, roleData);
```

## 📝 Notas de Desarrollo

- El módulo está completamente optimizado para producción
- Todos los logs de debugging han sido removidos
- La estructura está organizada siguiendo mejores prácticas
- Código limpio y mantenible