const LoadingTable = () => {
  // Skeleton rows for table loading
  const skeletonRows = Array.from({ length: 5 }, (_, index) => (
    <tr key={index}>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-8"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-14"></div>
      </td>
      <td className="py-4 px-4">
        <div className="flex justify-center space-x-2">
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>
      </td>
    </tr>
  ));

  return (
    <table className="min-w-full text-xs">
      <thead className="bg-gray-50">
        <tr>
          <th className="py-2 px-3 text-left font-semibold text-gray-700">ID</th>
          <th className="py-2 px-3 text-left font-semibold text-gray-700">Nombre</th>
          <th className="py-2 px-3 text-left font-semibold text-gray-700">Categoría</th>
          <th className="py-2 px-3 text-left font-semibold text-gray-700">Precio</th>
          <th className="py-2 px-3 text-left font-semibold text-gray-700">Stock</th>
          <th className="py-2 px-3 text-left font-semibold text-gray-700">Estado</th>
          <th className="py-2 px-3 text-center font-semibold text-gray-700">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {skeletonRows}
      </tbody>
    </table>
  );
};

LoadingTable.propTypes = {};

export default LoadingTable;