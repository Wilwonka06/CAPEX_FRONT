const TableHeader = () => {
  return (
    <thead>
      <tr className="bg-gray-50 hover:bg-gray-100">
        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">
          Nombre
        </th>
        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">
          Descripción
        </th>
        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">
          Estado
        </th>
        <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 tracking-wider">
          Acciones
        </th>
      </tr>
    </thead>
  );
};

export default TableHeader;
