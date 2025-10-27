import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de empleados
 * Endpoints base: /api/empleados
 */

const EMPLOYEES_ENDPOINT = '/empleados';

export const employeesService = {
  /**
   * Obtener todos los empleados con paginación y filtros
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.page - Número de página (opcional)
   * @param {number} params.limit - Límite de resultados por página (opcional)
   * @param {string} params.search - Término de búsqueda (opcional)
   * @param {string} params.status - Estado del empleado (opcional)
   * @returns {Promise<Object>} Lista de empleados con metadatos de paginación
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
        ? `${EMPLOYEES_ENDPOINT}?${queryParams.toString()}`
        : EMPLOYEES_ENDPOINT;

      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los empleados activos (sin paginación)
   * Útil para dropdowns y selects
   * @returns {Promise<Array>} Lista de empleados activos
   */
  getActive: async () => {
    try {
      const response = await apiRequest.get(`${EMPLOYEES_ENDPOINT}?status=activo`);
      return response;
    } catch (error) {
      console.error('Error fetching active employees:', error);
      throw error;
    }
  },

  /**
   * Obtener un empleado por ID
   * @param {number|string} id - ID del empleado
   * @returns {Promise<Object>} Datos del empleado
   */
  getById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del empleado es requerido');
      }

      const response = await apiRequest.get(`${EMPLOYEES_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching employee ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo empleado
   * @param {Object} employeeData - Datos del empleado
   * @param {string} employeeData.nombre - Nombre del empleado
   * @param {string} employeeData.documento - Documento del empleado
   * @param {string} employeeData.tipo_documento - Tipo de documento
   * @param {string} employeeData.telefono - Teléfono del empleado
   * @param {string} employeeData.correo - Correo electrónico
   * @param {string} employeeData.direccion - Dirección (opcional)
   * @param {string} employeeData.estado - Estado ('activo' | 'inactivo')
   * @returns {Promise<Object>} Empleado creado
   */
  create: async (employeeData) => {
    try {
      // Validaciones básicas
      if (!employeeData.nombre || employeeData.nombre.trim() === '') {
        throw new Error('El nombre del empleado es requerido');
      }
      if (!employeeData.documento || employeeData.documento.trim() === '') {
        throw new Error('El documento del empleado es requerido');
      }
      if (!employeeData.tipo_documento || employeeData.tipo_documento.trim() === '') {
        throw new Error('El tipo de documento es requerido');
      }
      if (!employeeData.telefono || employeeData.telefono.trim() === '') {
        throw new Error('El teléfono del empleado es requerido');
      }
      if (!employeeData.correo || employeeData.correo.trim() === '') {
        throw new Error('El correo electrónico es requerido');
      }

      // Limpiar y preparar datos
      const cleanData = {
        nombre: employeeData.nombre.trim(),
        documento: employeeData.documento.trim(),
        tipo_documento: employeeData.tipo_documento.trim(),
        telefono: employeeData.telefono.trim(),
        correo: employeeData.correo.trim(),
        direccion: employeeData.direccion?.trim() || '',
        estado: employeeData.estado || 'activo',
      };

      console.log('API Employee: Sending data to backend:', cleanData);
      const response = await apiRequest.post(EMPLOYEES_ENDPOINT, cleanData);
      return response;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },

  /**
   * Actualizar un empleado existente
   * @param {number|string} id - ID del empleado
   * @param {Object} employeeData - Datos actualizados del empleado
   * @returns {Promise<Object>} Empleado actualizado
   */
  update: async (id, employeeData) => {
    try {
      if (!id) {
        throw new Error('ID del empleado es requerido');
      }

      // Validaciones básicas
      if (employeeData.nombre && employeeData.nombre.trim() === '') {
        throw new Error('El nombre del empleado no puede estar vacío');
      }
      if (employeeData.documento && employeeData.documento.trim() === '') {
        throw new Error('El documento del empleado no puede estar vacío');
      }
      if (employeeData.correo && employeeData.correo.trim() === '') {
        throw new Error('El correo electrónico no puede estar vacío');
      }

      // Limpiar y preparar datos
      const cleanData = { ...employeeData };
      if (cleanData.nombre) cleanData.nombre = cleanData.nombre.trim();
      if (cleanData.documento) cleanData.documento = cleanData.documento.trim();
      if (cleanData.tipo_documento) cleanData.tipo_documento = cleanData.tipo_documento.trim();
      if (cleanData.telefono) cleanData.telefono = cleanData.telefono.trim();
      if (cleanData.correo) cleanData.correo = cleanData.correo.trim();
      if (cleanData.direccion) cleanData.direccion = cleanData.direccion.trim();

      console.log('Frontend: Sending update data for employee', id, ':', cleanData);
      const response = await apiRequest.put(`${EMPLOYEES_ENDPOINT}/${id}`, cleanData);
      return response;
    } catch (error) {
      console.error(`Error updating employee ${id}:`, error);
      throw error;
    }
  },

  /**
   * Actualización parcial de un empleado
   * @param {number|string} id - ID del empleado
   * @param {Object} partialData - Datos parciales a actualizar
   * @returns {Promise<Object>} Empleado actualizado
   */
  patch: async (id, partialData) => {
    try {
      if (!id) {
        throw new Error('ID del empleado es requerido');
      }

      const response = await apiRequest.patch(`${EMPLOYEES_ENDPOINT}/${id}`, partialData);
      return response;
    } catch (error) {
      console.error(`Error patching employee ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar un empleado
   * @param {number|string} id - ID del empleado
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  delete: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del empleado es requerido');
      }

      const response = await apiRequest.delete(`${EMPLOYEES_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting employee ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cambiar estado de un empleado (activar/desactivar)
   * @param {number|string} id - ID del empleado
   * @param {string} status - Nuevo estado ('activo' | 'inactivo')
   * @returns {Promise<Object>} Empleado con estado actualizado
   */
  changeStatus: async (id, status) => {
    try {
      console.log('Front-end: changeStatus called with id:', id, 'status:', status);
      if (!id) {
        throw new Error('ID del empleado es requerido');
      }
      if (!['activo', 'inactivo'].includes(status)) {
        throw new Error('Estado debe ser "activo" o "inactivo"');
      }

      const response = await apiRequest.patch(`${EMPLOYEES_ENDPOINT}/${id}/status`, { estado: status });
      console.log('Front-end: changeStatus response:', response);
      return response;
    } catch (error) {
      console.error(`Error changing employee status ${id}:`, error);
      throw error;
    }
  },

  /**
   * Buscar empleados por término
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

      return await employeesService.getAll(params);
    } catch (error) {
      console.error('Error searching employees:', error);
      throw error;
    }
  },
};

// Mantener compatibilidad con el código existente
export const getEmployees = async () => {
  try {
    const response = await employeesService.getAll();
    return response.data || response || [];
  } catch (error) {
    console.error("[API] getEmployees ERROR:", error?.message);
    return [];
  }
};

export const createEmployee = async (employeeData) => {
  return await employeesService.create(employeeData);
};

export const updateEmployee = async (id, employeeData) => {
  return await employeesService.update(id, employeeData);
};

export const deleteEmployee = async (id) => {
  return await employeesService.delete(id);
};

export const toggleEmployeeStatus = async (id, newEstado) => {
  return await employeesService.changeStatus(id, newEstado);
};

export const getEmployeeById = async (id) => {
  try {
    const response = await employeesService.getById(id);
    return response.data || response || null;
  } catch (error) {
    console.error("[API] getEmployeeById ERROR:", error?.message);
    return null;
  }
};
