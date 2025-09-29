# Patrón de Actualización Optimista

## 📋 Descripción

La **Actualización Optimista** es un patrón de diseño que mejora la experiencia del usuario al actualizar la interfaz inmediatamente después de una acción, antes de que el servidor confirme la operación. Si la operación falla, la interfaz se revierte al estado anterior.

## 🎯 Beneficios

- ✅ **UX Mejorada**: La interfaz responde instantáneamente
- ✅ **Sin Estados de Carga**: No hay spinners o botones deshabilitados
- ✅ **Feedback Inmediato**: El usuario ve el resultado de su acción al instante
- ✅ **Tolerancia a Fallos**: Si falla, se revierte automáticamente
- ✅ **Percepción de Velocidad**: La app se siente más rápida

## 🏗️ Arquitectura del Patrón

### Componentes Involucrados

1. **Componente Padre**: Maneja el estado global y la lógica optimista
2. **Hook Personalizado**: Proporciona funciones de sincronización con el backend
3. **Servicios**: Manejan la comunicación con la API
4. **Componentes de UI**: Reciben callbacks optimistas

### Flujo de Datos

```
Usuario Acciona → UI Actualiza Inmediatamente → Backend Sincroniza → Confirma o Revierte
```

## 💻 Implementación

### 1. Estructura del Hook

```javascript
// hooks/useEntity.jsx
const useEntity = () => {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función que SOLO sincroniza con el backend (sin actualizar estado local)
  const createEntity = async (entityData) => {
    try {
      const newEntity = await entityService.create(entityData);
      return newEntity; // Retorna el resultado, no actualiza estado
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateEntity = async (id, entityData) => {
    try {
      const updatedEntity = await entityService.update(id, entityData);
      return updatedEntity; // Retorna el resultado, no actualiza estado
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    entities,
    setEntities, // Exportar para actualización optimista
    loading,
    error,
    createEntity,
    updateEntity,
    // ... otras funciones
  };
};
```

### 2. Lógica Optimista en el Componente Padre

```javascript
// pages/EntityPage.jsx
const EntityPage = () => {
  const { entities, setEntities, createEntity, updateEntity } = useEntity();

  // CREAR con actualización optimista
  const handleCreate = async (newEntityData) => {
    // 1. Guardar estado anterior para reversión
    const previousEntities = [...entities];
    
    // 2. Generar ID temporal
    const tempId = `temp_${Date.now()}`;
    
    // 3. Crear entidad optimista
    const optimisticEntity = {
      id: tempId,
      ...newEntityData,
      // Campos por defecto
      estado: 'Activo',
      createdAt: new Date().toISOString()
    };
    
    // 4. Actualizar UI inmediatamente
    setEntities(prev => [optimisticEntity, ...prev]);
    
    // 5. Cerrar modal/limpiar formulario inmediatamente
    setIsCreateOpen(false);
    
    // 6. Mostrar feedback inmediato
    toast.success('Entidad creada exitosamente');
    
    // 7. Sincronizar con backend en segundo plano
    try {
      const createdEntity = await createEntity(newEntityData);
      
      // 8. Reemplazar entidad temporal con la real
      setEntities(prev => prev.map(entity => 
        entity.id === tempId ? createdEntity : entity
      ));
      
    } catch (error) {
      // 9. Si falla, revertir cambios
      setEntities(previousEntities);
      toast.error('Error al sincronizar. Los cambios se han revertido.');
      throw error;
    }
  };

  // ACTUALIZAR con actualización optimista
  const handleUpdate = async (updatedEntityData) => {
    // 1. Guardar estado anterior
    const previousEntities = [...entities];
    
    // 2. Actualizar UI inmediatamente
    const entityIndex = entities.findIndex(e => e.id === updatedEntityData.id);
    if (entityIndex !== -1) {
      const updatedEntities = [...entities];
      updatedEntities[entityIndex] = {
        ...updatedEntities[entityIndex],
        ...updatedEntityData
      };
      setEntities(updatedEntities);
    }
    
    // 3. Cerrar modal inmediatamente
    setIsEditOpen(false);
    
    // 4. Mostrar feedback inmediato
    toast.success('Entidad actualizada exitosamente');
    
    // 5. Sincronizar con backend
    try {
      const updatedEntity = await updateEntity(updatedEntityData.id, updatedEntityData);
      
      // 6. Actualizar con datos reales del backend
      setEntities(prev => prev.map(entity => 
        entity.id === updatedEntityData.id ? updatedEntity : entity
      ));
      
    } catch (error) {
      // 7. Si falla, revertir cambios
      setEntities(previousEntities);
      toast.error('Error al sincronizar. Los cambios se han revertido.');
      throw error;
    }
  };

  // CAMBIAR ESTADO con actualización optimista
  const handleStatusChange = async (entityId, newStatus) => {
    const entity = entities.find(e => e.id === entityId);
    if (!entity) return;

    // 1. Guardar estado anterior
    const previousStatus = entity.estado;
    
    // 2. Actualizar UI inmediatamente
    setEntities(prev => prev.map(e => 
      e.id === entityId ? { ...e, estado: newStatus } : e
    ));
    
    // 3. Mostrar feedback inmediato
    toast.success(`Entidad ${newStatus === 'Activo' ? 'activada' : 'desactivada'}`);
    
    // 4. Sincronizar con backend
    try {
      await changeEntityStatus(entityId, newStatus);
    } catch (error) {
      // 5. Si falla, revertir cambios
      setEntities(prev => prev.map(e => 
        e.id === entityId ? { ...e, estado: previousStatus } : e
      ));
      toast.error('Error al sincronizar. El cambio se ha revertido.');
    }
  };

  return (
    <div>
      {/* UI Components */}
    </div>
  );
};
```

