import React from 'react';

const TableHeader = () => {
  return (
    <thead>
      <tr className="bg-gray-50 hover:bg-gray-100">
        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
          NOMBRE
        </th>
        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
          DESCRIPCIÓN
        </th>
        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
          ESTADO
        </th>
        <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
          ACCIONES
        </th>
      </tr>
    </thead>
  );
};

export default TableHeader;
