import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de categorías de servicios
 * Endpoints base: /api/categorias-servicios
 */

const SERVICE_CATEGORIES_ENDPOINT = '/categorias-servicios';

export const serviceCategoriesService = {
  /**
   * Obtener todas las categorías con paginación y filtros
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.page - Número de página (opcional)
   * @param {number} params.limit - Límite de resultados por página (opcional)
   * @param {string} params.search - Término de búsqueda (opcional)
   * @param {string} params.status - Estado de la categoría (opcional)
   * @returns {Promise<Object>} Lista de categorías con metadatos de paginación
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      // Agregar parámetros de consulta si existen
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);

      const url = queryParams.toString()
        ? `${SERVICE_CATEGORIES_ENDPOINT}?${queryParams.toString()}`
        : SERVICE_CATEGORIES_ENDPOINT;

      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching service categories:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las categorías activas (sin paginación)
   * Útil para dropdowns y selects
   * @returns {Promise<Array>} Lista de categorías activas
   */
  getActive: async () => {
    try {
      const response = await apiRequest.get(`${SERVICE_CATEGORIES_ENDPOINT}?status=activo`);
      return response;
    } catch (error) {
      console.error('Error fetching active service categories:', error);
      throw error;
    }
  },

  /**
   * Obtener una categoría por ID
   * @param {number|string} id - ID de la categoría
   * @returns {Promise<Object>} Datos de la categoría
   */
  getById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID de la categoría es requerido');
      }

      const response = await apiRequest.get(`${SERVICE_CATEGORIES_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching service category ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear una nueva categoría
   * @param {Object} categoryData - Datos de la categoría
   * @param {string} categoryData.nombre - Nombre de la categoría
   * @param {string} categoryData.descripcion - Descripción de la categoría (opcional)
   * @returns {Promise<Object>} Categoría creada
   */
  create: async (categoryData) => {
    try {
      // Validaciones básicas
      if (!categoryData.nombre || categoryData.nombre.trim() === '') {
        throw new Error('El nombre de la categoría es requerido');
      }

      // Limpiar datos - el estado se maneja en el backend
      const cleanData = {
        nombre: categoryData.nombre.trim(),
        descripcion: categoryData.descripcion?.trim() || '',
      };

      console.log('API Service: Sending data to backend:', cleanData);
      const response = await apiRequest.post(SERVICE_CATEGORIES_ENDPOINT, cleanData);
      return response;
    } catch (error) {
      console.error('Error creating service category:', error);
      throw error;
    }
  },

  /**
   * Actualizar una categoría existente
   * @param {number|string} id - ID de la categoría
   * @param {Object} categoryData - Datos actualizados de la categoría
   * @returns {Promise<Object>} Categoría actualizada
   */
  update: async (id, categoryData) => {
    try {
      if (!id) {
        throw new Error('ID de la categoría es requerido');
      }

      // Validaciones básicas
      if (categoryData.nombre && categoryData.nombre.trim() === '') {
        throw new Error('El nombre de la categoría no puede estar vacío');
      }

      // Limpiar datos - excluir estado para evitar validaciones
      const { ...dataWithoutEstado } = categoryData;
      const cleanData = { ...dataWithoutEstado };
      if (cleanData.nombre) {
        cleanData.nombre = cleanData.nombre.trim();
      }
      if (cleanData.descripcion) {
        cleanData.descripcion = cleanData.descripcion.trim();
      }

      console.log('Frontend: Sending update data for service category', id, ':', cleanData);
      const response = await apiRequest.put(`${SERVICE_CATEGORIES_ENDPOINT}/${id}`, cleanData);
      return response;
    } catch (error) {
      console.error(`Error updating service category ${id}:`, error);
      throw error;
    }
  },

  /**
   * Actualización parcial de una categoría
   * @param {number|string} id - ID de la categoría
   * @param {Object} partialData - Datos parciales a actualizar
   * @returns {Promise<Object>} Categoría actualizada
   */
  patch: async (id, partialData) => {
    try {
      if (!id) {
        throw new Error('ID de la categoría es requerido');
      }

      const response = await apiRequest.patch(`${SERVICE_CATEGORIES_ENDPOINT}/${id}`, partialData);
      return response;
    } catch (error) {
      console.error(`Error patching service category ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar una categoría
   * @param {number|string} id - ID de la categoría
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  delete: async (id) => {
    try {
      if (!id) {
        throw new Error('ID de la categoría es requerido');
      }

      const response = await apiRequest.delete(`${SERVICE_CATEGORIES_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting service category ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cambiar estado de una categoría (activar/desactivar)
   * @param {number|string} id - ID de la categoría
   * @param {string} status - Nuevo estado ('activo' | 'inactivo')
   * @returns {Promise<Object>} Categoría con estado actualizado
   */
  changeStatus: async (id, status) => {
    try {
      console.log('Front-end: changeStatus called with id:', id, 'status:', status);
      if (!id) {
        throw new Error('ID de la categoría es requerido');
      }
      if (!['activo', 'inactivo'].includes(status)) {
        throw new Error('Estado debe ser "activo" o "inactivo"');
      }

      const response = await apiRequest.patch(`${SERVICE_CATEGORIES_ENDPOINT}/${id}/status`, { status });
      console.log('Front-end: changeStatus response:', response);
      return response;
    } catch (error) {
      console.error(`Error changing service category status ${id}:`, error);
      throw error;
    }
  },

  /**
   * Buscar categorías por término
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

      return await serviceCategoriesService.getAll(params);
    } catch (error) {
      console.error('Error searching service categories:', error);
      throw error;
    }
  },
};

// Mantener compatibilidad con el código existente
export const getServiceCategories = async () => {
  try {
    const response = await serviceCategoriesService.getAll();
    return response.data || response || [];
  } catch (error) {
    console.error("[API] getServiceCategories ERROR:", error?.message);
    return [];
  }
};

export const createServiceCategory = async (categoryData) => {
  return await serviceCategoriesService.create(categoryData);
};

export const updateServiceCategory = async (id, categoryData) => {
  return await serviceCategoriesService.update(id, categoryData);
};

export const deleteServiceCategory = async (id) => {
  return await serviceCategoriesService.delete(id);
};

export const toggleServiceCategoryStatus = async (id, currentCategory) => {
  const newStatus = currentCategory.estado === "Activo" ? "inactivo" : "activo";
  return await serviceCategoriesService.changeStatus(id, newStatus);
};