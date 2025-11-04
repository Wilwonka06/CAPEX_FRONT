// ✅ CORREGIDO: Nombres de módulos y acciones consistentes con el backend
const MODULES = [
  "Gestión de Compras",
  "Gestión de Servicios", 
  "Ventas",                // ⚠️ CAMBIO: Era "Gestión de Ventas"
  "Gestión de Usuarios",
  "Dashboard"
];

// ✅ CORREGIDO: Acciones en español
const ACTIONS = ["Crear", "Visualizar", "Editar", "Eliminar"];

/**
 * Componente para gestionar privilegios de roles
 * 
 * props:
 *  value: { [modulo]: { [accion]: boolean } }
 *  onChange: (modulo, accion, checked) => void
 *  disabled: boolean (opcional)
 */
const PrivilegesTable = ({ value = {}, onChange, disabled = false }) => {
  // Handler para seleccionar todos los permisos
  const handleSelectAll = () => {
    MODULES.forEach(mod => {
      ACTIONS.forEach(action => {
        // ✅ CORREGIDO: Verificar correctamente si el privilegio NO está activo
        if (!value[mod]?.[action]) {
          onChange(mod, action, true);
        }
      });
    });
  };

  // Handler para deseleccionar todos los permisos
  const handleDeselectAll = () => {
    MODULES.forEach(mod => {
      ACTIONS.forEach(action => {
        if (value[mod]?.[action]) {
          onChange(mod, action, false);
        }
      });
    });
  };

  // Verificar si todos los privilegios están seleccionados
  const allSelected = MODULES.every(mod => 
    ACTIONS.every(action => value[mod]?.[action] === true)
  );

  return (
    <div className="overflow-x-auto w-full">
      {!disabled && (
        <div className="flex justify-end gap-2 mb-2">
          <button
            type="button"
            onClick={handleDeselectAll}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition flex items-center gap-2"
          >
            <i className="bi bi-x-circle mr-1"></i>
            Deseleccionar todos
          </button>
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-4 py-2 rounded-md bg-text-main text-white font-semibold hover:bg-primary-dark transition flex items-center gap-2"
          >
            <i className="bi bi-check2-all mr-1"></i>
            Seleccionar todos
          </button>
        </div>
      )}
      <table className="min-w-full rounded-lg border border-gray-200 shadow-sm text-sm">
        <thead>
          <tr className="bg-gray-50 hover:bg-gray-100">
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Acción / Módulo
            </th>
            {MODULES.map((mod) => (
              <th key={mod} className="py-3 px-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                {mod}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ACTIONS.map((action, rowIdx) => (
            <tr key={action} className={rowIdx % 2 === 1 ? "bg-gray-50" : ""}>
              <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">
                {action}
              </td>
              {MODULES.map((mod) => {
                const isChecked = !!(value[mod] && value[mod][action]);
                
                return (
                  <td key={mod} className="py-3 px-4 text-center">
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
          MODULES.forEach(mod => {
            ACTIONS.forEach(action => {
              if (value[mod]?.[action]) count++;
            });
          });
          return `${count} de ${MODULES.length * ACTIONS.length} privilegios seleccionados`;
        })()}
      </div>
    </div>
  );
};

export default PrivilegesTable;