import React from "react";
import ChangeStatus from "./ChangeStatus";

const CategoryTable = ({ categories }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-amber-100">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {categories.map((category) => (
            <tr key={category.id} className="hover:bg-gray-50">
              <td className="py-4 px-4 text-sm font-medium text-gray-900">{category.name}</td>
              <td className="py-4 px-4 text-sm text-gray-500">{category.description}</td>
              <td className="py-4 px-4 text-sm">
                <div className="flex items-center">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 ${category.status === 'active' ? 'bg-amber-700' : 'bg-red-800'}`}>
                    <span className="text-white text-xs font-bold">
                      {category.status === 'active' ? 'A' : 'I'}
                    </span>
                  </span>
                  <div className={`relative inline-block w-10 h-5 rounded-full transition-colors ${category.status === 'active' ? 'bg-amber-500' : 'bg-gray-300'}`}>
                    <div className={`absolute left-0 top-0 w-5 h-5 rounded-full bg-white shadow transform transition-transform ${category.status === 'active' ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 text-sm font-medium">
                <div className="flex space-x-2">
                  <button className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-500 hover:bg-blue-200 rounded border border-blue-300" title="Ver detalles">
                    <i className="bi bi-eye"></i>
                  </button>
                  <button className="w-6 h-6 flex items-center justify-center bg-yellow-100 text-yellow-500 hover:bg-yellow-200 rounded border border-yellow-300" title="Editar">
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-500 hover:bg-red-200 rounded border border-red-300" title="Eliminar">
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;