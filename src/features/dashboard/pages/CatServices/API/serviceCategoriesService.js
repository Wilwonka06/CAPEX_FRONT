import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de categorías de servicios
 * Endpoints base: /api/categorias-servicios
 */

const SERVICE_CATEGORIES_ENDPOINT = '/categorias-servicios';

export const serviceCategoriesService = {
  /**
   * Obtener todas las categorías de servicios
   * @param {Object} params - Parámetros de consulta (opcional)
   * @returns {Promise<Array>} Lista de categorías
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);

      const url = queryParams.toString()
        ? `${SERVICE_CATEGORIES_ENDPOINT}?${queryParams.toString()}`
        : SERVICE_CATEGORIES_ENDPOINT;

      const response = await apiRequest.get(url, { timeout: 12000 });

      // Normalización defensiva de la respuesta
      let list = [];
      if (Array.isArray(response)) {
        list = response;
      } else if (response?.data && Array.isArray(response.data)) {
        list = response.data;
      } else if (response?.results && Array.isArray(response.results)) {
        list = response.results;
      }

      // Asegurar campos esperados por la UI
      return list.map((item) => ({
        id_categoria_servicio: item.id_categoria_servicio ?? item.id ?? item.idCategoria ?? item.ID,
        nombre: item.nombre ?? item.name ?? item.categoria ?? "",
        descripcion: item.descripcion ?? item.description ?? "",
        estado: item.estado ?? (item.isActive === false ? "Inactivo" : "Activo"),
        createdAt: item.createdAt ?? item.fecha_creacion,
        updatedAt: item.updatedAt ?? item.fecha_actualizacion,
      }));
    } catch (error) {
      console.error("[API] getAll service categories ERROR:", error?.message);
      return [];
    }
  },

  /**
   * Obtener categorías activas (para dropdowns)
   * @returns {Promise<Array>} Lista de categorías activas
   */
  getActive: async () => {
    try {
      const response = await serviceCategoriesService.getAll({ status: 'activo' });
      return response.filter(cat => cat.estado === 'Activo');
    } catch (error) {
      console.error("[API] getActive service categories ERROR:", error?.message);
      return [];
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
      return response?.data || response;
    } catch (error) {
      console.error(`[API] getById service category ${id} ERROR:`, error?.message);
      throw error;
    }
  },

  /**
   * Crear nueva categoría de servicio
   * @param {Object} categoryData - Datos de la categoría
   * @returns {Promise<Object>} Categoría creada
   */
  create: async (categoryData) => {
    try {
      // Validaciones básicas
      if (!categoryData.nombre || categoryData.nombre.trim() === '') {
        throw new Error('El nombre de la categoría es requerido');
      }

      const payload = {
        nombre: categoryData.nombre.trim(),
        descripcion: categoryData.descripcion?.trim() || '',
        estado: categoryData.estado ?? "Activo",
      };

      console.log("[API] POST service category payload ->", payload);
      const response = await apiRequest.post(SERVICE_CATEGORIES_ENDPOINT, payload);
      console.log("[API] POST service category response ->", response);
      
      return response?.data || response;
    } catch (error) {
      console.error(
        "[API] create service category ERROR:",
        error.response?.status,
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Actualizar categoría existente
   * @param {number|string} id - ID de la categoría
   * @param {Object} categoryData - Datos actualizados
   * @returns {Promise<Object>} Categoría actualizada
   */
  update: async (id, categoryData) => {
    try {
      if (!id) {
        throw new Error('ID de la categoría es requerido');
      }

      if (categoryData.nombre && categoryData.nombre.trim() === '') {
        throw new Error('El nombre de la categoría no puede estar vacío');
      }

      const payload = {
        nombre: categoryData.nombre?.trim(),
        descripcion: categoryData.descripcion?.trim() || '',
        estado: categoryData.estado ?? "Activo",
      };

      console.log("[API] PUT service category payload ->", payload);
      const response = await apiRequest.put(`${SERVICE_CATEGORIES_ENDPOINT}/${id}`, payload);
      console.log("[API] PUT service category response ->", response);
      
      return response?.data || response;
    } catch (error) {
      console.error(
        "[API] update service category ERROR:",
        error.response?.status,
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Actualización parcial de categoría
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
      return response?.data || response;
    } catch (error) {
      console.error(`[API] patch service category ${id} ERROR:`, error?.message);
      throw error;
    }
  },

  /**
   * Eliminar categoría
   * @param {number|string} id - ID de la categoría
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  delete: async (id) => {
    try {
      if (!id) {
        throw new Error('ID de la categoría es requerido');
      }

      console.log("[API] DELETE service category ID:", id);
      const response = await apiRequest.delete(`${SERVICE_CATEGORIES_ENDPOINT}/${id}`);
      console.log("[API] DELETE service category response ->", response);
      
      return response;
    } catch (error) {
      console.error(
        "[API] delete service category ERROR:",
        error.response?.status,
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Cambiar estado de categoría (toggle)
   * @param {number|string} id - ID de la categoría
   * @param {string} newStatus - Nuevo estado ('activo' | 'inactivo')
   * @returns {Promise<Object>} Categoría con estado actualizado
   */
  toggleStatus: async (id, newStatus) => {
    try {
      if (!id) {
        throw new Error('ID de la categoría es requerido');
      }

      console.log("[API] PATCH change status for ID:", id, "New status:", newStatus);
      const response = await apiRequest.patch(`${SERVICE_CATEGORIES_ENDPOINT}/${id}/status`, { 
        estado: newStatus 
      });
      console.log("[API] PATCH status response ->", response);
      
      return response?.data || response;
    } catch (error) {
      console.error(
        "[API] toggleStatus service category ERROR:",
        error.response?.status,
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Buscar categorías por término
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} filters - Filtros adicionales (opcional)
   * @returns {Promise<Array>} Resultados de búsqueda
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
      console.error('[API] search service categories ERROR:', error?.message);
      throw error;
    }
  },

  /**
   * Verificar si una categoría puede ser eliminada
   * @param {number|string} id - ID de la categoría
   * @returns {Promise<Object>} Información sobre si puede ser eliminada
   */
  canDelete: async (id) => {
    try {
      if (!id) {
        throw new Error('ID de la categoría es requerido');
      }

      const response = await apiRequest.get(`${SERVICE_CATEGORIES_ENDPOINT}/${id}/can-delete`);
      return response?.data || response;
    } catch (error) {
      console.error(`[API] canDelete service category ${id} ERROR:`, error?.message);
      throw error;
    }
  },
};

export const getServiceCategories = (params = {}) => serviceCategoriesService.getAll(params);

export default serviceCategoriesService;