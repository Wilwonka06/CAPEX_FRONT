import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de proveedores
 * Endpoints base: /api/proveedores
 */

const SUPPLIERS_ENDPOINT = '/proveedores';

// Función para mapear la respuesta del backend al formato del frontend
const mapSupplierFromBackend = (supplier) => {
  if (!supplier) return null;

  return {
    id: supplier.id_proveedor,
    nit: supplier.nit,
    tipo: supplier.tipo_proveedor,
    nombre: supplier.nombre,
    contacto: supplier.contacto,
    direccion: supplier.direccion,
    correo: supplier.correo,
    // El teléfono viene del backend con formato +573001234567
    telefono: supplier.telefono,
    isActive: supplier.estado === 'Activo'
  };
};

// Función para mapear los datos del frontend al formato del backend
const mapSupplierToBackend = (supplier) => {
  // Limpiar el teléfono: remover guiones y espacios, dejar solo + y números
  const cleanPhone = supplier.telefono?.replace(/[-\s]/g, '').trim();

  return {
    nit: supplier.nit?.trim()?.replace(/\./g, ''),
    tipo_proveedor: supplier.tipo?.toUpperCase(),
    nombre: supplier.nombre?.trim(),
    contacto: supplier.contacto?.trim(),
    direccion: supplier.direccion?.trim(),
    correo: supplier.correo?.trim()?.toLowerCase(),
    telefono: cleanPhone,
    estado: supplier.isActive ? 'Activo' : 'Inactivo'
  };
};

export const suppliersService = {
  /**
   * Obtener todos los proveedores
   * @returns {Promise<Array>} Lista de proveedores
   */
  getAll: async () => {
    try {
      const response = await apiRequest.get(SUPPLIERS_ENDPOINT);

      // El backend retorna { success: true, data: [...], count: X }
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(mapSupplierFromBackend);
      }

      return [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener los proveedores');
    }
  },

  // ... después del método getAll()

/**
 * Obtener solo proveedores activos
 * @returns {Promise<Object>} Objeto con success y data (proveedores activos)
 */
getActive: async () => {
  try {
    const response = await apiRequest.get(SUPPLIERS_ENDPOINT);
    
    // El backend retorna { success: true, data: [...], count: X }
    if (response.data && Array.isArray(response.data)) {
      // Transformar y filtrar solo activos usando la función mapSupplierFromBackend
      const activeSuppliers = response.data
        .filter(proveedor => proveedor.estado === 'Activo')
        .map(mapSupplierFromBackend);

      return {
        success: true,
        data: activeSuppliers
      };
    }

    return {
      success: true,
      data: []
    };
  } catch (error) {
    console.error('Error fetching active suppliers:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener proveedores activos');
  }
},

// ... continúa con getById()

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

      // El backend retorna { success: true, data: {...} }
      if (response.data) {
        return mapSupplierFromBackend(response.data);
      }

      return null;
    } catch (error) {
      console.error(`Error fetching supplier ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al obtener el proveedor');
    }
  },

  /**
   * Crear un nuevo proveedor
   * @param {Object} supplierData - Datos del proveedor
   * @returns {Promise<Object>} Proveedor creado
   */
  create: async (supplierData) => {
    try {
      // Validaciones básicas
      if (!supplierData.nit || supplierData.nit.trim() === '') {
        throw new Error('El NIT del proveedor es requerido');
      }
      if (!supplierData.tipo) {
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

      const backendData = mapSupplierToBackend(supplierData);
      const response = await apiRequest.post(SUPPLIERS_ENDPOINT, backendData);

      // El backend retorna { success: true, message: '...', data: {...} }
      if (response.data) {
        return mapSupplierFromBackend(response.data);
      }

      return null;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw new Error(error.response?.data?.message || 'Error al crear el proveedor');
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

      const backendData = mapSupplierToBackend(supplierData);
      const response = await apiRequest.put(`${SUPPLIERS_ENDPOINT}/${id}`, backendData);

      // El backend retorna { success: true, message: '...', data: {...} }
      if (response.data) {
        return mapSupplierFromBackend(response.data);
      }

      return null;
    } catch (error) {
      console.error(`Error updating supplier ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al actualizar el proveedor');
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
      throw new Error(error.response?.data?.message || 'Error al eliminar el proveedor');
    }
  },

  /**
   * Buscar proveedores por nombre
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise<Array>} Resultados de búsqueda
   */
  search: async (searchTerm) => {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return await suppliersService.getAll();
      }

      const response = await apiRequest.get(`${SUPPLIERS_ENDPOINT}/search`, {
        params: { nombre: searchTerm.trim() }
      });

      // El backend retorna { success: true, data: [...], count: X }
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(mapSupplierFromBackend);
      }

      return [];
    } catch (error) {
      console.error('Error searching suppliers:', error);
      throw new Error(error.response?.data?.message || 'Error al buscar proveedores');
    }
  },

  /**
   * Obtener proveedores por estado
   * @param {string} estado - Estado (Activo/Inactivo)
   * @returns {Promise<Array>} Proveedores del estado especificado
   */
  getByEstado: async (estado) => {
    try {
      if (!estado || !['Activo', 'Inactivo'].includes(estado)) {
        throw new Error('Estado debe ser "Activo" o "Inactivo"');
      }

      const response = await apiRequest.get(`${SUPPLIERS_ENDPOINT}/estado/${estado}`);

      // El backend retorna { success: true, data: [...], count: X }
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(mapSupplierFromBackend);
      }

      return [];
    } catch (error) {
      console.error(`Error fetching suppliers by estado ${estado}:`, error);
      throw new Error(error.response?.data?.message || 'Error al obtener proveedores por estado');
    }
  },

  /**
   * Cambiar el estado de un proveedor
   * @param {number|string} id - ID del proveedor
   * @param {boolean} isActive - Nuevo estado
   * @returns {Promise<Object>} Proveedor actualizado
   */
  toggleStatus: async (id, isActive) => {
    try {
      if (!id) {
        throw new Error('ID del proveedor es requerido');
      }

      const response = await apiRequest.put(`${SUPPLIERS_ENDPOINT}/${id}`, {
        estado: isActive ? 'Activo' : 'Inactivo'
      });

      // El backend retorna { success: true, message: '...', data: {...} }
      if (response.data) {
        return mapSupplierFromBackend(response.data);
      }

      return null;
    } catch (error) {
      console.error(`Error toggling supplier status ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al cambiar el estado del proveedor');
    }
  }
};

export default suppliersService;