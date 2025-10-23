import { useState, useEffect } from "react";
import CategoryTable from "./components/CategoryTable";
import SearchProduct from '../../../../shared/Search';
import Paginator from '../../../../shared/Paginator';
import CreateCategory from "./components/CreateCategory";
import categoriesService from './API/categoriesService';
import EditCategory from "./components/EditCategory";
import CategoryDetail from "./components/CategoryDetail";
import ChangeStatus from "./components/ChangeStatus";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';

const CATEGORIES_PER_PAGE = 5;

const CatProductsPage = () => {
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Cargar categorías al montar
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesService.getAll();
      if (response.success) {
        setCategories(response.data || []);
      } else {
        console.error('API returned error:', response.message);
        setCategories([]);
      }
    } catch (err) {
      console.error('Error loading categories from API:', err);
      setCategories([]);
    }
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { setTitle } = useOutletContext();


  // Sincronizar filteredCategories con categories
  useEffect(() => {
    setFilteredCategories(categories);
  }, [categories]);

  // Filtrar categorías por término de búsqueda - BUSQUEDA COMPLETA COMO EN SUPPLIERS
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCategories(categories);
      return;
    }
    const lowerTerm = searchTerm.toLowerCase();
    setFilteredCategories(
      categories.filter(category =>
        (category.id_categoria_producto?.toString() || '').toLowerCase().includes(lowerTerm) ||
        (category.nombre || '').toLowerCase().includes(lowerTerm) ||
        (category.descripcion || '').toLowerCase().includes(lowerTerm) ||
        (category.estado === 'activo' ? "activo" : "inactivo").includes(lowerTerm)
      )
    );
  }, [searchTerm, categories]);

  // Paginación
  const totalPages = Math.ceil(filteredCategories.length / CATEGORIES_PER_PAGE);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * CATEGORIES_PER_PAGE,
    currentPage * CATEGORIES_PER_PAGE
  );

  // Resetear página al cambiar el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categories]);

  // Acciones CRUD
  const handleCreateCategory = async (newCategory) => {
    try {
      const response = await categoriesService.create(newCategory);
      if (response.success) {
        toast.success('Categoría creada exitosamente', { position: 'top-right' });
        await loadCategories(); // Recargar lista
      } else {
        throw new Error(response.message || 'Error al crear la categoría');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error.message || 'Error al crear la categoría', { position: 'top-right' });
    }
  };

  const handleEditCategory = async (updatedCategory) => {
    const result = await Swal.fire({
      title: '¿Confirmar edición?',
      text: `¿Estás seguro de que deseas editar la categoría "${updatedCategory.nombre || updatedCategory.name}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await categoriesService.update(updatedCategory.id_categoria_producto, updatedCategory);
        if (response.success) {
          setShowEditModal(false);
          setSelectedCategory(null);
          toast.success('Categoría actualizada exitosamente', { position: 'top-right' });
          await loadCategories(); // Recargar lista
        } else {
          throw new Error(response.message || 'Error al actualizar la categoría');
        }
      } catch (error) {
        console.error('Error updating category:', error);
        toast.error(error.message || 'Error al actualizar la categoría', { position: 'top-right' });
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const category = categories.find(c => c.id_categoria_producto === categoryId);
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar la categoría "${category?.nombre || category?.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await categoriesService.delete(categoryId);
        if (response.success) {
          toast.success('Categoría eliminada exitosamente', { position: 'top-right' });
          await loadCategories(); // Recargar lista
        } else {
          throw new Error(response.message || 'Error al eliminar la categoría');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error(error.message || 'Error al eliminar la categoría', { position: 'top-right' });
      }
    }
  };

  const handleToggleStatus = async (categoryId) => {
    const category = categories.find(c => c.id_categoria_producto === categoryId);
    const newStatus = category.estado === 'activo' ? 'inactivo' : 'activo';
    const newStatusText = newStatus === 'activo' ? 'Activo' : 'Inactivo';

    const result = await Swal.fire({
      title: '¿Confirmar cambio de estado?',
      text: `¿Estás seguro de que deseas cambiar el estado de "${category?.nombre || category?.name}" a ${newStatusText}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await categoriesService.changeStatus(categoryId, newStatus);
        if (response.success) {
          toast.success(`Estado cambiado a ${newStatusText}`, { position: 'top-right' });
          await loadCategories(); // Recargar lista
        } else {
          throw new Error(response.message || 'Error al cambiar el estado');
        }
      } catch (error) {
        console.error('Error changing category status:', error);
        toast.error(error.message || 'Error al cambiar el estado', { position: 'top-right' });
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const closeModals = () => {
    setShowEditModal(false);
    setShowDetailModal(false);
    setShowStatusModal(false);
    setSelectedCategory(null);
  };

  useEffect(() => {
    setTitle('Gestión de Categorías de Productos');
    return () => setTitle('');
  }, [setTitle]);

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Header con gradiente */}
          {/* El título ahora se muestra en el navbar */}
          
          <div className="p-6">
            {/* Barra de búsqueda y botón de crear */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchProduct searchTerm={searchTerm} handleSearch={handleSearch} placeholder="Buscar categorías..." />
              <CreateCategory onCreate={handleCreateCategory} categories={categories} />
            </div>

            {/* Tabla de categorías */}
            <CategoryTable 
              categories={paginatedCategories} 
              onToggleStatus={handleToggleStatus}
              onEdit={(category) => {
                setSelectedCategory(category);
                setShowEditModal(true);
              }}
              onDelete={handleDeleteCategory}
              onView={(category) => {
                setSelectedCategory(category);
                setShowDetailModal(true);
              }}
            />

            {/* Paginación */}
            {totalPages > 1 && (
              <Paginator 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      {showEditModal && selectedCategory && (
        <EditCategory
          category={selectedCategory}
          isOpen={showEditModal}
          onClose={closeModals}
          onSave={handleEditCategory}
          categories={categories}
        />
      )}
      {showDetailModal && selectedCategory && (
        <CategoryDetail
          category={selectedCategory}
          isOpen={showDetailModal}
          onClose={closeModals}
        />
      )}
      {showStatusModal && selectedCategory && (
        <ChangeStatus
          category={selectedCategory}
          isOpen={showStatusModal}
          onClose={closeModals}
          onStatusChange={handleToggleStatus}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default CatProductsPage;
