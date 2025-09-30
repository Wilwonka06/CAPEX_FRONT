import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de proveedores
 * Endpoints base: /api/proveedores
 */

const SUPPLIERS_ENDPOINT = '/proveedores';

export const suppliersService = {
  /**
   * Obtener todos los proveedores con paginación y filtros
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.page - Número de página (opcional)
   * @param {number} params.limit - Límite de resultados por página (opcional)
   * @param {string} params.search - Término de búsqueda (opcional)
   * @param {string} params.status - Estado del proveedor (opcional)
   * @param {string} params.city - Ciudad para filtrar (opcional)
   * @param {string} params.country - País para filtrar (opcional)
   * @returns {Promise<Object>} Lista de proveedores con metadatos de paginación
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros de consulta si existen
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.city) queryParams.append('city', params.city);
      if (params.country) queryParams.append('country', params.country);

      const url = queryParams.toString() 
        ? `${SUPPLIERS_ENDPOINT}?${queryParams.toString()}`
        : SUPPLIERS_ENDPOINT;

      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los proveedores activos (sin paginación)
   * Útil para dropdowns y selects
   * @returns {Promise<Array>} Lista de proveedores activos
   */
  getActive: async () => {
    try {
      const response = await apiRequest.get(`${SUPPLIERS_ENDPOINT}/active`);
      return response;
    } catch (error) {
      console.error('Error fetching active suppliers:', error);
      throw error;
    }
  },

  /**
   * Obtener un proveedor por ID
   * @param {number|string} id - ID del proveedor
   * @returns {Promise<Object>} Datos del proveedor
   */
  getById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del proveedor es requerido');
      }

      const response = await apiRequest.get(`${SUPPLIERS_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching supplier ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo proveedor
   * @param {Object} supplierData - Datos del proveedor
   * @param {string} supplierData.nombre - Nombre del proveedor
   * @param {string} supplierData.email - Email del proveedor
   * @param {string} supplierData.telefono - Teléfono del proveedor
   * @param {string} supplierData.direccion - Dirección del proveedor (opcional)
   * @param {string} supplierData.ciudad - Ciudad del proveedor (opcional)
   * @param {string} supplierData.pais - País del proveedor (opcional)
   * @param {string} supplierData.nit - NIT/RUC del proveedor (opcional)
   * @param {string} supplierData.contacto - Persona de contacto (opcional)
   * @returns {Promise<Object>} Proveedor creado
   */
  create: async (supplierData) => {
    try {
      // Validaciones básicas
      if (!supplierData.nombre || supplierData.nombre.trim() === '') {
        throw new Error('El nombre del proveedor es requerido');
      }
      if (!supplierData.email || supplierData.email.trim() === '') {
        throw new Error('El email del proveedor es requerido');
      }
      if (!supplierData.telefono || supplierData.telefono.trim() === '') {
        throw new Error('El teléfono del proveedor es requerido');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(supplierData.email)) {
        throw new Error('El formato del email no es válido');
      }

      // Limpiar datos
      const cleanData = {
        ...supplierData,
        nombre: supplierData.nombre.trim(),
        email: supplierData.email.trim().toLowerCase(),
        telefono: supplierData.telefono.trim(),
        direccion: supplierData.direccion?.trim() || '',
        ciudad: supplierData.ciudad?.trim() || '',
        pais: supplierData.pais?.trim() || '',
        nit: supplierData.nit?.trim() || '',
        contacto: supplierData.contacto?.trim() || '',
      };

      const response = await apiRequest.post(SUPPLIERS_ENDPOINT, cleanData);
      return response;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  },

  /**
   * Actualizar un proveedor existente
   * @param {number|string} id - ID del proveedor
   * @param {Object} supplierData - Datos actualizados del proveedor
   * @returns {Promise<Object>} Proveedor actualizado
   */
  update: async (id, supplierData) => {
    try {
      if (!id) {
        throw new Error('ID del proveedor es requerido');
      }

      // Validaciones básicas
      if (supplierData.nombre && supplierData.nombre.trim() === '') {
        throw new Error('El nombre del proveedor no puede estar vacío');
      }
      if (supplierData.email && supplierData.email.trim() === '') {
        throw new Error('El email del proveedor no puede estar vacío');
      }
      if (supplierData.telefono && supplierData.telefono.trim() === '') {
        throw new Error('El teléfono del proveedor no puede estar vacío');
      }

      // Validar formato de email si se proporciona
      if (supplierData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(supplierData.email)) {
          throw new Error('El formato del email no es válido');
        }
      }

      // Limpiar datos
      const cleanData = { ...supplierData };
      if (cleanData.nombre) cleanData.nombre = cleanData.nombre.trim();
      if (cleanData.email) cleanData.email = cleanData.email.trim().toLowerCase();
      if (cleanData.telefono) cleanData.telefono = cleanData.telefono.trim();
      if (cleanData.direccion) cleanData.direccion = cleanData.direccion.trim();
      if (cleanData.ciudad) cleanData.ciudad = cleanData.ciudad.trim();
      if (cleanData.pais) cleanData.pais = cleanData.pais.trim();
      if (cleanData.nit) cleanData.nit = cleanData.nit.trim();
      if (cleanData.contacto) cleanData.contacto = cleanData.contacto.trim();

      const response = await apiRequest.put(`${SUPPLIERS_ENDPOINT}/${id}`, cleanData);
      return response;
    } catch (error) {
      console.error(`Error updating supplier ${id}:`, error);
      throw error;
    }
  },

  /**
   * Actualización parcial de un proveedor
   * @param {number|string} id - ID del proveedor
   * @param {Object} partialData - Datos parciales a actualizar
   * @returns {Promise<Object>} Proveedor actualizado
   */
  patch: async (id, partialData) => {
    try {
      if (!id) {
        throw new Error('ID del proveedor es requerido');
      }

      const response = await apiRequest.patch(`${SUPPLIERS_ENDPOINT}/${id}`, partialData);
      return response;
    } catch (error) {
      console.error(`Error patching supplier ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar un proveedor
   * @param {number|string} id - ID del proveedor
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  delete: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del proveedor es requerido');
      }

      const response = await apiRequest.delete(`${SUPPLIERS_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting supplier ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cambiar estado de un proveedor (activar/desactivar)
   * @param {number|string} id - ID del proveedor
   * @param {string} status - Nuevo estado ('activo' | 'inactivo')
   * @returns {Promise<Object>} Proveedor con estado actualizado
   */
  changeStatus: async (id, status) => {
    try {
      if (!id) {
        throw new Error('ID del proveedor es requerido');
      }
      if (!['activo', 'inactivo'].includes(status)) {
        throw new Error('Estado debe ser "activo" o "inactivo"');
      }

      const response = await apiRequest.patch(`${SUPPLIERS_ENDPOINT}/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error(`Error changing supplier status ${id}:`, error);
      throw error;
    }
  },

  /**
   * Buscar proveedores por término
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

      return await suppliersService.getAll(params);
    } catch (error) {
      console.error('Error searching suppliers:', error);
      throw error;
    }
  },

  /**
   * Obtener proveedores por ciudad
   * @param {string} city - Ciudad
   * @param {Object} params - Parámetros adicionales (opcional)
   * @returns {Promise<Object>} Proveedores de la ciudad
   */
  getByCity: async (city, params = {}) => {
    try {
      if (!city || city.trim() === '') {
        throw new Error('Ciudad es requerida');
      }

      const queryParams = {
        city: city.trim(),
        ...params
      };

      return await suppliersService.getAll(queryParams);
    } catch (error) {
      console.error(`Error fetching suppliers by city ${city}:`, error);
      throw error;
    }
  },

  /**
   * Obtener proveedores por país
   * @param {string} country - País
   * @param {Object} params - Parámetros adicionales (opcional)
   * @returns {Promise<Object>} Proveedores del país
   */
  getByCountry: async (country, params = {}) => {
    try {
      if (!country || country.trim() === '') {
        throw new Error('País es requerido');
      }

      const queryParams = {
        country: country.trim(),
        ...params
      };

      return await suppliersService.getAll(queryParams);
    } catch (error) {
      console.error(`Error fetching suppliers by country ${country}:`, error);
      throw error;
    }
  },

  /**
   * Obtener productos de un proveedor
   * @param {number|string} id - ID del proveedor
   * @param {Object} params - Parámetros de consulta (opcional)
   * @returns {Promise<Object>} Productos del proveedor
   */
  getProducts: async (id, params = {}) => {
    try {
      if (!id) {
        throw new Error('ID del proveedor es requerido');
      }

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);

      const url = queryParams.toString() 
        ? `${SUPPLIERS_ENDPOINT}/${id}/products?${queryParams.toString()}`
        : `${SUPPLIERS_ENDPOINT}/${id}/products`;

      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      console.error(`Error fetching products for supplier ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de un proveedor
   * @param {number|string} id - ID del proveedor
   * @returns {Promise<Object>} Estadísticas del proveedor
   */
  getStats: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del proveedor es requerido');
      }

      const response = await apiRequest.get(`${SUPPLIERS_ENDPOINT}/${id}/stats`);
      return response;
    } catch (error) {
      console.error(`Error fetching supplier stats ${id}:`, error);
      throw error;
    }
  },

  /**
   * Verificar si un proveedor puede ser eliminado
   * @param {number|string} id - ID del proveedor
   * @returns {Promise<Object>} Información sobre si puede ser eliminado
   */
  canDelete: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del proveedor es requerido');
      }

      const response = await apiRequest.get(`${SUPPLIERS_ENDPOINT}/${id}/can-delete`);
      return response;
    } catch (error) {
      console.error(`Error checking if supplier can be deleted ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtener historial de compras de un proveedor
   * @param {number|string} id - ID del proveedor
   * @param {Object} params - Parámetros de consulta (opcional)
   * @returns {Promise<Object>} Historial de compras
   */
  getPurchaseHistory: async (id, params = {}) => {
    try {
      if (!id) {
        throw new Error('ID del proveedor es requerido');
      }

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const url = queryParams.toString() 
        ? `${SUPPLIERS_ENDPOINT}/${id}/purchase-history?${queryParams.toString()}`
        : `${SUPPLIERS_ENDPOINT}/${id}/purchase-history`;

      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      console.error(`Error fetching purchase history for supplier ${id}:`, error);
      throw error;
    }
  },

  /**
   * Validar NIT/RUC de proveedor
   * @param {string} nit - NIT/RUC a validar
   * @param {number|string} excludeId - ID del proveedor a excluir de la validación (opcional)
   * @returns {Promise<Object>} Resultado de la validación
   */
  validateNit: async (nit, excludeId = null) => {
    try {
      if (!nit || nit.trim() === '') {
        throw new Error('NIT/RUC es requerido');
      }

      const params = { nit: nit.trim() };
      if (excludeId) params.excludeId = excludeId;

      const queryParams = new URLSearchParams(params);
      const response = await apiRequest.get(`${SUPPLIERS_ENDPOINT}/validate-nit?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Error validating supplier NIT:', error);
      throw error;
    }
  },

  /**
   * Validar email de proveedor
   * @param {string} email - Email a validar
   * @param {number|string} excludeId - ID del proveedor a excluir de la validación (opcional)
   * @returns {Promise<Object>} Resultado de la validación
   */
  validateEmail: async (email, excludeId = null) => {
    try {
      if (!email || email.trim() === '') {
        throw new Error('Email es requerido');
      }

      const params = { email: email.trim().toLowerCase() };
      if (excludeId) params.excludeId = excludeId;

      const queryParams = new URLSearchParams(params);
      const response = await apiRequest.get(`${SUPPLIERS_ENDPOINT}/validate-email?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Error validating supplier email:', error);
      throw error;
    }
  },
};

export default suppliersService;