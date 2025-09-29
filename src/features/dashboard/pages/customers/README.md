# Módulo de Clientes - Basado en Usuarios con Rol "Cliente"

Este módulo gestiona clientes obteniendo usuarios con rol "Cliente" del backend y presentándolos como clientes en la interfaz.

## Arquitectura

### Servicios

1. **`CustomerService.js`** - Servicio principal
   - Interfaz unificada para operaciones de clientes
   - Delega todas las operaciones al ClientUserService

2. **`ClientUserService.js`** - Servicio que obtiene usuarios con rol "Cliente"
   - Convierte usuarios a formato de clientes
   - Maneja la comunicación con el backend de usuarios
   - Sin fallback a datos simulados

3. **`UserService.js`** - Servicio base para usuarios
   - Comunicación directa con el backend de usuarios
   - Endpoints: `/users`, `/users/by-role`, etc.

### Flujo de Datos

```
Frontend (Clientes) 
    ↓
CustomerService.js
    ↓
ClientUserService.js
    ↓
UserService.js
    ↓
Backend API (/users)
```

## Configuración

El sistema está configurado para usar únicamente usuarios del backend. 

**✅ ROL CLIENTE**: El rol "Cliente" (ID: 12) ha sido creado en el backend y está disponible para usar.

## Endpoints Requeridos

### ✅ Implementados en el Backend:
- `GET /api/usuarios?roleId=12` - Obtener usuarios con rol "Cliente"
- `GET /api/usuarios/:id` - Obtener usuario por ID

### ❌ Pendientes de Implementar:
- `PUT /api/usuarios/:id` - Actualizar usuario (para editar y cambiar estado)
- `DELETE /api/usuarios/:id` - Eliminar usuario
- `POST /api/usuarios` - Crear nuevo usuario (opcional, se puede usar el módulo de usuarios)

## Conversión de Datos

### Usuario → Cliente
```javascript
{
  id: user.id_usuario,
  documentType: user.tipo_documento || "CC",
  documentNumber: user.documento || "",
  firstName: user.nombre ? user.nombre.split(' ')[0] : "",
  lastName: user.nombre ? user.nombre.split(' ').slice(1).join(' ') : "",
  email: user.correo || "",
  phone: user.telefono || "",
  status: user.estado || "Activo",
  // Campos adicionales
  userId: user.id_usuario,
  role: user.rol?.nombre || "Cliente",
  isUser: true
}
```

### Cliente → Usuario
```javascript
{
  nombre: `${customerData.firstName} ${customerData.lastName}`.trim(),
  correo: customerData.email,
  telefono: customerData.phone,
  tipo_documento: customerData.documentType,
  documento: customerData.documentNumber,
    roleId: 12, // ID del rol "Cliente"
  estado: customerData.status || "Activo"
}
```

## Funcionalidades

- ✅ **Listar** - Usuarios con rol "Cliente" paginados
- ❌ **Crear** - No disponible (crear usuarios desde módulo de usuarios)
- ❌ **Editar** - No disponible (el backend no tiene endpoint PUT implementado)
- ❌ **Eliminar** - No disponible (el backend no tiene endpoint DELETE implementado)
- ❌ **Cambiar Estado** - No disponible (el backend no tiene endpoint PUT implementado)
- ✅ **Búsqueda** - Por nombre, email, documento, etc.
- ✅ **Validaciones** - Documento y email únicos (solo para verificación)

## Ventajas

1. **Reutilización** - Usa la infraestructura existente de usuarios
2. **Consistencia** - Mismos datos de usuario en todo el sistema
3. **Simplicidad** - Sin datos simulados, solo usuarios reales
4. **Escalabilidad** - Fácil integración con el backend existente

## Notas

- Los clientes son usuarios con rol "Cliente"
- Se mantiene compatibilidad con la interfaz existente
- Campos adicionales (`userId`, `role`, `isUser`) para identificación
- Para crear nuevos clientes, usar el módulo de usuarios con rol "Cliente"
