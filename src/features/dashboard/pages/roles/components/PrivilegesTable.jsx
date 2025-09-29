import React from "react";

// Módulos que coinciden con el backend
const MODULES = [
  "Compras",
  "Servicios", 
  "Venta",
  "Configuración",
  "Usuarios"
];

// Acciones que coinciden con el backend
const ACTIONS = ["Create", "Read", "Edit", "Delete"];

/**
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
        if (!value[mod] || !value[mod][action]) {
          onChange(mod, action, true);
        }
      });
    });
  };

  return (
    <div className="overflow-x-auto w-full">
      {!disabled && (
        <div className="flex justify-end mb-2">
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
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">&nbsp;</th>
            {MODULES.map((mod) => (
              <th key={mod} className="py-3 px-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">{mod}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ACTIONS.map((action, rowIdx) => (
            <tr key={action} className={rowIdx % 2 === 1 ? "bg-gray-50" : ""}>
              <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{action}</td>
              {MODULES.map((mod) => (
                <td key={mod} className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={!!(value[mod] && value[mod][action])}
                    onChange={e => onChange(mod, action, e.target.checked)}
                    disabled={disabled}
                    className="accent-primary-dark w-4 h-4"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PrivilegesTable; 