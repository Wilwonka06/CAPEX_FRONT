import apiRequest from '../../../../../shared/config/apiConfig';

const BASE = "/categorias-servicios";

// Obtener todas
export const getServiceCategories = async () => {
  try {
    const raw = await apiRequest.get(BASE, { timeout: 12000 });

    // Normalización defensiva de la respuesta
    let list = [];
    if (Array.isArray(raw)) {
      list = raw;
    } else if (raw?.data && Array.isArray(raw.data)) {
      list = raw.data;
    } else if (raw?.results && Array.isArray(raw.results)) {
      list = raw.results;
    }

    // Asegurar campos esperados por la UI
    return list.map((item) => ({
      id_categoria_servicio:
        item.id_categoria_servicio ?? item.id ?? item.idCategoria ?? item.ID,
      nombre: item.nombre ?? item.name ?? item.categoria ?? "",
      descripcion: item.descripcion ?? item.description ?? "",
      estado: item.estado ?? (item.isActive === false ? "Inactivo" : "Activo"),
    }));
  } catch (error) {
    console.error("[API] getServiceCategories ERROR:", error?.message);
    // Fallback vacío para que no quede colgado el loading
    return [];
  }
};


// Crear nueva
export const createServiceCategory = async (category) => {
  const payload = {
    nombre: category.nombre ?? category.Categoria,
    descripcion: category.descripcion ?? category.Descripcion,
    estado: category.estado ?? "Activo",
  };

  try {
    console.log("[API] POST payload ->", payload);
    const res = await apiRequest.post(BASE, payload);
    console.log("[API] POST response ->", res);
    return res;
  } catch (err) {
    console.error(
      "[API] createServiceCategory ERROR:",
      err.response?.status,
      err.response?.data || err.message
    );
    throw err;
  }
};

// Actualizar
export const updateServiceCategory = async (id, category) => {
  const payload = {
    nombre: category.nombre ?? category.Categoria,
    descripcion: category.descripcion ?? category.Descripcion,
    estado: category.estado ?? "Activo",
  };
  const res = await apiRequest.put(`${BASE}/${id}`, payload);
  return res;
};

// Eliminar
export const deleteServiceCategory = async (id) => {
  const res = await apiRequest.delete(`${BASE}/${id}`);
  return res;
};

// Cambiar estado (toggle)
export const toggleServiceCategoryStatus = async (id, newStatus) => {
  try {
    console.log("[API] PATCH change status for ID:", id, "New status:", newStatus);
    const res = await apiRequest.patch(`${BASE}/${id}/status`, { estado: newStatus });
    console.log("[API] PATCH response ->", res);
    return res;
  } catch (err) {
    console.error(
      "[API] toggleServiceCategoryStatus ERROR:",
      err.response?.status,
      err.response?.data || err.message
    );
    throw err;
  }
};