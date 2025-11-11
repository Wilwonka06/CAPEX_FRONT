/**
 * Componente de Skeleton solo para el contenido de tablas
 * No incluye header ni barra de búsqueda
 */

const TableContentSkeleton = ({ columns = 5, rows = 5, showActions = true }) => {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white animate-pulse">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            {[...Array(columns)].map((_, i) => (
              <th key={i} className="py-3 px-4 text-left">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </th>
            ))}
            {showActions && (
              <th className="py-3 px-4 text-right">
                <div className="h-4 bg-gray-300 rounded w-16 ml-auto"></div>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {[...Array(columns)].map((_, colIndex) => (
                <td key={colIndex} className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
              ))}
              {showActions && (
                <td className="py-4 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
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

export default TableContentSkeleton;

