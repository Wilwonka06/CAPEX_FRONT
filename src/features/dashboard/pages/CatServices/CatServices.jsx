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
import LoadingTable from "../../../../shared/components/LoadingTable";
import Swal from "sweetalert2";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SearchProduct from '../../../../shared/Search';
import { useOutletContext } from 'react-router-dom';

const CatServices = () => {
  const { setTitle } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingId, setTogglingId] = useState(null);

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
      await updateServiceCategory(
        updatedCategory.id_categoria_servicio,
        updatedCategory
      );
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
    await toggleServiceCategoryStatus(category.id_categoria_servicio, category);
    await loadCategories();
    const newStatus = category.estado === "Activo" ? "Inactivo" : "Activo";
    toast.success(`Categoría ${newStatus.toLowerCase()}a`);
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    toast.error("No se pudo cambiar el estado");
  } finally {
    setTogglingId(null);
  }
};

const handleSearch = (e) => setSearchTerm(e.target.value);

const filteredCategories = categories.filter((cat) =>
  (cat.id_categoria_servicio?.toString() || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
  (cat.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
  (cat.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
  (cat.estado || "").toLowerCase().includes(searchTerm.toLowerCase())
);

if (loading) {
  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando categorías...</p>
      </div>
    </div>
  );
}

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
  <div className="min-h-screen font-inter p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Categorías de Servicios</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
        >
          + Nueva Categoría
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchProduct
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          placeholder="Buscar categorías..."
        />
      </div>

      {/* Tabla de categorías */}
      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <i className="bi bi-inbox text-6xl text-gray-300"></i>
            <p className="mt-4 text-gray-500">No hay categorías registradas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3">Descripción</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => {
                  const isActive = cat.estado === "Activo";
                  const isToggling = togglingId === cat.id_categoria_servicio;
                  return (
                    <tr key={cat.id_categoria_servicio} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-3">{cat.id_categoria_servicio}</td>
                      <td className="px-6 py-3">{cat.nombre}</td>
                      <td className="px-6 py-3">{cat.descripcion || "—"}</td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => handleToggleStatus(cat)}
                          disabled={isToggling}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isActive ? "bg-green-500" : "bg-gray-300"
                          } ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isActive ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-3 flex gap-2 justify-center">
                        <button
                          onClick={() => setEditingCategory(cat)}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id_categoria_servicio)}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </div>
);
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

      <ToastContainer position="top-right" />
    </div>
  );
};

export default CatServices;