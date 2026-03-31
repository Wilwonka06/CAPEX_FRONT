/**
 * ServicesDataService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Servicio de datos de servicios - SOLO LECTURA desde API
 * 
 * NOTA: Las operaciones de escritura (add/update/delete) deben hacerse
 * directamente con el servicio de API en:
 *   src/features/dashboard/pages/services/API/ServicesService.js
 * 
 * Este archivo existe para compatibilidad con componentes que aún lo importan.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { getAllServices } from '../../features/landing/pages/ServicesPage/api/servicesApi';

// Función para normalizar servicios del backend al formato esperado por el frontend
const normalizeService = (item) => {
  return {
    id: item.id_servicio ?? item.id ?? item.idServicio ?? item.ID,
    name: item.nombre ?? item.name ?? "",
    nombre: item.nombre ?? item.name ?? "",
    descripcion: item.descripcion ?? item.description ?? "",
    duracion: item.duracion ?? item.duration ?? 0,
    precio: item.precio ?? item.price ?? 0,
    price: item.precio ?? item.price ?? 0,
    active: item.estado === "Activo" || item.isActive !== false,
    estado: item.estado ?? (item.isActive === false ? "Inactivo" : "Activo"),
    imagen: item.foto ?? item.imagen ?? item.img ?? null,
    img: item.foto ?? item.imagen ?? item.img ?? null,
    foto: item.foto ?? item.imagen ?? item.img ?? null,
    category: item.categoria?.nombre ?? item.categoriaServicio?.nombre ?? item.category_name ?? item.categoria ?? "General",
    id_categoria_servicio: item.id_categoria_servicio ?? item.categoryId ?? null,
    createdAt: item.createdAt ?? item.fecha_creacion ?? new Date().toISOString(),
    updatedAt: item.updatedAt ?? item.fecha_actualizacion ?? new Date().toISOString(),
  };
};

/**
 * Obtener todos los servicios desde la API
 * @returns {Promise<Array>} Array de servicios normalizados
 */
export const getServices = async () => {
  try {
    const services = await getAllServices();
    return (services || []).map(normalizeService);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching services from API:', error);
    }
    return [];
  }
};

/**
 * @deprecated Usar servicesService.create() de src/features/dashboard/pages/services/API/ServicesService.js
 */
export const addService = async () => {
  throw new Error(
    'addService() está deprecado. Usa servicesService.create() de src/features/dashboard/pages/services/API/ServicesService.js'
  );
};

/**
 * @deprecated Usar servicesService.update() de src/features/dashboard/pages/services/API/ServicesService.js
 */
export const updateService = async () => {
  throw new Error(
    'updateService() está deprecado. Usa servicesService.update() de src/features/dashboard/pages/services/API/ServicesService.js'
  );
};

/**
 * @deprecated Usar servicesService.delete() de src/features/dashboard/pages/services/API/ServicesService.js
 */
export const deleteService = async () => {
  throw new Error(
    'deleteService() está deprecado. Usa servicesService.delete() de src/features/dashboard/pages/services/API/ServicesService.js'
  );
};

export default {
  getServices,
  addService,
  updateService,
  deleteService,
};
