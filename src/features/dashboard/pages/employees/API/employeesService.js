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
   * @returns {Promise<Object>} Lista de empleados con metadatos
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);

      const url = queryParams.toString()
        ? `${EMPLOYEES_ENDPOINT}?${queryParams.toString()}`
        : EMPLOYEES_ENDPOINT;

      const response = await apiRequest.get(url);
      // axios devuelve response.data, así que necesitamos verificar response.data.success
      const responseData = response?.data || response;
      const employeesData = responseData?.success ? responseData.data : responseData;
      return Array.isArray(employeesData) ? employeesData : (employeesData?.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  /**
   * Obtener empleados activos
   * @returns {Promise<Array>} Lista de empleados activos
   */
  getActive: async () => {
    try {
      const response = await apiRequest.get(`${EMPLOYEES_ENDPOINT}?status=Activo`);
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
      return response?.success ? response.data : response;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo empleado
   * @param {Object} employeeData - Datos del empleado
   * @returns {Promise<Object>} Empleado creado
   */
  create: async (employeeData) => {
    try {
      // Validaciones básicas
      if (!employeeData.nombre || employeeData.nombre.trim() === '') {
        throw new Error('El nombre del empleado es requerido');
      }
      if (!employeeData.documento) {
        throw new Error('El documento es requerido');
      }
      if (!employeeData.correo) {
        throw new Error('El correo es requerido');
      }

      // Asegurar que el estado sea "Activo" por defecto si no se proporciona
      const employeeDataWithDefaults = {
        ...employeeData,
        estado: employeeData.estado || 'Activo'
      };

      console.log('API Service: Creating employee with data:', employeeDataWithDefaults);
      const response = await apiRequest.post(EMPLOYEES_ENDPOINT, employeeDataWithDefaults);
      console.log('API Service: Employee created:', response);
      return response?.success ? response.data : response;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },

  /**
   * Actualizar un empleado
   * @param {number|string} id - ID del empleado
   * @param {Object} employeeData - Datos a actualizar
   * @returns {Promise<Object>} Empleado actualizado
   */
  update: async (id, employeeData) => {
    try {
      if (!id) {
        throw new Error('ID del empleado es requerido');
      }

      console.log('API Service: Updating employee', id, 'with data:', employeeData);
      const response = await apiRequest.put(`${EMPLOYEES_ENDPOINT}/${id}`, employeeData);
      console.log('API Service: Employee updated:', response);
      return response?.success ? response.data : response;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  },

  /**
   * Cambiar el estado de un empleado (Activo/Inactivo)
   * @param {number|string} id - ID del empleado
   * @param {string} estado - Nuevo estado ('Activo' o 'Inactivo')
   * @returns {Promise<Object>} Empleado actualizado
   */
  toggleStatus: async (id, estado) => {
    try {
      if (!id) {
        throw new Error('ID del empleado es requerido');
      }
      if (!['Activo', 'Inactivo'].includes(estado)) {
        throw new Error('Estado debe ser "Activo" o "Inactivo"');
      }

      console.log('API Service: Toggling employee status', id, 'to', estado);
      const response = await apiRequest.put(`${EMPLOYEES_ENDPOINT}/${id}`, { estado });
      return response?.success ? response.data : response;
    } catch (error) {
      console.error('Error toggling employee status:', error);
      throw error;
    }
  },

  /**
   * Eliminar un empleado
   * @param {number|string} id - ID del empleado
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del empleado es requerido');
      }

      await apiRequest.delete(`${EMPLOYEES_ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  },

  /**
   * Buscar empleados por término
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} filters - Filtros adicionales
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

/**
 * Servicio de programaciones (legacy - programaciones individuales)
 * Endpoints base: /api/scheduling
 */
const SCHEDULING_ENDPOINT = '/scheduling';

export const schedulingService = {
  /**
   * Obtener todas las programaciones
   * @returns {Promise<Array>} Lista de programaciones
   */
  getAll: async () => {
    try {
      const response = await apiRequest.get(SCHEDULING_ENDPOINT);
      const schedulingsData = response?.success ? response.data : response;
      return Array.isArray(schedulingsData) ? schedulingsData : [];
    } catch (error) {
      console.error('Error fetching schedulings:', error);
      throw error;
    }
  },

  /**
   * Obtener programaciones por usuario
   * @param {number|string} idUsuario - ID del usuario
   * @returns {Promise<Array>} Lista de programaciones del usuario
   */
  getByUser: async (idUsuario) => {
    try {
      const response = await apiRequest.get(`${SCHEDULING_ENDPOINT}/usuario/${idUsuario}`);
      const schedulingsData = response?.success ? response.data : response;
      return Array.isArray(schedulingsData) ? schedulingsData : [];
    } catch (error) {
      if (error?.response?.status === 404) {
        console.warn('No se encontraron programaciones para el usuario', idUsuario);
        return [];
      }
      console.error('Error fetching schedulings by user:', error);
      throw error;
    }
  },

  /**
   * Obtener una programación por ID
   * @param {number|string} id - ID de la programación
   * @returns {Promise<Object>} Datos de la programación
   */
  getById: async (id) => {
    try {
      const response = await apiRequest.get(`${SCHEDULING_ENDPOINT}/${id}`);
      return response?.success ? response.data : response;
    } catch (error) {
      console.error('Error fetching scheduling:', error);
      throw error;
    }
  },

  /**
   * Crear una nueva programación
   * @param {Object} data - Datos de la programación
   * @returns {Promise<Object>} Programación creada
   */
  create: async (data) => {
    try {
      if (!data) throw new Error('Datos de programación requeridos');
      const mapped = {
        id_usuario: parseInt(data.empleadoId || data.id_usuario),
        fecha_inicio: data.fechaInicio || data.fecha_inicio,
        hora_entrada: data.horaInicio || data.hora_entrada,
        hora_salida: data.horaFin || data.hora_salida,
      };

      if (!mapped.id_usuario || !mapped.fecha_inicio || !mapped.hora_entrada || !mapped.hora_salida) {
        throw new Error('Campos obligatorios faltantes (empleado, fecha, hora inicio, hora fin)');
      }

      const response = await apiRequest.post(SCHEDULING_ENDPOINT, mapped);
      return response?.success ? response.data : response;
    } catch (error) {
      console.error('Error creating scheduling:', error);
      const msg = error?.response?.data?.message || error.message || 'Error al crear programación';
      throw new Error(msg);
    }
  },

  /**
   * Actualizar una programación
   * @param {number|string} id - ID de la programación
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Programación actualizada
   */
  update: async (id, data) => {
    try {
      if (!id) throw new Error('ID de la programación requerido');
      const mapped = {
        id_usuario: data?.empleadoId || data?.id_usuario,
        fecha_inicio: data?.fechaInicio || data?.fecha_inicio,
        hora_entrada: data?.horaInicio || data?.hora_entrada,
        hora_salida: data?.horaFin || data?.hora_salida,
      };

      const response = await apiRequest.put(`${SCHEDULING_ENDPOINT}/${id}`, mapped);
      return response?.success ? response.data : response;
    } catch (error) {
      console.error('Error updating scheduling:', error);
      const msg = error?.response?.data?.message || error.message || 'Error al actualizar programación';
      throw new Error(msg);
    }
  },

  /**
   * Eliminar una programación
   * @param {number|string} id - ID de la programación
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await apiRequest.delete(`${SCHEDULING_ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error deleting scheduling:', error);
      throw error;
    }
  }
};

/**
 * Servicio de programaciones recurrentes
 * Endpoints base: /api/programaciones-recurrentes
 */
const RECURRING_SCHEDULING_ENDPOINT = '/programaciones-recurrentes';

export const recurringSchedulingService = {
  /**
   * Obtener todas las programaciones recurrentes
   * @returns {Promise<Array>} Lista de programaciones recurrentes
   */
  getAll: async () => {
    try {
      const response = await apiRequest.get(RECURRING_SCHEDULING_ENDPOINT);
      const schedulingsData = response?.success ? response.data : response;
      return Array.isArray(schedulingsData) ? schedulingsData : [];
    } catch (error) {
      if (error?.response?.status === 404) {
        console.warn('Programaciones recurrentes no disponibles (404). Retornando lista vacía.');
        return [];
      }
      console.error('Error fetching recurring schedulings:', error);
      throw error;
    }
  },

  /**
   * Obtener programaciones recurrentes por usuario
   * @param {number|string} idUsuario - ID del usuario
   * @returns {Promise<Array>} Lista de programaciones recurrentes del usuario
   */
  getByUser: async (idUsuario) => {
    try {
      const response = await apiRequest.get(`${RECURRING_SCHEDULING_ENDPOINT}/usuario/${idUsuario}`);
      const schedulingsData = response?.success ? response.data : response;
      return Array.isArray(schedulingsData) ? schedulingsData : [];
    } catch (error) {
      if (error?.response?.status === 404) {
        console.warn('Programaciones recurrentes por usuario no disponibles (404). Retornando lista vacía.');
        return [];
      }
      console.error('Error fetching recurring schedulings by user:', error);
      throw error;
    }
  },

  /**
   * Obtener una programación recurrente por ID
   * @param {number|string} id - ID de la programación recurrente
   * @returns {Promise<Object>} Datos de la programación recurrente
   */
  getById: async (id) => {
    try {
      const response = await apiRequest.get(`${RECURRING_SCHEDULING_ENDPOINT}/${id}`);
      return response?.success ? response.data : response;
    } catch (error) {
      console.error('Error fetching recurring scheduling:', error);
      throw error;
    }
  },

  /**
   * Crear una nueva programación recurrente
   * @param {Object} data - Datos de la programación recurrente
   * @returns {Promise<Object>} Programación recurrente creada
   */
  create: async (data) => {
    try {
      const response = await apiRequest.post(RECURRING_SCHEDULING_ENDPOINT, data);
      return response?.success ? response.data : response;
    } catch (error) {
      console.error('Error creating recurring scheduling:', error);
      throw error;
    }
  },

  /**
   * Actualizar una programación recurrente
   * @param {number|string} id - ID de la programación recurrente
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Programación recurrente actualizada
   */
  update: async (id, data) => {
    try {
      const response = await apiRequest.put(`${RECURRING_SCHEDULING_ENDPOINT}/${id}`, data);
      return response?.success ? response.data : response;
    } catch (error) {
      console.error('Error updating recurring scheduling:', error);
      throw error;
    }
  },

  /**
   * Eliminar una programación recurrente
   * @param {number|string} id - ID de la programación recurrente
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await apiRequest.delete(`${RECURRING_SCHEDULING_ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error deleting recurring scheduling:', error);
      throw error;
    }
  }
};

/**
 * Servicio de novedades de programación
 * Endpoints base: /api/novedades
 */
const NOVEDADES_ENDPOINT = '/novedades';

export const novedadesService = {
  /**
   * Obtener todas las novedades
   * @returns {Promise<Array>} Lista de novedades
   */
  getAll: async () => {
    try {
      const response = await apiRequest.get(NOVEDADES_ENDPOINT);
      const novedadesData = response?.success ? response.data : response;
      return Array.isArray(novedadesData) ? novedadesData : [];
    } catch (error) {
      console.error('Error fetching novedades:', error);
      throw error;
    }
  },

  /**
   * Obtener novedades por usuario
   * @param {number|string} idUsuario - ID del usuario
   * @returns {Promise<Array>} Lista de novedades del usuario
   */
  getByUsuario: async (idUsuario) => {
    try {
      const response = await apiRequest.get(`${NOVEDADES_ENDPOINT}/usuario/${idUsuario}`);
      const novedadesData = response?.success ? response.data : response;
      return Array.isArray(novedadesData) ? novedadesData : [];
    } catch (error) {
      console.error('Error fetching novedades by user:', error);
      throw error;
    }
  },

  /**
   * Obtener novedades por programación recurrente
   * @param {number|string} idProgramacion - ID de la programación recurrente
   * @returns {Promise<Array>} Lista de novedades de la programación
   */
  getByProgramacion: async (idProgramacion) => {
    try {
      const response = await apiRequest.get(`${NOVEDADES_ENDPOINT}/programacion/${idProgramacion}`);
      const novedadesData = response?.success ? response.data : response;
      return Array.isArray(novedadesData) ? novedadesData : [];
    } catch (error) {
      console.error('Error fetching novedades by programacion:', error);
      throw error;
    }
  },

  /**
   * Obtener una novedad por ID
   * @param {number|string} id - ID de la novedad
   * @returns {Promise<Object>} Datos de la novedad
   */
  getById: async (id) => {
    try {
      const response = await apiRequest.get(`${NOVEDADES_ENDPOINT}/${id}`);
      return response?.success ? response.data : response;
    } catch (error) {
      console.error('Error fetching novedad:', error);
      throw error;
    }
  },

  /**
   * Crear una nueva novedad
   * @param {Object} data - Datos de la novedad
   * @returns {Promise<Object>} Novedad creada
   */
  create: async (data) => {
    try {
      const response = await apiRequest.post(NOVEDADES_ENDPOINT, data);
      return response?.success ? response.data : response;
    } catch (error) {
      console.error('Error creating novedad:', error);
      throw error;
    }
  },

  /**
   * Actualizar una novedad
   * @param {number|string} id - ID de la novedad
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Novedad actualizada
   */
  update: async (id, data) => {
    try {
      const response = await apiRequest.put(`${NOVEDADES_ENDPOINT}/${id}`, data);
      return response?.success ? response.data : response;
    } catch (error) {
      console.error('Error updating novedad:', error);
      throw error;
    }
  },

  /**
   * Eliminar una novedad
   * @param {number|string} id - ID de la novedad
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await apiRequest.delete(`${NOVEDADES_ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error deleting novedad:', error);
      throw error;
    }
  }
};

/**
 * Servicio de disponibilidad por programación recurrente
 * Endpoint: /api/programaciones-recurrentes/disponibilidad
 */
export const availabilityService = {
  check: async (idUsuario, fecha, inicio, fin) => {
    try {
      if (!idUsuario || !fecha || !inicio || !fin) {
        throw new Error('Parámetros de disponibilidad incompletos');
      }
      const url = `/programaciones-recurrentes/disponibilidad?id_usuario=${idUsuario}&fecha=${fecha}&inicio=${inicio}&fin=${fin}`;
      const response = await apiRequest.get(url);
      const data = response?.success ? response.data : response;
      return Boolean(data?.disponible ?? data?.disponible === true);
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  }
};

export default employeesService;
