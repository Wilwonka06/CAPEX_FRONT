import { useState } from "react";
import AddCatServices from './components/AddCatServices';
import EditCatServices from './components/EditCatServices';
import Paginator from "../../../../shared/Paginator";
import SearchProduct from '../../../../shared/Search';

// --- Componentes Locales ---

// Interruptor de Estado
const StatusToggle = ({ isActive, onToggle }) => (
  <label onClick={(e) => { e.stopPropagation(); }} className="flex items-center cursor-pointer">
    <div className="relative">
      <input type="checkbox" className="sr-only" checked={isActive} onChange={onToggle} />
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

// Función para normalizar texto (remover tildes)
const normalizeText = (text) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

// --- Componente Principal ---
const CatServices = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

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

  const handleAddCategory = (newCategory) => {
    setCategories([
      ...categories,
      { ...newCategory, id: Date.now(), isActive: newCategory.estado === 'Activo' }
    ]);
    setIsAddModalOpen(false);
  };

  const handleEditCategory = (editedCategory) => {
    setCategories(
      categories.map((cat) =>
        cat.id === editedCategory.id ? { ...editedCategory, isActive: editedCategory.estado === 'Activo' } : cat
      )
    );
    setIsEditModalOpen(false);
    setSelectedCategory(null);
  };

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDeleteCategory = (category) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la categoría "${category.name}"?`)) {
      setCategories(categories.filter((cat) => cat.id !== category.id));
    }
  };

  const filteredCategories = categories.filter(
    (cat) =>
      normalizeText(cat.name).includes(normalizeText(searchTerm)) ||
      normalizeText(cat.description).includes(normalizeText(searchTerm)) ||
      (cat.isActive ? 'Activo' : 'Inactivo').includes(searchTerm)
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
                <SearchProduct searchTerm={searchTerm} handleSearch={handleSearch} placeholder="Buscar categoría..." />
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
              onEdit={handleEditClick}
              onDelete={handleDeleteCategory}
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
      {isAddModalOpen && <AddCatServices onClose={() => setIsAddModalOpen(false)} onAdd={handleAddCategory} />}
      {isEditModalOpen && selectedCategory && <EditCatServices onClose={() => { setIsEditModalOpen(false); setSelectedCategory(null); }} category={selectedCategory} onEdit={handleEditCategory} />}
    </div>
  );
};

export default CatServices;
export { initialCategories };