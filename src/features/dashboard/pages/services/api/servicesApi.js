import apiRequest from '../../../../../shared/config/apiConfig';

const BASE = "/servicios";

// Obtener todos los servicios
export const getServices = async () => {
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
      id: item.id_servicio ?? item.id ?? item.idServicio ?? item.ID,
      nombre: item.nombre ?? item.name ?? "",
      descripcion: item.descripcion ?? item.description ?? "",
      duracion: item.duracion ?? item.duration ?? 0,
      precio: item.precio ?? item.price ?? 0,
      estado: item.estado ?? (item.isActive === false ? "Inactivo" : "Activo"),
      foto: item.foto ?? item.imagen ?? item.img ?? null,
      id_categoria_servicio: item.id_categoria_servicio ?? item.categoryId ?? null,
      categoria: item.categoria ?? null, // Para casos donde viene populada
      createdAt: item.createdAt ?? item.fecha_creacion ?? new Date().toISOString(),
      updatedAt: item.updatedAt ?? item.fecha_actualizacion ?? new Date().toISOString(),
    }));
  } catch (error) {
    console.error("[API] getServices ERROR:", error?.message);
    // Fallback vacío para que no quede colgado el loading
    return [];
  }
};

// Crear nuevo servicio
export const createService = async (service) => {
  const payload = {
    nombre: service.nombre ?? service.name,
    descripcion: service.descripcion ?? service.description,
    duracion: typeof service.duracion === 'string' ? parseInt(service.duracion) : service.duracion,
    precio: typeof service.precio === 'string' ? parseFloat(service.precio) : service.precio,
    id_categoria_servicio: service.id_categoria_servicio ?? service.categoryId,
    foto: service.foto ?? service.imagen ?? '',
  };

  try {
    console.log("[API] POST Service payload ->", payload);
    const created = await apiRequest.post(BASE, payload);
    console.log("[API] POST Service response ->", created);
    
    // Normalizar respuesta
    return {
      id: created.id_servicio ?? created.id ?? created.idServicio ?? created.ID,
      nombre: created.nombre ?? created.name ?? payload.nombre,
      descripcion: created.descripcion ?? created.description ?? payload.descripcion,
      duracion: created.duracion ?? created.duration ?? payload.duracion,
      precio: created.precio ?? created.price ?? payload.precio,
      estado: created.estado ?? "Activo",
      foto: created.foto ?? created.imagen ?? payload.foto,
      id_categoria_servicio: created.id_categoria_servicio ?? payload.id_categoria_servicio,
      categoria: created.categoria ?? null,
    };
  } catch (err) {
    console.error(
      "[API] createService ERROR:",
      err.response?.status,
      err.response?.data || err.message
    );
    throw err;
  }
};

// Actualizar servicio
export const updateService = async (id, service) => {
  const payload = {
    nombre: service.nombre ?? service.name,
    descripcion: service.descripcion ?? service.description,
    duracion: typeof service.duracion === 'string' ? parseInt(service.duracion) : service.duracion,
    precio: typeof service.precio === 'string' ? parseFloat(service.precio) : service.precio,
    id_categoria_servicio: service.id_categoria_servicio ?? service.categoryId,
    foto: service.foto ?? service.imagen ?? '',
  };

  try {
    console.log("[API] PUT Service payload ->", payload);
    const updated = await apiRequest.put(`${BASE}/${id}`, payload);
    console.log("[API] PUT Service response ->", updated);
    
    return {
      id: updated.id_servicio ?? updated.id ?? id,
      nombre: updated.nombre ?? updated.name ?? payload.nombre,
      descripcion: updated.descripcion ?? updated.description ?? payload.descripcion,
      duracion: updated.duracion ?? updated.duration ?? payload.duracion,
      precio: updated.precio ?? updated.price ?? payload.precio,
      estado: updated.estado ?? "Activo",
      foto: updated.foto ?? updated.imagen ?? payload.foto,
      id_categoria_servicio: updated.id_categoria_servicio ?? payload.id_categoria_servicio,
      categoria: updated.categoria ?? null,
    };
  } catch (err) {
    console.error(
      "[API] updateService ERROR:",
      err.response?.status,
      err.response?.data || err.message
    );
    throw err;
  }
};

// Eliminar servicio
export const deleteService = async (id) => {
  try {
    const res = await apiRequest.delete(`${BASE}/${id}`);
    console.log("[API] DELETE Service response ->", res);
    return res;
  } catch (err) {
    console.error(
      "[API] deleteService ERROR:",
      err.response?.status,
      err.response?.data || err.message
    );
    throw err;
  }
};

// Cambiar estado del servicio
export const toggleServiceStatus = async (service) => {
  const payload = {
    nombre: service.nombre ?? service.name,
    descripcion: service.descripcion ?? service.description,
    duracion: typeof service.duracion === 'string' ? parseInt(service.duracion) : service.duracion,
    precio: typeof service.precio === 'string' ? parseFloat(service.precio) : service.precio,
    id_categoria_servicio: service.id_categoria_servicio ?? service.categoryId,
    foto: service.foto ?? service.imagen ?? '',
    estado: service.estado,
  };

  try {
    console.log("[API] PUT Service status ->", service.id, service.estado);
    const updated = await apiRequest.put(`${BASE}/${service.id}`, payload);
    console.log("[API] PUT Service response ->", updated);

    return {
      id: updated.id_servicio ?? updated.id ?? service.id,
      nombre: updated.nombre ?? updated.name ?? payload.nombre,
      descripcion: updated.descripcion ?? updated.description ?? payload.descripcion,
      duracion: updated.duracion ?? updated.duration ?? payload.duracion,
      precio: updated.precio ?? updated.price ?? payload.precio,
      estado: updated.estado ?? service.estado,
      foto: updated.foto ?? updated.imagen ?? payload.foto,
      id_categoria_servicio: updated.id_categoria_servicio ?? payload.id_categoria_servicio,
      categoria: updated.categoria ?? null,
    };
  } catch (err) {
    console.error(
      "[API] toggleServiceStatus ERROR:",
      err.response?.status,
      err.response?.data || err.message
    );
    throw err;
  }
};

// Buscar servicios (endpoint adicional disponible)
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
      nombre: item.nombre ?? item.name ?? "",
      descripcion: item.descripcion ?? item.description ?? "",
      duracion: item.duracion ?? item.duration ?? 0,
      precio: item.precio ?? item.price ?? 0,
      estado: item.estado ?? "Activo",
      foto: item.foto ?? item.imagen ?? null,
      id_categoria_servicio: item.id_categoria_servicio ?? null,
      categoria: item.categoria ?? null,
    }));
  } catch (error) {
    console.error("[API] searchServices ERROR:", error?.message);
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
      nombre: item.nombre ?? item.name ?? "",
      descripcion: item.descripcion ?? item.description ?? "",
      duracion: item.duracion ?? item.duration ?? 0,
      precio: item.precio ?? item.price ?? 0,
      estado: item.estado ?? "Activo",
      foto: item.foto ?? item.imagen ?? null,
      id_categoria_servicio: item.id_categoria_servicio ?? null,
      categoria: item.categoria ?? null,
    };
  } catch (error) {
    console.error("[API] getServiceById ERROR:", error?.message);
    return null;
  }
};