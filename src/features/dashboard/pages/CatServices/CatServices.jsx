import { useEffect, useState } from "react";
import {
  getServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  toggleServiceCategoryStatus,
} from "./api/serviceCategoriesApi";

import AddCatServices from "./components/AddCatServices";
import EditCatServices from "./components/EditCatServices";
import SearchProduct from '../../../../shared/Search';
import TableContentSkeleton from "../../../../shared/components/TableContentSkeleton";
import Paginator from "../../../../shared/Paginator";
import Swal from "sweetalert2";
import toast from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';

const ITEMS_PER_PAGE = 5;

const CatServices = () => {
  const { setTitle } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getServiceCategories();
      console.log("[DEBUG] Categorías cargadas:", data);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando categorías de servicios:", err);
      setCategories([]);
      setError("No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    setTitle("Categorías de Servicios");
    return () => setTitle("");
  }, [setTitle]);

  const handleAdd = async (newCategory) => {
    try {
      await createServiceCategory(newCategory);
      await loadCategories();
      setShowAdd(false);
      toast.success("Categoría creada correctamente");
    } catch (error) {
      toast.error("No se pudo crear la categoría");
    }
  };

  const handleEdit = async (updatedCategory) => {
    try {
      await updateServiceCategory(updatedCategory.id_categoria_servicio, updatedCategory);
      await loadCategories();
      setEditingCategory(null);
      toast.success("Categoría actualizada correctamente");
    } catch (error) {
      toast.error("No se pudo actualizar la categoría");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar categoría?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      try {
        await deleteServiceCategory(id);
        await loadCategories();
        toast.success("Categoría eliminada");
      } catch (error) {
        toast.error("No se pudo eliminar la categoría");
      }
    }
  };

  const handleToggleStatus = async (category) => {
    setTogglingId(category.id_categoria_servicio);
    try {
      const newStatus = category.estado === "Activo" ? "inactivo" : "activo";
      await toggleServiceCategoryStatus(category.id_categoria_servicio, newStatus);
      await loadCategories();
      const statusText = newStatus === "activo" ? "activada" : "desactivada";
      toast.success(`Categoría ${statusText}`);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast.error("No se pudo cambiar el estado");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset a la primera página al buscar
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadCategories}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition"
          >
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
              <button
                className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center"
                onClick={() => setShowAdd(true)}
              >
                <i className="bi bi-plus-circle mr-2"></i>
                crear Categoría
              </button>
            </div>

            {/* Tabla de categorías o skeleton */}
            {loading ? (
              <TableContentSkeleton columns={5} rows={5} showActions={true} />
            ) : categories.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No hay categorías registradas.</p>
            ) : (
              <>
                <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 hover:bg-gray-100">
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Categoría</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Descripción</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Estado</th>
                        <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedCategories.map((cat) => {
                        const isActive = cat.estado === "Activo";
                        const isToggling = togglingId === cat.id_categoria_servicio;
                        return (
                          <tr key={cat.id_categoria_servicio} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="py-4 px-4 text-xs font-medium text-gray-900">{cat.nombre}</td>
                            <td className="py-4 px-4 text-xs text-gray-600 max-w-[300px] truncate">{cat.descripcion || "—"}</td>
                            <td className="py-4 px-4 text-xs">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleToggleStatus(cat)}
                                  disabled={isToggling}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                                    isActive ? 'bg-gray-900' : 'bg-gray-300'
                                  } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                  title="Click para cambiar estado"
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                                      isActive ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                                <span className={`text-xs font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                  {isToggling ? 'Cambiando...' : cat.estado}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm font-medium text-right">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => setEditingCategory(cat)}
                                  className="h-8 w-8 p-0 flex items-center justify-center"
                                  title="Editar"
                                >
                                  <i className="bi bi-pencil-square text-amber-500 text-lg"></i>
                                </button>
                                <button
                                  onClick={() => handleDelete(cat.id_categoria_servicio)}
                                  className="h-8 w-8 p-0 flex items-center justify-center"
                                  title="Eliminar"
                                >
                                  <i className="bi bi-trash text-red-500 text-lg"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Paginación */}
                {totalPages > 1 && (
                  <Paginator
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showAdd && (
        <AddCatServices
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
          existingCategories={categories}
        />
      )}

      {editingCategory && (
        <EditCatServices
          onClose={() => setEditingCategory(null)}
          category={editingCategory}
          onEdit={handleEdit}
          existingCategories={categories}
        />
      )}

    </div>
  );
};

export default CatServices;