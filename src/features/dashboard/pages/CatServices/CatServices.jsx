import { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddCatServices from './components/AddCatServices';
import EditCatServices from './components/EditCatServices';
import Paginator from "../../../../shared/Paginator";
import SearchProduct from '../../../../shared/Search';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';
import CategoryDetail from './components/CategoryDetail';
import PropTypes from "prop-types";
import { useServiceCategories, ServiceCategoriesProvider } from '../services/hooks/useServiceCategories';

// --- Tabla de Categorías (diseño igual a productos) ---
const CategoryTable = ({ categories, onToggleStatus, onEdit, onDelete, onView }) => (
  <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white font-inter">
    <table className="min-w-full">
      <thead>
        <tr className="bg-gray-50 hover:bg-gray-100">
          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">CATEGORÍA</th>
          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">DESCRIPCIÓN</th>
          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ESTADO</th>
          <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">ACCIONES</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {categories.map((category) => (
          <tr key={category.id} className="hover:bg-gray-50 transition-colors duration-150">
            <td className="py-4 px-4 text-xs font-medium text-gray-900">{category.id}</td>
            <td className="py-4 px-4 text-xs font-medium text-gray-900 max-w-[180px] truncate">{category.Categoria}</td>
            <td className="py-4 px-4 text-xs text-gray-600 max-w-[250px] truncate">{category.Descripcion}</td>
            <td className="py-4 px-4 text-xs">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onToggleStatus(category.id)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none  ${
                    category.estado === 'Activo' ? 'bg-text-main' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      category.estado === 'Activo' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    category.estado === 'Activo'
                      ? ' text-gray-800'
                      : ' text-gray-600 '
                  }`}
                >
                  {category.estado === 'Activo' ? "Activo" : "Inactivo"}
                </span>
              </div>
            </td>
            <td className="py-4 px-4 text-sm font-medium text-right">
              <div className="flex justify-end space-x-2">
                <button 
                  className="h-8 w-8 p-0 flex items-center justify-center"
                  onClick={() => onView(category)}
                  title="Ver detalles"
                >
                  <i className="bi bi-eye text-primary text-lg"></i>
                </button>
                <button 
                  className="h-8 w-8 p-0 flex items-center justify-center"
                  onClick={() => onEdit(category)}
                  title="Editar"
                >
                  <i className="bi bi-pencil-square text-amber-500 text-lg"></i>
                </button>
                <button 
                  className="h-8 w-8 p-0 flex items-center justify-center"
                  onClick={() => onDelete(category.id)}
                  title="Eliminar"
                >
                  <i className="bi bi-trash text-red-500 text-lg"></i>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

CategoryTable.propTypes = {
  categories: PropTypes.array.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
};

const CatServicesContent = () => {
  const { setTitle } = useOutletContext();
  const { categories, addCategory, editCategory, deleteCategory, toggleCategoryStatus } = useServiceCategories();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    setTitle('Gestión de Categorías de Servicios');
    return () => setTitle('');
  }, [setTitle]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categories]);

  const filteredCategories = categories.filter(
    (cat) =>
      (cat.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.isActive ? 'activo' : 'inactivo').includes(searchTerm.toLowerCase())
  );

  // Paginación
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  // CRUD usando contexto
  const handleAddCategory = (newCategory) => {
    addCategory(newCategory);
    toast.success('Categoría agregada exitosamente', { position: 'top-right' });
  };

  const handleEditCategory = (editedCategory) => {
    editCategory(editedCategory);
    setShowEditModal(false);
        setSelectedCategory(null);
    toast.success('Categoría editada exitosamente', { position: 'top-right' });
  };

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar la categoría "${category?.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
      if (result.isConfirmed) {
      deleteCategory(categoryId);
      toast.success('Categoría eliminada exitosamente', { position: 'top-right' });
    }
  };

  const handleToggleStatus = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    const newStatus = category.isActive ? 'Inactivo' : 'Activo';
    const result = await Swal.fire({
      title: '¿Confirmar cambio de estado?',
      text: `¿Estás seguro de que deseas cambiar el estado de "${category?.name}" a ${newStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      toggleCategoryStatus(categoryId);
      toast.success(`Estado cambiado a ${newStatus}`, { position: 'top-right' });
    }
  };

  const handleViewDetail = (category) => {
    setSelectedCategory(category);
    setShowDetailModal(true);
  };

  // Adaptar los datos para la tabla (name -> Categoria, description -> Descripcion, isActive -> estado)
  const tableCategories = paginatedCategories.map(cat => ({
    id: cat.id,
    Categoria: cat.name,
    Descripcion: cat.description,
    estado: cat.isActive ? 'Activo' : 'Inactivo',
  }));

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* Barra de búsqueda y botón de crear */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchProduct searchTerm={searchTerm} handleSearch={e => setSearchTerm(e.target.value)} placeholder="Buscar categorías..." />
              <button
                className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center"
                onClick={() => setShowAddModal(true)}
              >
                <i className="bi bi-plus-circle mr-2"></i>
                Nueva Categoría
              </button>
            </div>
            {/* Tabla de categorías */}
            <CategoryTable
              categories={tableCategories}
              onToggleStatus={handleToggleStatus}
              onEdit={cat => handleEditClick(cat)}
              onDelete={cat => handleDeleteCategory(cat.id)}
              onView={cat => handleViewDetail(cat)}
            />
            {/* Paginación */}
            {totalPages > 1 && (
                  <Paginator
                    currentPage={currentPage}
                    totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </div>
      {/* Modales */}
      {showAddModal && (
        <AddCatServices
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddCategory}
          existingCategories={categories}
        />
      )}
      {showEditModal && selectedCategory && (
        <EditCatServices
          onClose={() => setShowEditModal(false)}
          category={selectedCategory}
          onEdit={handleEditCategory}
          existingCategories={categories}
        />
      )}
      {showDetailModal && selectedCategory && (
        <CategoryDetail
          onClose={() => setShowDetailModal(false)}
          category={selectedCategory}
          isOpen={showDetailModal}
        />
      )}
      <ToastContainer />
    </div>
  );
};

const CatServices = () => (
  <ServiceCategoriesProvider>
    <CatServicesContent />
  </ServiceCategoriesProvider>
);

export default CatServices;