### 3. Componentes de UI Simplificados

```javascript
// components/CreateEntity.jsx
const CreateEntity = ({ isOpen, onClose, onCreate }) => {
  const handleSubmit = async (entityData) => {
    if (onCreate) {
      // Cerrar modal inmediatamente (actualización optimista)
      onClose();
      
      // Sincronizar con backend en segundo plano
      try {
        await onCreate(entityData);
      } catch (error) {
        // El error ya se maneja en el componente padre
        console.error('Error al crear entidad:', error);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {/* Formulario */}
        <button type="submit">Crear</button>
      </form>
    </Modal>
  );
};

// components/EditEntity.jsx
const EditEntity = ({ isOpen, onClose, onEdit, entity }) => {
  const handleSubmit = async (updatedData) => {
    if (onEdit) {
      // Cerrar modal inmediatamente (actualización optimista)
      onClose();
      
      // Sincronizar con backend en segundo plano
      try {
        await onEdit(updatedData);
      } catch (error) {
        // El error ya se maneja en el componente padre
        console.error('Error al editar entidad:', error);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {/* Formulario */}
        <button type="submit">Guardar</button>
      </form>
    </Modal>
  );
};
```

## 🔧 Consideraciones Técnicas

### IDs Temporales

```javascript
// Generar IDs temporales únicos
const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// O usar UUID si está disponible
import { v4 as uuidv4 } from 'uuid';
const tempId = `temp_${uuidv4()}`;
```

### Manejo de Estados

```javascript
// Estados que deben manejarse en la actualización optimista
const optimisticEntity = {
  id: tempId,
  name: entityData.name,
  description: entityData.description,
  estado: 'Activo', // Estado por defecto
  privileges: entityData.privileges || {},
  permisos: [], // Arrays vacíos por defecto
  privilegios: [],
  createdAt: new Date().toISOString(), // Timestamp
  updatedAt: new Date().toISOString()
};
```

### Reversión de Cambios

```javascript
// Siempre guardar el estado anterior antes de hacer cambios
const previousState = [...entities];

// En caso de error, revertir completamente
catch (error) {
  setEntities(previousState);
  toast.error('Error al sincronizar. Los cambios se han revertido.');
}
```

## 📝 Casos de Uso

### ✅ Ideal para:
- **CRUD Operations**: Crear, actualizar, eliminar entidades
- **Cambios de Estado**: Activar/desactivar, cambiar estado
- **Operaciones Frecuentes**: Acciones que el usuario realiza a menudo
- **APIs Lentas**: Cuando el backend tiene latencia alta

### ❌ No usar para:
- **Operaciones Críticas**: Transacciones financieras, cambios de seguridad
- **Datos Sensibles**: Información que debe validarse antes de mostrar
- **Operaciones Complejas**: Procesos que requieren múltiples pasos

## 🚀 Ejemplo Completo: Módulo de Roles

Ver implementación completa en:
- `src/features/dashboard/pages/roles/RolesPage.jsx`
- `src/features/dashboard/pages/roles/hooks/useRoles.jsx`
- `src/features/dashboard/pages/roles/components/`

## 📚 Referencias

- [Optimistic UI Updates - React Documentation](https://react.dev/learn/keeping-components-pure)
- [Optimistic Updates Pattern - TanStack Query](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [UX Patterns: Optimistic Updates](https://uxdesign.cc/optimistic-ui-patterns-5c5b3a5f2e5a)

---

**Nota**: Este patrón mejora significativamente la percepción de velocidad de la aplicación y la experiencia del usuario, especialmente en aplicaciones con APIs lentas o conexiones inestables.
