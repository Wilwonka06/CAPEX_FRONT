import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de empleados
 * Endpoints base: /api/empleados
 */

const EMPLOYEES_ENDPOINT = '/empleados';

/**
 * Servicio de empleados
 */
export const employeesService = {
  /**
   * Obtener todos los empleados
   * @returns {Promise<Array>} Lista de empleados
   */
  getAll: async () => {
    try {
      const response = await apiRequest.get(EMPLOYEES_ENDPOINT);
      const employeesData = response?.success ? response.data : response;
      return Array.isArray(employeesData) ? employeesData : [];
    } catch (error) {
      console.error('Error fetching employees:', error);
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
      const response = await apiRequest.get(`${EMPLOYEES_ENDPOINT}/${id}`);
      return response?.success ? response.data : response;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo empleado
   * @param {Object} data - Datos del empleado
   * @returns {Promise<Object>} Empleado creado
   */
  create: async (data) => {
    try {
      const response = await apiRequest.post(EMPLOYEES_ENDPOINT, data);
      return response?.success ? response.data : response;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },

  /**
   * Actualizar un empleado
   * @param {number|string} id - ID del empleado
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Empleado actualizado
   */
  update: async (id, data) => {
    try {
      const response = await apiRequest.put(`${EMPLOYEES_ENDPOINT}/${id}`, data);
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
      // Usar el endpoint de actualización para cambiar el estado
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
      await apiRequest.delete(`${EMPLOYEES_ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }
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
      const response = await apiRequest.post(SCHEDULING_ENDPOINT, data);
      return response?.success ? response.data : response;
    } catch (error) {
      console.error('Error creating scheduling:', error);
      throw error;
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
      const response = await apiRequest.put(`${SCHEDULING_ENDPOINT}/${id}`, data);
      return response?.success ? response.data : response;
    } catch (error) {
      console.error('Error updating scheduling:', error);
      throw error;
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
