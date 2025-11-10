import PropTypes from 'prop-types';

const TableSkeleton = ({ columns = 7, rows = 5, hasAvatar = false, hasActions = true }) => {
  // Anchos predefinidos más realistas para las columnas
  const widths = [80, 100, 90, 70, 85, 75, 95];
  
  const skeletonRows = Array.from({ length: rows }, (_, index) => (
    <tr key={index}>
      {hasAvatar && (
        <td className="py-4 px-4">
          <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
        </td>
      )}
      {Array.from({ length: columns }, (_, colIndex) => {
        const width = widths[colIndex % widths.length] || 80;
        return (
          <td key={colIndex} className="py-4 px-4">
            <div 
              className="h-4 bg-gray-200 rounded animate-pulse" 
              style={{ width: `${width}%`, maxWidth: '100%' }}
            ></div>
          </td>
        );
      })}
      {hasActions && (
        <td className="py-4 px-4">
          <div className="flex justify-center space-x-2">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </td>
      )}
    </tr>
  ));

  return (
    <table className="min-w-full text-xs">
      <thead className="bg-gray-50">
        <tr>
          {hasAvatar && (
            <th className="py-2 px-3 text-left font-semibold text-gray-700">
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </th>
          )}
          {Array.from({ length: columns }, (_, index) => (
            <th key={index} className="py-2 px-3 text-left font-semibold text-gray-700">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
            </th>
          ))}
          {hasActions && (
            <th className="py-2 px-3 text-center font-semibold text-gray-700">
              <div className="h-4 bg-gray-300 rounded w-20 mx-auto"></div>
            </th>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {skeletonRows}
      </tbody>
    </table>
  );
};

TableSkeleton.propTypes = {
  columns: PropTypes.number,
  rows: PropTypes.number,
  hasAvatar: PropTypes.bool,
  hasActions: PropTypes.bool,
};

export default TableSkeleton;

