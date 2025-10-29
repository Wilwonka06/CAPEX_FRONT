import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de servicios
 * Endpoints base: /api/servicios
 */

const SERVICES_ENDPOINT = '/servicios';

export const servicesService = {
  /**
   * Obtener todos los servicios con paginación y filtros
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.page - Número de página (opcional)
   * @param {number} params.limit - Límite de resultados por página (opcional)
   * @param {string} params.search - Término de búsqueda (opcional)
   * @param {string} params.status - Estado del servicio (opcional)
   * @param {number} params.categoryId - ID de categoría (opcional)
   * @returns {Promise<Object>} Lista de servicios con metadatos de paginación
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      // Agregar parámetros de consulta si existen
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.categoryId) queryParams.append('categoryId', params.categoryId);

      const url = queryParams.toString()
        ? `${SERVICES_ENDPOINT}?${queryParams.toString()}`
        : SERVICES_ENDPOINT;

      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los servicios activos (sin paginación)
   * Útil para dropdowns y selects
   * @returns {Promise<Array>} Lista de servicios activos
   */
  getActive: async () => {
    try {
      const response = await apiRequest.get(`${SERVICES_ENDPOINT}?status=activo`);
      return response;
    } catch (error) {
      console.error('Error fetching active services:', error);
      throw error;
    }
  },

  /**
   * Obtener un servicio por ID
   * @param {number|string} id - ID del servicio
   * @returns {Promise<Object>} Datos del servicio
   */
  getById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del servicio es requerido');
      }

      const response = await apiRequest.get(`${SERVICES_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching service ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo servicio
   * @param {Object} serviceData - Datos del servicio
   * @param {string} serviceData.nombre - Nombre del servicio
   * @param {string} serviceData.descripcion - Descripción del servicio (opcional)
   * @param {number} serviceData.duracion - Duración en minutos
   * @param {number} serviceData.precio - Precio del servicio
   * @param {number} serviceData.id_categoria_servicio - ID de la categoría
   * @param {string} serviceData.foto - URL de la imagen (opcional)
   * @returns {Promise<Object>} Servicio creado
   */
  create: async (serviceData) => {
    try {
      // Validaciones básicas
      if (!serviceData.nombre || serviceData.nombre.trim() === '') {
        throw new Error('El nombre del servicio es requerido');
      }
      if (!serviceData.duracion || serviceData.duracion <= 0) {
        throw new Error('La duración debe ser mayor a 0 minutos');
      }
      if (!serviceData.precio || serviceData.precio < 0) {
        throw new Error('El precio debe ser mayor o igual a 0');
      }

      // Limpiar y preparar datos
      const cleanData = {
        nombre: serviceData.nombre.trim(),
        descripcion: serviceData.descripcion?.trim() || '',
        duracion: typeof serviceData.duracion === 'string'
          ? parseInt(serviceData.duracion)
          : serviceData.duracion,
        precio: typeof serviceData.precio === 'string'
          ? parseFloat(serviceData.precio)
          : serviceData.precio,
        id_categoria_servicio: serviceData.id_categoria_servicio,
        foto: serviceData.foto?.trim() || '',
      };

      console.log('API Service: Sending data to backend:', cleanData);
      const response = await apiRequest.post(SERVICES_ENDPOINT, cleanData);
      return response;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },

  /**
   * Actualizar un servicio existente
   * @param {number|string} id - ID del servicio
   * @param {Object} serviceData - Datos actualizados del servicio
   * @returns {Promise<Object>} Servicio actualizado
   */
  update: async (id, serviceData) => {
    try {
      if (!id) {
        throw new Error('ID del servicio es requerido');
      }

      // Validaciones básicas
      if (serviceData.nombre && serviceData.nombre.trim() === '') {
        throw new Error('El nombre del servicio no puede estar vacío');
      }
      if (serviceData.duracion && serviceData.duracion <= 0) {
        throw new Error('La duración debe ser mayor a 0 minutos');
      }
      if (serviceData.precio && serviceData.precio < 0) {
        throw new Error('El precio debe ser mayor o igual a 0');
      }

      // Limpiar y preparar datos
      const cleanData = { ...serviceData };
      if (cleanData.nombre) cleanData.nombre = cleanData.nombre.trim();
      if (cleanData.descripcion) cleanData.descripcion = cleanData.descripcion.trim();
      if (cleanData.duracion) {
        cleanData.duracion = typeof cleanData.duracion === 'string'
          ? parseInt(cleanData.duracion)
          : cleanData.duracion;
      }
      if (cleanData.precio) {
        cleanData.precio = typeof cleanData.precio === 'string'
          ? parseFloat(cleanData.precio)
          : cleanData.precio;
      }
      if (cleanData.foto) cleanData.foto = cleanData.foto.trim();

      console.log('Frontend: Sending update data for service', id, ':', cleanData);
      const response = await apiRequest.put(`${SERVICES_ENDPOINT}/${id}`, cleanData);
      return response;
    } catch (error) {
      console.error(`Error updating service ${id}:`, error);
      throw error;
    }
  },

  /**
   * Actualización parcial de un servicio
   * @param {number|string} id - ID del servicio
   * @param {Object} partialData - Datos parciales a actualizar
   * @returns {Promise<Object>} Servicio actualizado
   */
  patch: async (id, partialData) => {
    try {
      if (!id) {
        throw new Error('ID del servicio es requerido');
      }

      const response = await apiRequest.patch(`${SERVICES_ENDPOINT}/${id}`, partialData);
      return response;
    } catch (error) {
      console.error(`Error patching service ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar un servicio
   * @param {number|string} id - ID del servicio
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  delete: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del servicio es requerido');
      }

      const response = await apiRequest.delete(`${SERVICES_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting service ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cambiar estado de un servicio (activar/desactivar)
   * @param {number|string} id - ID del servicio
   * @param {string} status - Nuevo estado ('activo' | 'inactivo')
   * @returns {Promise<Object>} Servicio con estado actualizado
   */
  changeStatus: async (id, status) => {
    try {
      console.log('Front-end: changeStatus called with id:', id, 'status:', status);
      if (!id) {
        throw new Error('ID del servicio es requerido');
      }
      if (!['activo', 'inactivo'].includes(status)) {
        throw new Error('Estado debe ser "activo" o "inactivo"');
      }

      const response = await apiRequest.patch(`${SERVICES_ENDPOINT}/${id}/status`, { status });
      console.log('Front-end: changeStatus response:', response);
      return response;
    } catch (error) {
      console.error(`Error changing service status ${id}:`, error);
      throw error;
    }
  },

  /**
   * Buscar servicios por término
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} filters - Filtros adicionales (opcional)
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  search: async (searchTerm, filters = {}) => {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        throw new Error('Término de búsqueda es requerido');
      }

      const params = {
        search: searchTerm.trim(),
        ...filters
      };

      return await servicesService.getAll(params);
    } catch (error) {
      console.error('Error searching services:', error);
      throw error;
    }
  },

  /**
   * Obtener servicios por categoría
   * @param {number|string} categoryId - ID de la categoría
   * @param {Object} params - Parámetros adicionales (opcional)
   * @returns {Promise<Object>} Servicios de la categoría
   */
  getByCategory: async (categoryId, params = {}) => {
    try {
      if (!categoryId) {
        throw new Error('ID de categoría es requerido');
      }

      const queryParams = {
        categoryId: categoryId,
        ...params
      };

      return await servicesService.getAll(queryParams);
    } catch (error) {
      console.error(`Error fetching services by category ${categoryId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de un servicio
   * @param {number|string} id - ID del servicio
   * @returns {Promise<Object>} Estadísticas del servicio
   */
  getStats: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del servicio es requerido');
      }

      const response = await apiRequest.get(`${SERVICES_ENDPOINT}/${id}/stats`);
      return response;
    } catch (error) {
      console.error(`Error fetching service stats ${id}:`, error);
      throw error;
    }
  },
};

// Mantener compatibilidad con el código existente
export const getServices = async () => {
  try {
    const response = await servicesService.getAll();
    return response.data || response || [];
  } catch (error) {
    console.error("[API] getServices ERROR:", error?.message);
    return [];
  }
};

export const createService = async (serviceData) => {
  return await servicesService.create(serviceData);
};

export const updateService = async (id, serviceData) => {
  return await servicesService.update(id, serviceData);
};

export const deleteService = async (id) => {
  return await servicesService.delete(id);
};

export const toggleServiceStatus = async (service) => {
  const newStatus = service.estado === 'Activo' ? 'inactivo' : 'activo';
  return await servicesService.changeStatus(service.id, newStatus);
};

export const searchServices = async (query) => {
  try {
    const response = await servicesService.search(query);
    return response.data || response || [];
  } catch (error) {
    console.error("[API] searchServices ERROR:", error?.message);
    return [];
  }
};

export const getServiceById = async (id) => {
  try {
    const response = await servicesService.getById(id);
    return response.data || response || null;
  } catch (error) {
    console.error("[API] getServiceById ERROR:", error?.message);
    return null;
  }
};