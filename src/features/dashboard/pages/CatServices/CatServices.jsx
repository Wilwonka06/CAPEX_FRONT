import { useEffect, useState } from "react";
import {
  getServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
} from "./api/serviceCategoriesApi";

import AddCatServices from "./components/AddCatServices";
import EditCatServices from "./components/EditCatServices";
import Swal from "sweetalert2";

const CatServices = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState("");

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

  const handleAdd = async (newCategory) => {
    try {
      await createServiceCategory(newCategory);
      await loadCategories();
      Swal.fire("Éxito", "Categoría creada correctamente", "success");
    } catch (error) {
      Swal.fire("Error", "No se pudo crear la categoría", "error");
    }
  };

  const handleEdit = async (updatedCategory) => {
    try {
      await updateServiceCategory(updatedCategory.id_categoria_servicio, updatedCategory);
      await loadCategories();
      Swal.fire("Éxito", "Categoría actualizada correctamente", "success");
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar la categoría", "error");
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
        Swal.fire("Éxito", "Categoría eliminada", "success");
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar la categoría", "error");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Categorías de Servicios</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
        >
          + Nueva Categoría
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600">Cargando categorías...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-600">No hay categorías registradas.</p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
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
              {categories.map((cat) => (
                <tr key={cat.id_categoria_servicio} className="border-t">
                  <td className="px-6 py-3">{cat.id_categoria_servicio}</td>
                  <td className="px-6 py-3">{cat.nombre}</td>
                  <td className="px-6 py-3">{cat.descripcion || "—"}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        cat.estado === "Activo"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {cat.estado}
                    </span>
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
              ))}
            </tbody>
          </table>
        </div>
      )}

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
