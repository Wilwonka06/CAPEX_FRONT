# Sistema de Autenticación y Autorización

## Descripción General

Este sistema implementa un control de acceso basado en roles (RBAC) con verificación de privilegios específicos por módulo y acción.

## Componentes Principales

### 1. AuthContext (`src/shared/contexts/AuthContext.jsx`)

Contexto global que maneja el estado de autenticación de la aplicación.

**Funciones principales:**
- `login(user)`: Autentica al usuario y lo redirige según su rol
- `logout()`: Cierra la sesión y redirige al login
- `hasPrivilege(module, action)`: Verifica si el usuario tiene un privilegio específico
- `getRoleRedirect(role)`: Obtiene la ruta de redirección según el rol

**Estados:**
- `currentUser`: Usuario actual autenticado
- `loading`: Estado de carga durante la verificación de autenticación

### 2. RequireAuth (`src/features/auth/components/RequireAuth.jsx`)

Componente que protege rutas que requieren autenticación.

**Comportamiento:**
- Verifica si el usuario está autenticado
- Si no está autenticado, redirige a `/login`
- Si está autenticado, renderiza el contenido protegido

### 3. RequirePrivilege (`src/features/auth/components/RequirePrivilege.jsx`)

Componente que protege rutas que requieren privilegios específicos.

**Props:**
- `module`: Nombre del módulo requerido
- `action`: Acción específica requerida (Visualizar, Crear, Editar, Eliminar)

**Comportamiento:**
- Verifica si el usuario tiene los privilegios necesarios
- Si no los tiene, muestra una página de "Acceso denegado"
- Proporciona botones para volver al inicio o cerrar sesión

### 4. ProtectedRoute (`src/shared/components/ProtectedRoute.jsx`)

Componente más flexible para protección de rutas.

**Props:**
- `requireAuth`: Si requiere autenticación (default: true)
- `requiredPrivileges`: Objeto con `module` y `action` requeridos
- `redirectTo`: Ruta de redirección si no está autenticado
- `fallbackComponent`: Componente personalizado para mostrar en caso de acceso denegado

## Estructura de Privilegios

Los privilegios se almacenan en el objeto `privileges` del usuario:

```javascript
privileges: {
  'Dashboard': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
  'Gestión de Usuarios': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
  'Gestión de Compras': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
  'Gestión de Servicios': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
  'Ventas': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true }
}
```

## Redirección por Roles

- **Administrador**: `/dashboard`
- **Empleado**: `/landing`
- **Cliente**: `/landing`

## Configuración de Rutas

Las rutas están configuradas en `src/routes/routes.jsx` con diferentes niveles de protección:

```javascript
{
  element: <RequireAuth />, // Requiere autenticación
  children: [
    {
      element: <RequirePrivilege module="Dashboard" action="Visualizar" />, // Requiere privilegios específicos
      children: [
        { path: 'dashboard', element: <Dashboard /> }
      ]
    }
  ]
}
```

## Flujo de Autenticación

1. **Login**: Usuario ingresa credenciales
2. **Verificación**: Se valida contra usuarios en localStorage
3. **Almacenamiento**: Se guarda el usuario en localStorage
4. **Redirección**: Se redirige según el rol del usuario
5. **Protección**: Las rutas verifican autenticación y privilegios

## Manejo de Errores

### Acceso Denegado
- Muestra página con mensaje claro
- Proporciona opciones para volver al inicio o cerrar sesión
- Incluye información sobre el módulo y acción requeridos

### Rutas No Encontradas (404)
- Componente `NotFound` personalizado
- Redirección inteligente según el estado de autenticación

### Loading States
- Spinner de carga durante verificación de autenticación
- Componente `LoadingSpinner` reutilizable

## Uso del Hook useAuth

```javascript
import { useAuth } from '../shared/contexts/AuthContext';

const MyComponent = () => {
  const { currentUser, loading, hasPrivilege, logout } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      {currentUser && <p>Bienvenido, {currentUser.nombre}</p>}
      {hasPrivilege('Dashboard', 'Visualizar') && <Dashboard />}
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
};
```

## Seguridad

- Verificación de autenticación en cada ruta protegida
- Verificación de privilegios específicos por módulo
- Redirección automática a login si no está autenticado
- Limpieza de datos de sesión al cerrar sesión
- Validación de estado del usuario (activo/inactivo)

## Datos de Prueba

Usuario administrador por defecto:
- Email: `admin@admin.com`
- Password: `admin123`
- Rol: `Administrador`
- Privilegios: Todos los módulos con todas las acciones 