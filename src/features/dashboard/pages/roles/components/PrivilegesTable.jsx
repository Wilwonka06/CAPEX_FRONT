import { useState, useEffect } from 'react';
import TableSkeleton from '../../../../../shared/components/TableSkeleton';
import { rolesService } from '../API/rolesService';

/**
 * Componente para gestionar privilegios de roles
 * 
 * props:
 *  value: { [modulo]: { [accion]: boolean } }
 *  onChange: (modulo, accion, checked) => void
 *  disabled: boolean (opcional)
 */

// Configuración de acciones permitidas por módulo
const moduleActions = {
  'Usuarios': ['Crear', 'Visualizar', 'Editar', 'Eliminar'],
  'Roles': ['Crear', 'Visualizar', 'Editar', 'Eliminar'],
  'Categorías de Productos': ['Crear', 'Visualizar', 'Editar'],
  'Productos': ['Crear', 'Visualizar', 'Editar', 'Eliminar'],
  'Proveedores': ['Crear', 'Visualizar', 'Editar'],
  'Compras': ['Crear', 'Visualizar', 'Editar'],
  'Categorías de Servicios': ['Crear', 'Visualizar', 'Editar'],
  'Servicios': ['Crear', 'Visualizar', 'Editar', 'Eliminar'],
  'Empleados': ['Crear', 'Visualizar', 'Editar'],
  'Programación': ['Crear', 'Visualizar', 'Editar', 'Crear novedades'],
  'Clientes': ['Crear', 'Visualizar', 'Editar'],
  'Citas': ['Crear', 'Visualizar', 'Editar'],
  'Pedidos': ['Visualizar', 'Editar'],
  'Venta de Productos': ['Crear', 'Visualizar', 'Editar'],
  'Ventas': ['Crear', 'Visualizar', 'Editar']
};

// Configuración de categorías y sus módulos
const categories = [
  {
    nombre: 'Gestión de Usuarios',
    modulos: ['Usuarios', 'Roles']
  },
  {
    nombre: 'Compras',
    modulos: ['Categorías de Productos', 'Productos', 'Proveedores', 'Compras']
  },
  {
    nombre: 'Servicios',
    modulos: ['Categorías de Servicios', 'Servicios', 'Empleados', 'Programación']
  },
  {
    nombre: 'Ventas',
    modulos: ['Clientes', 'Citas', 'Pedidos', 'Venta de Productos', 'Ventas']
  }
];

