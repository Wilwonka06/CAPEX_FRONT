import axios from "axios";

const BASE = "http://localhost:3000/api/categorias-servicios";

// Obtener todas
export const getServiceCategories = async () => {
  const res = await axios.get(BASE);
  return res.data;
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
    const res = await axios.post(BASE, payload);
    console.log("[API] POST response ->", res.status, res.data);
    return res.data;
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
  const res = await axios.put(`${BASE}/${id}`, payload);
  return res.data;
};

// Eliminar
export const deleteServiceCategory = async (id) => {
  const res = await axios.delete(`${BASE}/${id}`);
  return res.data;
};
