import apiRequest from '../config/apiConfig';
import { getAllServices } from '../../features/landing/pages/ServicesPage/api/servicesApi';

// Función para normalizar servicios del backend al formato esperado por el frontend
const normalizeService = (item) => {
  return {
    id: item.id_servicio ?? item.id ?? item.idServicio ?? item.ID,
    name: item.nombre ?? item.name ?? "",
    descripcion: item.descripcion ?? item.description ?? "",
    duracion: item.duracion ?? item.duration ?? 0,
    precio: item.precio ?? item.price ?? 0,
    price: item.precio ?? item.price ?? 0,
    active: item.estado === "Activo" || item.isActive !== false,
    estado: item.estado ?? (item.isActive === false ? "Inactivo" : "Activo"),
    imagen: item.foto ?? item.imagen ?? item.img ?? null,
    img: item.foto ?? item.imagen ?? item.img ?? null,
    category: item.categoria?.nombre ?? item.categoriaServicio?.nombre ?? item.category_name ?? item.categoria ?? "General",
    id_categoria_servicio: item.id_categoria_servicio ?? item.categoryId ?? null,
    createdAt: item.createdAt ?? item.fecha_creacion ?? new Date().toISOString(),
    updatedAt: item.updatedAt ?? item.fecha_actualizacion ?? new Date().toISOString(),
  };
};

export const getServices = async () => {
  try {
    const services = await getAllServices();
    // Normalizar y retornar
    return services.map(normalizeService);
  } catch (error) {
    console.error('Error fetching services from API:', error);
    // Retornar array vacío en caso de error
    return [];
  }
};

export const addService = (service) => {
  return new Promise((resolve) => {
    getServices().then((services) => {
      const newService = { ...service, id: Date.now() };
      const updatedServices = [...services, newService];
      saveServicesToStorage(updatedServices);
      resolve(newService);
    });
  });
};

export const updateService = (updatedService) => {
  return new Promise((resolve) => {
    getServices().then((services) => {
      const updatedServices = services.map(s => s.id === updatedService.id ? updatedService : s);
      saveServicesToStorage(updatedServices);
      resolve(updatedService);
    });
  });
};

export const deleteService = (serviceId) => {
  return new Promise((resolve) => {
    getServices().then((services) => {
      const updatedServices = services.filter(s => s.id !== serviceId);
      saveServicesToStorage(updatedServices);
      resolve(serviceId);
    });
  });
}; 