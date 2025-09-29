# Módulo de Venta de Servicios

## Descripción
Este módulo gestiona las citas que están en estado "En ejecución" y las muestra como ventas de servicios. Cuando una cita cambia a estado "En ejecución", automáticamente aparece en este módulo.

## Funcionalidades

### 1. Listado de Citas en Ejecución
- **Fuente de datos**: Endpoint `GET /api/citas` filtrado por estado "En ejecución"
- **Actualización automática**: Al cargar el componente
- **Búsqueda**: Endpoint `GET /api/citas/buscar` con término de búsqueda
- **Actualización manual**: Botón "Actualizar" para recargar datos

### 2. Gestión de Estados
- **Ver detalles**: Modal con información completa de la cita
- **Anular cita**: Cambia estado a "Anulado" usando `PUT /api/citas/:id`
- **Editar**: Modal para modificar datos de la cita (funcionalidad existente)

### 3. Integración con Backend

#### Servicios utilizados:
- `CitasService.js`: Manejo de operaciones con citas
- `ServiceOrderService.js`: Operaciones de órdenes de servicio (legacy)

#### Endpoints utilizados:
- `GET /api/citas` - Obtener todas las citas
- `GET /api/citas/buscar` - Buscar citas por término
- `GET /api/citas/:id` - Obtener cita específica
- `PUT /api/citas/:id` - Actualizar estado de cita
- `POST /api/citas/:id/iniciar-servicio` - Iniciar servicio

## Estructura de Datos

### Transformación de Cita a Venta de Servicio
Las citas del backend se transforman al formato esperado por el componente:

```javascript
{
  id: cita.id,
  clientName: cita.cliente?.nombre || cita.cliente_nombre,
  status: cita.estado,
  date: formatearFecha(cita.fecha_cita),
  time: formatearHora(cita.hora_cita),
  servicios: cita.servicios.map(servicio => ({
    id: servicio.id,
    name: servicio.nombre,
    quantity: servicio.cantidad,
    price: servicio.precio,
    subtotal: servicio.precio * servicio.cantidad,
    employee: { name: servicio.empleado?.nombre }
  })),
  productos: cita.productos?.map(producto => ({
    id: producto.id,
    name: producto.nombre,
    quantity: producto.cantidad,
    price: producto.precio,
    subtotal: producto.precio * producto.cantidad
  })) || [],
  totalServices: // Calculado automáticamente
  totalProducts: // Calculado automáticamente
  totalGeneral: // Calculado automáticamente
}
```

## Componentes

### Principales
- `SaleServices.jsx` - Componente principal con listado y gestión
- `ViewServiceSaleDetail.jsx` - Modal para ver detalles de cita
- `EditServiceOrder.jsx` - Modal para editar cita
- `AnularServiceOrder.jsx` - Modal para anular cita

### Nuevos
- `IniciarServicioModal.jsx` - Modal para iniciar servicio desde cita
- `CitasService.js` - Servicio para operaciones con citas

## Estados de Carga
- `initialLoading`: Carga inicial de datos
- `loading`: Operaciones en curso (búsqueda, actualización, etc.)

## Notificaciones
- Toast notifications para todas las operaciones
- Mensajes de éxito y error
- Indicadores de carga en botones

## Filtros y Búsqueda
- **Filtro por estado**: "En ejecución" y "Pagadas"
- **Búsqueda**: Por ID, nombre de cliente, servicios, etc.
- **Paginación**: 5 elementos por página

## Consideraciones Técnicas

### Manejo de Errores
- Try-catch en todas las operaciones async
- Mensajes de error específicos
- Fallback a array vacío en caso de error

### Performance
- Debounce en búsqueda (implementar si es necesario)
- Carga lazy de datos
- Reutilización de componentes

### Responsive Design
- Tabla responsive
- Modales adaptativos
- Botones con iconos Bootstrap

## Próximas Mejoras
1. Implementar debounce en búsqueda
2. Agregar filtros avanzados
3. Exportar datos a PDF/Excel
4. Notificaciones en tiempo real
5. Historial de cambios de estado

