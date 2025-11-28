import { useState, useEffect } from "react";
import serviceCategoriesService from "./API/serviceCategoriesService";
import CreateCatServices from "./components/CreateCatServices";
import EditCatServices from "./components/EditCatServices";
import CategoryDetail from "./components/CategoryDetail";
import CategoriesTable from "./components/CategoriesTable";
import SearchProduct from '../../../../shared/Search';
import Paginator from '../../../../shared/Paginator';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

const CatServices = () => {
  const { setTitle } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [togglingId, setTogglingId] = useState(null);

  // Estados para modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

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

  // Filtrar categorías por término de búsqueda
  const filteredCategories = categories.filter((cat) =>
    (cat.id_categoria_servicio?.toString() || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.estado || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Resetear página al cambiar búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categories]);

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

  const handleDeleteCategory = async (categoryId) => {
    const category = categories.find(c => c.id_categoria_servicio === categoryId);
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas eliminar la categoría "${category?.nombre}"? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      const categoryPromise = (async () => {
        await serviceCategoriesService.delete(categoryId);
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
      } catch (error) {
        // Error ya manejado por toast.promise
      }
    }
  };

  const handleToggleStatus = async (category) => {
    setTogglingId(category.id_categoria_servicio);
    try {
      const newStatus = category.estado === 'Activo' ? 'inactivo' : 'activo';
      await serviceCategoriesService.toggleStatus(category.id_categoria_servicio, newStatus);
      await loadCategories();
      const statusText = newStatus === 'activo' ? "activada" : "desactivada";
      toast.success(`Categoría ${statusText}`);
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
              categories={paginatedCategories}
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
    </div>
  );
};

export default CatServices;