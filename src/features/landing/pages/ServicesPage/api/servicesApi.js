import apiRequest from '../../../../../shared/config/apiConfig';

const BASE = "/servicios";

// Obtener todos los servicios
export const getAllServices = async () => {
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

    // Asegurar campos esperados por la UI del cliente
    return list.map((item) => ({
      id: item.id_servicio ?? item.id ?? item.idServicio ?? item.ID,
      name: item.nombre ?? item.name ?? "",
      description: item.descripcion ?? item.description ?? "",
      duration: item.duracion ?? item.duration ?? 0,
      price: item.precio ?? item.price ?? 0,
      active: item.estado === "Activo" || item.isActive !== false,
      estado: item.estado ?? (item.isActive === false ? "Inactivo" : "Activo"),
      imagen: item.foto ?? item.imagen ?? item.img ?? null,
      img: item.foto ?? item.imagen ?? item.img ?? null,
      category: item.categoria?.nombre ?? item.categoriaServicio?.nombre ?? item.category_name ?? item.categoria ?? "General",
      id_categoria_servicio: item.id_categoria_servicio ?? item.categoryId ?? null,
      createdAt: item.createdAt ?? item.fecha_creacion ?? new Date().toISOString(),
      updatedAt: item.updatedAt ?? item.fecha_actualizacion ?? new Date().toISOString(),
    }));
  } catch (error) {
    console.error("[ServicesAPI-Client] getAllServices ERROR:", error?.message);
    return [];
  }
};

// Obtener servicio por ID
export const getServiceById = async (id) => {
  try {
    const item = await apiRequest.get(`${BASE}/${id}`, { timeout: 12000 });

    if (!item) return null;

    return {
      id: item.id_servicio ?? item.id ?? item.idServicio ?? item.ID,
      name: item.nombre ?? item.name ?? "",
      description: item.descripcion ?? item.description ?? "",
      duration: item.duracion ?? item.duration ?? 0,
      price: item.precio ?? item.price ?? 0,
      active: item.estado === "Activo" || item.isActive !== false,
      estado: item.estado ?? "Activo",
      imagen: item.foto ?? item.imagen ?? null,
      img: item.foto ?? item.imagen ?? null,
      category: item.categoria?.nombre ?? item.categoria ?? "General",
      id_categoria_servicio: item.id_categoria_servicio ?? null,
    };
  } catch (error) {
    console.error("[ServicesAPI-Client] getServiceById ERROR:", error?.message);
    return null;
  }
};

// Buscar servicios
export const searchServices = async (query) => {
  try {
    const raw = await apiRequest.get(`${BASE}/search`, {
      params: { q: query },
      timeout: 12000
    });

    let list = [];
    if (Array.isArray(raw)) {
      list = raw;
    } else if (raw?.data && Array.isArray(raw.data)) {
      list = raw.data;
    }

    return list.map((item) => ({
      id: item.id_servicio ?? item.id ?? item.idServicio ?? item.ID,
      name: item.nombre ?? item.name ?? "",
      description: item.descripcion ?? item.description ?? "",
      duration: item.duracion ?? item.duration ?? 0,
      price: item.precio ?? item.price ?? 0,
      active: item.estado === "Activo" || item.isActive !== false,
      estado: item.estado ?? "Activo",
      imagen: item.foto ?? item.imagen ?? null,
      img: item.foto ?? item.imagen ?? null,
      category: item.categoria?.nombre ?? item.categoria ?? "General",
      id_categoria_servicio: item.id_categoria_servicio ?? null,
    }));
  } catch (error) {
    console.error("[ServicesAPI-Client] searchServices ERROR:", error?.message);
    return [];
  }
};