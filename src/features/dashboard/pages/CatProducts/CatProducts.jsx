import { useState, useEffect } from "react";
import CategoryTable from "./components/CategoryTable";
import SearchProduct from '../../../../shared/Search';
import Paginator from '../../../../shared/Paginator';
import CreateCategory from "./components/CreateCategory";
import LoadingTable from '../../../../shared/components/LoadingTable';
import categoriesService from './API/categoriesService';
import EditCategory from "./components/EditCategory";
import CategoryDetail from "./components/CategoryDetail";
import ChangeStatus from "./components/ChangeStatus";
import ConfirmStatusChangeModal from '../../../../shared/components/ConfirmStatusChangeModal';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';

const CATEGORIES_PER_PAGE = 10;

const CatProductsPage = () => {
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Cargar categorías al montar
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
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
    const categoryPromise = (async () => {
      const response = await categoriesService.create(newCategory);
      if (response.success) {
        await loadCategories(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message || 'Error al crear la categoría');
      }
    })();

    toast.promise(categoryPromise, {
      loading: 'Creando categoría...',
      success: 'Categoría creada exitosamente',
      error: (err) => {
        console.error('Error creating category:', err);
        return err.response?.data?.message || err.message || 'Error al crear la categoría';
      },
    });

    try {
      await categoryPromise;
    } catch (error) {
      // Error ya manejado por toast.promise
    }
  };

  const handleEditCategory = async (updatedCategory) => {
    const categoryPromise = (async () => {
      const response = await categoriesService.update(updatedCategory.id_categoria_producto, updatedCategory);
      if (response.success) {
        setShowEditModal(false);
        setSelectedCategory(null);
        await loadCategories(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message || 'Error al actualizar la categoría');
      }
    })();

    toast.promise(categoryPromise, {
      loading: 'Actualizando categoría...',
      success: 'Categoría actualizada exitosamente',
      error: (err) => {
        console.error('Error updating category:', err);
        return err.response?.data?.message || err.message || 'Error al actualizar la categoría';
      },
    });

    try {
      await categoryPromise;
    } catch (error) {
      // Error ya manejado por toast.promise
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
      const categoryPromise = (async () => {
        const response = await categoriesService.delete(categoryId);
        if (response.success) {
          await loadCategories(); // Recargar lista
          return response.data;
        } else {
          throw new Error(response.message || 'Error al eliminar la categoría');
        }
      })();

      toast.promise(categoryPromise, {
        loading: 'Eliminando categoría...',
        success: 'Categoría eliminada exitosamente',
        error: (err) => {
          console.error('Error deleting category:', err);
          return err.response?.data?.message || err.message || 'Error al eliminar la categoría';
        },
      });

      try {
        await categoryPromise;
      } catch (error) {
        // Error ya manejado por toast.promise
      }
    }
  };

  // Handler para cambiar estado - muestra modal primero
  const handleToggleStatus = (categoryId) => {
    const category = categories.find(c => c.id_categoria_producto === categoryId);
    if (!category) {
      toast.error("Categoría no encontrada");
      return;
    }
    setPendingStatusChange({ categoryId, category });
    setShowStatusModal(true);
  };

  // Handler para confirmar cambio de estado
  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    const { categoryId, category } = pendingStatusChange;
    const newStatus = category.estado === 'activo' ? 'inactivo' : 'activo';
    const newStatusText = newStatus === 'activo' ? 'Activo' : 'Inactivo';

    const categoryPromise = (async () => {
      const response = await categoriesService.changeStatus(categoryId, newStatus);
      if (response.success) {
        await loadCategories(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message || 'Error al cambiar el estado');
      }
    })();

    toast.promise(categoryPromise, {
      loading: 'Cambiando estado...',
      success: `Estado cambiado a ${newStatusText}`,
      error: (err) => {
        console.error('Error changing category status:', err);
        return err.response?.data?.message || err.message || 'Error al cambiar el estado';
      },
    });

    try {
      await categoryPromise;
      setShowStatusModal(false);
      setPendingStatusChange(null);
    } catch (error) {
      // Error ya manejado por toast.promise
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
    setTitle('Módulo de Categorías de Productos');
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
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
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
                loading={loading}
              />
            </div>

            {/* Paginación */}
            {totalPages > 1 && !loading && (
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
      {/* Modal de confirmación de cambio de estado */}
      {showStatusModal && pendingStatusChange && (
        <ConfirmStatusChangeModal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setPendingStatusChange(null);
          }}
          onConfirm={handleConfirmStatusChange}
          isActivating={pendingStatusChange.category.estado === 'inactivo'}
          itemName={pendingStatusChange.category.nombre || pendingStatusChange.category.name}
          loading={false}
        />
      )}
    </div>
  );
};

export default CatProductsPage;