const PrivilegesTable = ({ value = {}, onChange, disabled = false }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar permisos disponibles desde el backend
  useEffect(() => {
    const loadPermissionsAndPrivileges = async () => {
      try {
        setLoading(true);
        const [permissionsData] = await Promise.all([
          rolesService.getAvailablePermissions()
        ]);

        // Ordenar permisos según el orden de las categorías
        const orderedPermissions = permissionsData.sort((a, b) => {
          const allModules = categories.flatMap(cat => cat.modulos);
          const aIndex = allModules.indexOf(a.nombre);
          const bIndex = allModules.indexOf(b.nombre);
          
          // Si ambos están en el orden, ordenar según el orden
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          // Si solo a está en el orden, a va primero
          if (aIndex !== -1) return -1;
          // Si solo b está en el orden, b va primero
          if (bIndex !== -1) return 1;
          // Si ninguno está en el orden, ordenar alfabéticamente
          return a.nombre.localeCompare(b.nombre);
        });

        setModules(orderedPermissions.map(p => p.nombre));
      } catch (error) {
        console.error('Error al cargar permisos y privilegios:', error);
        // Fallback a valores por defecto si hay error
        setModules([
          "Usuarios",
          "Roles",
          "Categorías de Productos",
          "Productos",
          "Proveedores",
          "Compras",
          "Categorías de Servicios",
          "Servicios",
          "Empleados",
          "Programación",
          "Clientes",
          "Citas",
          "Pedidos",
          "Venta de Productos",
          "Ventas"
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadPermissionsAndPrivileges();
  }, []);

  // Handler para seleccionar todos los permisos (respetando acciones permitidas)
  const handleSelectAll = () => {
    modules.forEach(mod => {
      const allowedActions = moduleActions[mod] || [];
      allowedActions.forEach(action => {
        if (!value[mod]?.[action]) {
          onChange(mod, action, true);
        }
      });
    });
  };

  // Handler para deseleccionar todos los permisos (respetando acciones permitidas)
  const handleDeselectAll = () => {
    modules.forEach(mod => {
      const allowedActions = moduleActions[mod] || [];
      allowedActions.forEach(action => {
        if (value[mod]?.[action]) {
          onChange(mod, action, false);
        }
      });
    });
  };

  // Verificar si todos los privilegios están seleccionados
  const allSelected = modules.length > 0 && modules.every(mod => {
    const allowedActions = moduleActions[mod] || [];
    return allowedActions.length > 0 && allowedActions.every(action => value[mod]?.[action] === true);
  });

  // Calcular total de privilegios disponibles
  const getTotalPrivileges = () => {
    let total = 0;
    modules.forEach(mod => {
      const allowedActions = moduleActions[mod] || [];
      total += allowedActions.length;
    });
    return total;
  };

  // Calcular privilegios seleccionados
  const getSelectedCount = () => {
    let count = 0;
    modules.forEach(mod => {
      const allowedActions = moduleActions[mod] || [];
      allowedActions.forEach(action => {
        if (value[mod]?.[action]) count++;
      });
    });
    return count;
  };

  if (loading) {
    return (
      <div className="py-4">
        <TableSkeleton columns={5} rows={4} hasActions={false} hasAvatar={false} />
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay permisos disponibles</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {!disabled && (
        <div className="sticky top-0 z-20 bg-gray-50 py-2 px-2 flex justify-between items-center mb-4 rounded-lg">
          <button
            type="button"
            onClick={handleDeselectAll}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition flex items-center gap-2 text-xs"
          >
            <i className="bi bi-x-circle mr-1"></i>
            Deseleccionar todos
          </button>
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-4 py-2 rounded-md bg-text-main text-white font-semibold hover:bg-primary-dark transition flex items-center gap-2 text-xs"
          >
            <i className="bi bi-check2-all mr-1"></i>
            Seleccionar todos
          </button>
        </div>
      )}
      
      {/* Contenedor con scroll vertical */}
      <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
        {categories.map((categoria) => {
          // Filtrar módulos que existen en la lista cargada
          const modulosEnCategoria = categoria.modulos.filter(mod => modules.includes(mod));
          
          if (modulosEnCategoria.length === 0) return null;

          return (
            <div key={categoria.nombre} className="border rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-semibold mb-3 text-sm text-gray-700 border-b pb-2">
                {categoria.nombre}
              </h3>
              <div className="space-y-3">
                {modulosEnCategoria.map((modulo) => {
                  const allowedActions = moduleActions[modulo] || [];
                  
                  if (allowedActions.length === 0) return null;

                  return (
                    <div key={modulo} className="pb-3 border-b last:border-b-0 last:pb-0">
                      <h4 className="text-xs font-medium mb-2 text-gray-600">{modulo}</h4>
                      <div className="flex flex-wrap gap-3">
                        {allowedActions.map((accion) => {
                          const isChecked = !!(value[modulo] && value[modulo][accion]);
                          
                          return (
                            <label 
                              key={accion} 
                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={e => {
                                  console.log(`Cambiando privilegio: ${modulo} -> ${accion} = ${e.target.checked}`);
                                  onChange(modulo, accion, e.target.checked);
                                }}
                                disabled={disabled}
                                className="accent-primary-dark w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                              />
                              <span className="text-xs text-gray-700">{accion}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Indicador de privilegios seleccionados */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        {getSelectedCount()} de {getTotalPrivileges()} privilegios seleccionados
      </div>
    </div>
  );
};

export default PrivilegesTable;
