import React, { useState } from "react";
import AddCatServices from './components/AddCatServices';
import EditCatServices from './components/EditCatServices';
import Paginator from "../Paginator";

// --- Componentes Locales ---

// Interruptor de Estado
const StatusToggle = ({ isActive, onToggle }) => (
  <label onClick={(e) => { e.stopPropagation(); onToggle(); }} className="flex items-center cursor-pointer">
    <div className="relative">
      <input type="checkbox" className="sr-only" checked={isActive} readOnly />
      <div className={`block w-11 h-6 rounded-full ${isActive ? 'bg-primary' : 'bg-gray-300'}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isActive ? 'translate-x-full' : ''}`}></div>
    </div>
    <div className="ml-3 text-text-main/80 font-medium">{isActive ? 'Activo' : 'Inactivo'}</div>
  </label>
);

// Tabla de Categorías
const CategoryTable = ({ categories, onToggleStatus, onEdit, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm text-left">
      <thead className="bg-gray-50 text-text-main/80 uppercase">
        <tr>
          <th className="py-3 px-4 font-semibold">Categoría</th>
          <th className="py-3 px-4 font-semibold">Descripción</th>
          <th className="py-3 px-4 font-semibold">Estado</th>
          <th className="py-3 px-4 font-semibold text-right">Acciones</th>
        </tr>
      </thead>
      <tbody className="bg-white text-text-main">
        {categories.map((category) => (
          <tr key={category.id} className="border-b border-gray-200 hover:bg-gray-50">
            <td className="py-3 px-4 font-medium">{category.name}</td>
            <td className="py-3 px-4 text-text-main/80">{category.description}</td>
            <td className="py-3 px-4">
              <StatusToggle 
                isActive={category.isActive} 
                onToggle={() => onToggleStatus(category.id)}
              />
            </td>
            <td className="py-4 px-4 text-sm font-medium text-right">
              <div className="flex justify-end space-x-2">
                <button onClick={() => onEdit(category)} className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50 hover:border-amber-300 rounded-md flex items-center justify-center transition-colors" title="Editar">
                  <i className="bi bi-pencil-square text-amber-500 text-sm"></i>
                </button>
                <button onClick={() => onDelete(category)} className="h-8 w-8 p-0 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-md flex items-center justify-center transition-colors" title="Eliminar">
                  <i className="bi bi-trash text-red-500 text-sm"></i>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// --- Datos de Muestra ---
const initialCategories = [
  { id: 1, name: 'Peluquería', description: 'Servicios relacionados con el corte y cuidado del cabello.', isActive: true },
  { id: 2, name: 'Manicura y Pedicura', description: 'Cuidado de manos y pies, esmaltado y tratamientos.', isActive: true },
  { id: 3, name: 'Tratamientos Faciales', description: 'Limpieza, hidratación y cuidado de la piel del rostro.', isActive: false },
  { id: 4, name: 'Masajes y Bienestar', description: 'Terapias corporales para relajación y bienestar.', isActive: true },
  { id: 5, name: 'Depilación', description: 'Servicios de depilación con cera, láser y otros métodos.', isActive: true },
];

// --- Componente Principal ---
const CatServices = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const toggleCategoryStatus = (id) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, isActive: !cat.isActive } : cat
      )
    );
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 3;
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-text-main">Categorías de Servicios</h1>
            <p className="text-text-main/60 mt-1">Administra las categorías para los servicios de tu tienda.</p>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-full max-w-sm">
                <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-text-main/50"></i>
                <input
                  type="text"
                  placeholder="Buscar categoría..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="border border-gray-300 pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
                />
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors"
              >
                <i className="bi bi-plus-lg text-lg"></i>
                Nueva Categoría
              </button>
            </div>

            <CategoryTable
              categories={paginatedCategories} 
              onToggleStatus={toggleCategoryStatus}
              onEdit={() => setIsEditModalOpen(true)}
              onDelete={(category) => alert(`Eliminar ${category.name}`)}
            />

            {totalPages > 1 && (
              <>
                <Paginator 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={handlePageChange} 
                />
                <div className="text-center mt-4">
                  <p className="text-sm text-text-main/70">
                    Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredCategories.length)} de {filteredCategories.length} categorías
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Modales */}
      {isAddModalOpen && <AddCatServices onClose={() => setIsAddModalOpen(false)} />}
      {isEditModalOpen && <EditCatServices onClose={() => setIsEditModalOpen(false)} />}
    </div>
  );
};

export default CatServices;