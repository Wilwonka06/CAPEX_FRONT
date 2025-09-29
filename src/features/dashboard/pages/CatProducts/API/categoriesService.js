import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de categorías de productos
 * Endpoints base: /api/categorias-productos
 */

const CATEGORIES_ENDPOINT = '/categorias-productos';

export const categoriesService = {
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
        ? `${CATEGORIES_ENDPOINT}?${queryParams.toString()}`
        : CATEGORIES_ENDPOINT;

      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
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
      const response = await apiRequest.get(`${CATEGORIES_ENDPOINT}/active`);
      return response;
    } catch (error) {
      console.error('Error fetching active categories:', error);
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

      const response = await apiRequest.get(`${CATEGORIES_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear una nueva categoría
   * @param {Object} categoryData - Datos de la categoría
   * @param {string} categoryData.nombre - Nombre de la categoría
   * @param {string} categoryData.descripcion - Descripción de la categoría (opcional)
   * @param {string} categoryData.codigo - Código de la categoría (opcional)
   * @param {string} categoryData.imagen - URL de la imagen (opcional)
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
      const response = await apiRequest.post(CATEGORIES_ENDPOINT, cleanData);
      return response;
    } catch (error) {
      console.error('Error creating category:', error);
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
      const { estado, ...dataWithoutEstado } = categoryData;
      const cleanData = { ...dataWithoutEstado };
      if (cleanData.nombre) {
        cleanData.nombre = cleanData.nombre.trim();
      }
      if (cleanData.descripcion) {
        cleanData.descripcion = cleanData.descripcion.trim();
      }

      const response = await apiRequest.put(`${CATEGORIES_ENDPOINT}/${id}`, cleanData);
      return response;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
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

      const response = await apiRequest.patch(`${CATEGORIES_ENDPOINT}/${id}`, partialData);
      return response;
    } catch (error) {
      console.error(`Error patching category ${id}:`, error);
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

      const response = await apiRequest.delete(`${CATEGORIES_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
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

      const response = await apiRequest.patch(`${CATEGORIES_ENDPOINT}/${id}/status`, { status });
      console.log('Front-end: changeStatus response:', response);
      return response;
    } catch (error) {
      console.error(`Error changing category status ${id}:`, error);
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

      return await categoriesService.getAll(params);
    } catch (error) {
      console.error('Error searching categories:', error);
      throw error;
    }
  },

  /**
   * Obtener categorías con productos
   * @param {Object} params - Parámetros de consulta (opcional)
   * @returns {Promise<Object>} Categorías con información de productos
   */
  getWithProducts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.includeProductCount !== undefined) {
        queryParams.append('includeProductCount', params.includeProductCount);
      }

      const url = queryParams.toString() 
        ? `${CATEGORIES_ENDPOINT}/with-products?${queryParams.toString()}`
        : `${CATEGORIES_ENDPOINT}/with-products`;

      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching categories with products:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de una categoría
   * @param {number|string} id - ID de la categoría
   * @returns {Promise<Object>} Estadísticas de la categoría
   */
  getStats: async (id) => {
    try {
      if (!id) {
        throw new Error('ID de la categoría es requerido');
      }

      const response = await apiRequest.get(`${CATEGORIES_ENDPOINT}/${id}/stats`);
      return response;
    } catch (error) {
      console.error(`Error fetching category stats ${id}:`, error);
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

      const response = await apiRequest.get(`${CATEGORIES_ENDPOINT}/${id}/can-delete`);
      return response;
    } catch (error) {
      console.error(`Error checking if category can be deleted ${id}:`, error);
      throw error;
    }
  },

  /**
   * Subir imagen de categoría
   * @param {number|string} id - ID de la categoría
   * @param {File} imageFile - Archivo de imagen
   * @param {Function} onUploadProgress - Callback de progreso (opcional)
   * @returns {Promise<Object>} Categoría con imagen actualizada
   */
  uploadImage: async (id, imageFile, onUploadProgress = null) => {
    try {
      if (!id) {
        throw new Error('ID de la categoría es requerido');
      }
      if (!imageFile) {
        throw new Error('Archivo de imagen es requerido');
      }

      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await apiRequest.post(
        `${CATEGORIES_ENDPOINT}/${id}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: onUploadProgress ? (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onUploadProgress(percentCompleted);
          } : undefined,
        }
      );

      return response;
    } catch (error) {
      console.error(`Error uploading image for category ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtener jerarquía de categorías (si el backend soporta categorías anidadas)
   * @returns {Promise<Array>} Árbol de categorías
   */
  getHierarchy: async () => {
    try {
      const response = await apiRequest.get(`${CATEGORIES_ENDPOINT}/hierarchy`);
      return response;
    } catch (error) {
      console.error('Error fetching category hierarchy:', error);
      throw error;
    }
  },
};

export default categoriesService;