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
   * @param {string} params.estado - Estado del proveedor (opcional)
   * @returns {Promise<Object>} Lista de proveedores con metadatos de paginación
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      // Agregar parámetros de consulta si existen
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.estado) queryParams.append('estado', params.estado);

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
   * Obtener proveedores activos (sin paginación)
   * Útil para dropdowns y selects
   * @returns {Promise<Array>} Lista de proveedores activos
   */
  getActive: async () => {
    try {
      const response = await apiRequest.get(`${SUPPLIERS_ENDPOINT}?estado=Activo`);
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
   * @param {string} supplierData.nit - NIT del proveedor
   * @param {string} supplierData.tipo_proveedor - Tipo de proveedor (N/J)
   * @param {string} supplierData.nombre - Nombre del proveedor
   * @param {string} supplierData.contacto - Persona de contacto (opcional)
   * @param {string} supplierData.direccion - Dirección (opcional)
   * @param {string} supplierData.correo - Correo electrónico (opcional)
   * @param {string} supplierData.telefono - Teléfono (opcional)
   * @param {string} supplierData.estado - Estado (opcional, default: Activo)
   * @returns {Promise<Object>} Proveedor creado
   */
  create: async (supplierData) => {
    try {
      // Validaciones básicas
      if (!supplierData.nit || supplierData.nit.trim() === '') {
        throw new Error('El NIT del proveedor es requerido');
      }
      if (!supplierData.tipo_proveedor) {
        throw new Error('El tipo de proveedor es requerido');
      }
      if (!supplierData.nombre || supplierData.nombre.trim() === '') {
        throw new Error('El nombre del proveedor es requerido');
      }

      // Validar formato de email si se proporciona
      if (supplierData.correo) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(supplierData.correo)) {
          throw new Error('El formato del correo no es válido');
        }
      }

      // Limpiar datos
      const cleanData = {
        nit: supplierData.nit.trim(),
        tipo_proveedor: supplierData.tipo_proveedor,
        nombre: supplierData.nombre.trim(),
        contacto: supplierData.contacto?.trim() || null,
        direccion: supplierData.direccion?.trim() || null,
        correo: supplierData.correo?.trim().toLowerCase() || null,
        telefono: supplierData.telefono?.trim() || null,
        estado: supplierData.estado || 'Activo'
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
      if (supplierData.nit && supplierData.nit.trim() === '') {
        throw new Error('El NIT del proveedor no puede estar vacío');
      }

      // Validar formato de email si se proporciona
      if (supplierData.correo) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(supplierData.correo)) {
          throw new Error('El formato del correo no es válido');
        }
      }

      // Limpiar datos
      const cleanData = { ...supplierData };
      if (cleanData.nit) cleanData.nit = cleanData.nit.trim();
      if (cleanData.nombre) cleanData.nombre = cleanData.nombre.trim();
      if (cleanData.contacto) cleanData.contacto = cleanData.contacto.trim();
      if (cleanData.direccion) cleanData.direccion = cleanData.direccion.trim();
      if (cleanData.correo) cleanData.correo = cleanData.correo.trim().toLowerCase();
      if (cleanData.telefono) cleanData.telefono = cleanData.telefono.trim();

      const response = await apiRequest.put(`${SUPPLIERS_ENDPOINT}/${id}`, cleanData);
      return response;
    } catch (error) {
      console.error(`Error updating supplier ${id}:`, error);
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
   * Obtener proveedores por estado
   * @param {string} estado - Estado (Activo/Inactivo)
   * @param {Object} params - Parámetros adicionales (opcional)
   * @returns {Promise<Object>} Proveedores del estado especificado
   */
  getByEstado: async (estado, params = {}) => {
    try {
      if (!estado || !['Activo', 'Inactivo'].includes(estado)) {
        throw new Error('Estado debe ser "Activo" o "Inactivo"');
      }

      const queryParams = {
        estado,
        ...params
      };

      return await suppliersService.getAll(queryParams);
    } catch (error) {
      console.error(`Error fetching suppliers by estado ${estado}:`, error);
      throw error;
    }
  },
};

export default suppliersService;