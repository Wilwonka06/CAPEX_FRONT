/**
 * Componente de Skeleton completo para Tablas
 * Incluye header y filas de skeleton
 * Se usa cuando la tabla completa necesita mostrar skeleton (componentes de tabla internos)
 */

const TableSkeleton = ({ columns = 5, rows = 5, hasAvatar = false, hasActions = true }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow animate-pulse">
      <table className="min-w-full text-xs">
        <thead className="bg-gray-50">
          <tr>
            {hasAvatar && (
              <th className="py-2 px-3 text-left font-semibold text-gray-700">
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </th>
            )}
            {[...Array(columns)].map((_, i) => (
              <th key={i} className="py-2 px-3 text-left font-semibold text-gray-700">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </th>
            ))}
            {hasActions && (
              <th className="py-2 px-3 text-center font-semibold text-gray-700">
                <div className="h-4 bg-gray-300 rounded w-16 mx-auto"></div>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {hasAvatar && (
                <td className="py-3 px-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                </td>
              )}
              {[...Array(columns)].map((_, colIndex) => (
                <td key={colIndex} className="py-3 px-3">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
              ))}
              {hasActions && (
                <td className="py-3 px-3 text-center">
                  <div className="flex justify-center gap-2">
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;

