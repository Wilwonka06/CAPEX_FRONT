// src/pages/dashboard/services/api/serviceApi.js
import axios from "axios";

// URL base como en categorías
const BASE = "https://capex-back.onrender.com/api/servicios";

// Normaliza respuestas { data } o array directo
const unwrap = (res) => {
  const payload = res?.data;
  if (Array.isArray(payload)) return payload;
  if (payload?.data !== undefined) return payload.data;
  return payload;
};

// Obtener todos los servicios
export const getServices = async () => {
  const res = await axios.get(BASE);
  return unwrap(res) ?? [];
};

// Crear servicio (FormData con posible archivo en foto)
// Espera campos: nombre, id_categoria_servicio, descripcion, duracion, precio, foto
export const createService = async (payload) => {
  try {
    let res;
    // Enviar JSON por defecto
    res = await axios.post(BASE, payload, { headers: { 'Content-Type': 'application/json' } });
    return unwrap(res);
  } catch (err) {
    // Log útil para depurar backend
    // eslint-disable-next-line no-console
    console.error("[API servicios] createService ERROR:", err?.response?.status, err?.response?.data || err?.message);
    throw err;
  }
};

// Actualizar servicio (JSON)
export const updateService = async (service) => {
  const payload = {
    nombre: service.nombre ?? service.name,
    descripcion: service.descripcion ?? service.description,
    duracion: service.duracion ?? service.duration,
    precio: service.precio ?? service.price,
    estado: service.estado ?? (service.active ? "Activo" : "Inactivo"),
    id_categoria_servicio: service.id_categoria_servicio ?? service.categoryId,
  };
  const res = await axios.put(`${BASE}/${service.id}`, payload);
  return unwrap(res);
};

// Eliminar servicio
export const deleteService = async (id) => {
  const res = await axios.delete(`${BASE}/${id}`);
  return unwrap(res);
};

// Cambiar estado (activo/inactivo)
export const toggleServiceStatus = async (id) => {
  const res = await axios.patch(`${BASE}/${id}/toggle`);
  return unwrap(res);
};
