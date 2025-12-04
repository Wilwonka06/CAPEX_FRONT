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
const PrivilegesTable = ({ value = {}, onChange, disabled = false }) => {
  const [modules, setModules] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar permisos y privilegios disponibles desde el backend
  useEffect(() => {
    const loadPermissionsAndPrivileges = async () => {
      try {
        setLoading(true);
        const [permissionsData, privilegesData] = await Promise.all([
          rolesService.getAvailablePermissions(),
          rolesService.getAvailablePrivileges()
        ]);

        // Ordenar permisos de forma lógica: solo sub-procesos (módulos individuales)
        // Los procesos principales y Dashboard ya están filtrados en el backend
        const orderedPermissions = permissionsData.sort((a, b) => {
          const order = [
            // Submódulos de Compras
            'Categorías de Productos',
            'Productos',
            'Proveedores',
            'Compras',
            // Submódulos de Servicios
            'Categorías de Servicios',
            'Servicios',
            'Empleados',
            'Programación',
            // Submódulos de Ventas
            'Clientes',
            'Citas',
            'Pedidos'
          ];
          
          const aIndex = order.indexOf(a.nombre);
          const bIndex = order.indexOf(b.nombre);
          
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
        setActions(privilegesData.map(p => p.nombre));
      } catch (error) {
        console.error('Error al cargar permisos y privilegios:', error);
        // Fallback a valores por defecto si hay error (solo sub-procesos)
        setModules([
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
          "Pedidos"
        ]);
        setActions(["Crear", "Visualizar", "Editar", "Eliminar"]);
      } finally {
        setLoading(false);
      }
    };

    loadPermissionsAndPrivileges();
  }, []);
  // Handler para seleccionar todos los permisos
  const handleSelectAll = () => {
    modules.forEach(mod => {
      actions.forEach(action => {
        // ✅ CORREGIDO: Verificar correctamente si el privilegio NO está activo
        if (!value[mod]?.[action]) {
          onChange(mod, action, true);
        }
      });
    });
  };

  // Handler para deseleccionar todos los permisos
  const handleDeselectAll = () => {
    modules.forEach(mod => {
      actions.forEach(action => {
        if (value[mod]?.[action]) {
          onChange(mod, action, false);
        }
      });
    });
  };

  // Verificar si todos los privilegios están seleccionados
  const allSelected = modules.length > 0 && actions.length > 0 && modules.every(mod => 
    actions.every(action => value[mod]?.[action] === true)
  );

  if (loading) {
    return (
      <div className="py-4">
        <TableSkeleton columns={5} rows={4} hasActions={false} hasAvatar={false} />
      </div>
    );
  }

  if (modules.length === 0 || actions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay permisos o privilegios disponibles</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      {!disabled && (
        <div className="sticky top-0 z-20 bg-gray-50 py-2 px-2 flex justify-between items-center">
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
      <table className="min-w-full rounded-lg border border-gray-200 shadow-sm text-xs">
        <thead>
          <tr className="bg-gray-50 hover:bg-gray-100">
            <th className="py-2 px-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Acción / Módulo
            </th>
            {modules.map((mod) => (
              <th key={mod} className="py-2 px-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                {mod}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {actions.map((action, rowIdx) => (
            <tr key={action} className={rowIdx % 2 === 1 ? "bg-gray-50" : ""}>
              <td className="py-2 px-3 font-medium text-gray-900 whitespace-nowrap">
                {action}
              </td>
              {modules.map((mod) => {
                const isChecked = !!(value[mod] && value[mod][action]);
                
                return (
                  <td key={mod} className="py-2 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={e => {
                        console.log(`Cambiando privilegio: ${mod} -> ${action} = ${e.target.checked}`);
                        onChange(mod, action, e.target.checked);
                      }}
                      disabled={disabled}
                      className="accent-primary-dark w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Indicador de privilegios seleccionados */}
      <div className="mt-2 text-xs text-gray-500">
        {(() => {
          let count = 0;
          modules.forEach(mod => {
            actions.forEach(action => {
              if (value[mod]?.[action]) count++;
            });
          });
          return `${count} de ${modules.length * actions.length} privilegios seleccionados`;
        })()}
      </div>
    </div>
  );
};

export default PrivilegesTable;