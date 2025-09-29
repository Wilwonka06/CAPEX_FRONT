import { useState } from "react";

const CategoryDetail = ({ category, isOpen, onClose }) => {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-[#9C5B2B] m-0">Detalles de Categoría</h2>
          <button
            className="text-gray-400 hover:text-primary text-xl font-bold"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {/* Contenido con scroll */}
        <div className="overflow-y-auto p-8 flex-1">
          <div className="flex flex-col gap-6">
            <div className="text-lg font-bold text-gray-800 text-center mb-2">{category.nombre || category.name}</div>
            <div>
              <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Descripción</span>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm min-h-[60px]">
                {category.descripcion || category.description || 'Sin descripción'}
              </div>
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Estado</span>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm min-h-[60px]">
                {category.estado === 'activo' ? 'Categoría activa' : 'Categoría inactiva'}
              </div>
            </div>
          </div>
        </div>
        {/* Footer fijo */}
        <div className="sticky bottom-0 z-10 bg-white  rounded-b-lg flex justify-end px-8 py-4">
          <button
            className="px-4 py-2 rounded-md bg-text-main text-white text-sm font-semibold hover:bg-primary-dark transition"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetail; 