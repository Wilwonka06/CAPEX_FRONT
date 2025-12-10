import { useState, useEffect } from "react";
import serviceCategoriesService from "./API/serviceCategoriesService";
import CreateCatServices from "./components/CreateCatServices";
import EditCatServices from "./components/EditCatServices";
import CategoryDetail from "./components/CategoryDetail";
import CategoriesTable from "./components/CategoriesTable";
import SearchProduct from '../../../../shared/Search';
import ConfirmStatusChangeModal from '../../../../shared/components/ConfirmStatusChangeModal';
import ConfirmDeleteModal from '../../../../shared/components/ConfirmDeleteModal';
import { filterBySearch } from '../../../../shared/utils/searchHelper';
import toast from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';
import Paginator from '../../../../shared/Paginator';

const CatServices = () => {
  const { setTitle } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  // Estados para modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    setTitle("Módulo de Servicios");
    return () => setTitle("");
  }, [setTitle]);

  const loadCategories = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("[CatServices] Cargando categorías...");
      const data = await serviceCategoriesService.getAll();
      console.log("[CatServices] Categorías cargadas:", data);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[CatServices] Error cargando categorías:", err);
      setError("No se pudieron cargar las categorías.");
      toast.error("Error al cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar categorías usando la función helper de búsqueda universal
  const filteredCategories = filterBySearch(categories, searchTerm);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categories]);
  const totalItems = filteredCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  // CRUD Handlers
  const handleCreateCategory = async (newCategoryData) => {
    const categoryPromise = (async () => {
      await serviceCategoriesService.create(newCategoryData);
      await loadCategories();
      return true;
    })();

    toast.promise(
      categoryPromise,
      {
        loading: 'Creando categoría...',
        success: 'Categoría creada exitosamente',
        error: (err) => {
          console.error("[CatServices] Error creando categoría:", err);
          const backendMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
          return backendMsg || "Error al crear categoría";
        },
      }
    );

    try {
      await categoryPromise;
    } catch (error) {
      // Error ya manejado por toast.promise
    }
  };

  const handleEditCategory = async (updatedCategory) => {
    const categoryPromise = (async () => {
      await serviceCategoriesService.update(
        updatedCategory.id_categoria_servicio, 
        updatedCategory
      );
      await loadCategories();
      setShowEditModal(false);
      setSelectedCategory(null);
      return true;
    })();

    toast.promise(
      categoryPromise,
      {
        loading: 'Actualizando categoría...',
        success: 'Categoría actualizada exitosamente',
        error: (err) => {
          console.error("[CatServices] Error actualizando categoría:", err);
          const backendMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
          return backendMsg || "Error al actualizar categoría";
        },
      }
    );

    try {
      await categoryPromise;
    } catch (error) {
      // Error ya manejado por toast.promise
    }
  };

  // Handler para eliminar categoría - muestra modal primero
  const handleDeleteCategory = (categoryId) => {
    const category = categories.find(c => c.id_categoria_servicio === categoryId);
    if (category) {
      setPendingDelete({ id: categoryId, category });
      setShowDeleteModal(true);
    }
  };

  // Handler para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    setDeletingId(pendingDelete.id);
      const categoryPromise = (async () => {
      await serviceCategoriesService.delete(pendingDelete.id);
        await loadCategories();
        return true;
      })();

      toast.promise(
        categoryPromise,
        {
          loading: 'Eliminando categoría...',
          success: 'Categoría eliminada exitosamente',
          error: (err) => {
            console.error("[CatServices] Error eliminando categoría:", err);
            const backendMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
            return backendMsg || "Error al eliminar categoría";
          },
        }
      );

      try {
        await categoryPromise;
      setShowDeleteModal(false);
      setPendingDelete(null);
      } catch (error) {
        // Error ya manejado por toast.promise
    } finally {
      setDeletingId(null);
    }
  };

  // Handler para cambiar estado - muestra modal primero
  const handleToggleStatus = (category) => {
    setPendingStatusChange(category);
    setShowStatusModal(true);
  };

  // Handler para confirmar cambio de estado
  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    const category = pendingStatusChange;
    setTogglingId(category.id_categoria_servicio);
    try {
      const newStatus = category.estado === 'Activo' ? 'inactivo' : 'activo';
      await serviceCategoriesService.toggleStatus(category.id_categoria_servicio, newStatus);
      await loadCategories();
      const statusText = newStatus === 'activo' ? "activada" : "desactivada";
      toast.success(`Categoría ${statusText}`);
      setShowStatusModal(false);
      setPendingStatusChange(null);
    } catch (error) {
      console.error("[CatServices] Error cambiando estado:", error);
      const backendMsg = error?.response?.data?.message || error?.response?.data?.error || error?.message;
      toast.error(backendMsg || "Error al cambiar estado");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };


  const closeModals = () => {
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedCategory(null);
  };

  // Manejo de errores inicial
  if (error && categories.length === 0 && !loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <i className="bi bi-exclamation-triangle text-6xl text-red-500 mb-4"></i>
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={loadCategories}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition font-semibold"
          >
            <i className="bi bi-arrow-repeat mr-2"></i>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* Barra de búsqueda y botón de crear */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchProduct 
                searchTerm={searchTerm} 
                handleSearch={handleSearch} 
                placeholder="Buscar categorías..." 
              />
              <CreateCatServices 
                onCreate={handleCreateCategory} 
                categories={categories} 
              />
            </div>

            {/* Tabla de categorías */}
            <CategoriesTable
              categories={pageCategories}
              onToggleStatus={handleToggleStatus}
              togglingId={togglingId}
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
            <Paginator
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />
          </div>
        </div>
      </div>

      {/* Modales */}
      {showEditModal && selectedCategory && (
        <EditCatServices
          category={selectedCategory}
          onClose={closeModals}
          onEdit={handleEditCategory}
          existingCategories={categories}
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
            if (!togglingId) {
              setShowStatusModal(false);
              setPendingStatusChange(null);
            }
          }}
          onConfirm={handleConfirmStatusChange}
          isActivating={pendingStatusChange.estado === 'Inactivo'}
          itemName={pendingStatusChange.nombre}
          loading={togglingId === pendingStatusChange.id_categoria_servicio}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && pendingDelete && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            if (!deletingId) {
              setShowDeleteModal(false);
              setPendingDelete(null);
            }
          }}
          onConfirm={handleConfirmDelete}
          itemName={pendingDelete.category.nombre}
          entityType="categoría"
          loading={deletingId === pendingDelete.id}
        />
      )}
    </div>
  );
};

export default CatServices;
