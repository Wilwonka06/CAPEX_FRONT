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
   * @returns {Promise<Object>} Lista de servicios con metadatos
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.categoryId) queryParams.append('categoryId', params.categoryId);
      if (params.status) queryParams.append('status', params.status);

      const url = queryParams.toString() 
        ? `${SERVICES_ENDPOINT}?${queryParams.toString()}`
        : SERVICES_ENDPOINT;

      const response = await apiRequest.get(url);
      
      // Normalizar respuesta
      if (response.success && response.data) {
        const mappedServices = response.data.map(service => ({
          // IDs
          id: service.id_servicio || service.id,
          id_servicio: service.id_servicio || service.id,
          
          // Información básica
          nombre: service.nombre || '',
          descripcion: service.descripcion || '',
          
          // Duración y precio
          duracion: parseInt(service.duracion) || 0,
          precio: parseFloat(service.precio) || 0,
          
          // Estado
          estado: service.estado || 'Activo',
          
          // Foto
          foto: service.foto || null,
          
          // Categoría
          id_categoria_servicio: service.id_categoria_servicio || null,
          categoria: service.categoria || null,
          
          // Fechas
          createdAt: service.createdAt || service.fecha_creacion,
          updatedAt: service.updatedAt || service.fecha_actualizacion,
        }));

        return {
          ...response,
          data: mappedServices
        };
      }

      return response;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los servicios activos
   * @returns {Promise<Array>} Lista de servicios activos
   */
  getActive: async () => {
    try {
      const response = await apiRequest.get(`${SERVICES_ENDPOINT}?status=Activo`);
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
      
      if (response.success && response.data) {
        const service = response.data;
        return {
          ...response,
          data: {
            id: service.id_servicio || service.id,
            id_servicio: service.id_servicio || service.id,
            nombre: service.nombre || '',
            descripcion: service.descripcion || '',
            duracion: parseInt(service.duracion) || 0,
            precio: parseFloat(service.precio) || 0,
            estado: service.estado || 'Activo',
            foto: service.foto || null,
            id_categoria_servicio: service.id_categoria_servicio || null,
            categoria: service.categoria || null,
            createdAt: service.createdAt || service.fecha_creacion,
            updatedAt: service.updatedAt || service.fecha_actualizacion,
          }
        };
      }

      return response;
    } catch (error) {
      console.error(`Error fetching service ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo servicio
   * @param {Object} serviceData - Datos del servicio
   * @returns {Promise<Object>} Servicio creado
   */
  create: async (serviceData) => {
    try {
      // Validaciones básicas
      if (!serviceData.nombre || serviceData.nombre.trim() === '') {
        throw new Error('El nombre del servicio es requerido');
      }
      if (!serviceData.precio && serviceData.precio !== 0) {
        throw new Error('El precio es requerido');
      }
      if (!serviceData.id_categoria_servicio) {
        throw new Error('La categoría es requerida');
      }

      // Mapeo para el backend
      const mappedData = {
        nombre: serviceData.nombre.trim(),
        descripcion: serviceData.descripcion?.trim() || null,
        id_categoria_servicio: parseInt(serviceData.id_categoria_servicio),
        duracion: parseInt(serviceData.duracion) || 0,
        precio: parseFloat(serviceData.precio),
        foto: serviceData.foto || null,
        estado: serviceData.estado || 'Activo',
      };

      console.log('API Service: Sending data to backend:', mappedData);
      const response = await apiRequest.post(SERVICES_ENDPOINT, mappedData);
      console.log('API Service: Response received:', response);
      return response;
    } catch (error) {
      console.error('Error creating service:', error);
      console.error('Error details:', error.response?.data || error.message);
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

      console.log('API Service: Updating service', id, 'with data:', serviceData);

      // Mapeo para el backend
      const mappedData = {
        nombre: serviceData.nombre?.trim(),
        descripcion: serviceData.descripcion?.trim() || null,
        duracion: parseInt(serviceData.duracion),
        precio: parseFloat(serviceData.precio),
      };

      // Mapear categoryId si existe
      if (serviceData.id_categoria_servicio) {
        mappedData.id_categoria_servicio = parseInt(serviceData.id_categoria_servicio);
      }

      // Mapear foto si existe
      if (serviceData.foto !== undefined) {
        mappedData.foto = serviceData.foto;
      }

      // Mapear estado si existe
      if (serviceData.estado) {
        mappedData.estado = serviceData.estado;
      }

      console.log('API Service: Sending update data:', mappedData);
      const response = await apiRequest.put(`${SERVICES_ENDPOINT}/${id}`, mappedData);
      return response;
    } catch (error) {
      console.error(`Error updating service ${id}:`, error);
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
   * @param {string} status - Nuevo estado ('Activo' | 'Inactivo')
   * @returns {Promise<Object>} Servicio con estado actualizado
   */
  changeStatus: async (id, status) => {
    try {
      console.log('Front-end: changeStatus called with id:', id, 'status:', status);
      if (!id) {
        throw new Error('ID del servicio es requerido');
      }
      if (!['Activo', 'Inactivo'].includes(status)) {
        throw new Error('Estado debe ser "Activo" o "Inactivo"');
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
};

export default servicesService;