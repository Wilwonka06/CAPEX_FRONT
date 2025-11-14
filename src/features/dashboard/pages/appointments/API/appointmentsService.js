import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de citas
 * Endpoints base: /api/citas
 */

const APPOINTMENTS_ENDPOINT = '/citas';

export const appointmentsService = {
  /**
   * Obtener todas las citas con paginación y filtros
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.page - Número de página (opcional)
   * @param {number} params.limit - Límite de resultados por página (opcional)
   * @param {string} params.fecha_servicio - Fecha del servicio (opcional)
   * @param {string} params.estado - Estado de la cita (opcional)
   * @param {number} params.id_cliente - ID del cliente (opcional)
   * @returns {Promise<Object>} Lista de citas con metadatos de paginación
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      // Agregar parámetros de consulta si existen
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.fecha_servicio) queryParams.append('fecha_servicio', params.fecha_servicio);
      if (params.estado) queryParams.append('estado', params.estado);
      if (params.id_cliente) queryParams.append('id_cliente', params.id_cliente);

      const url = queryParams.toString()
        ? `${APPOINTMENTS_ENDPOINT}?${queryParams.toString()}`
        : APPOINTMENTS_ENDPOINT;

      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      
      // No devolver datos mock, lanzar el error para que se maneje correctamente
      throw error;
    }
  },

  /**
   * Obtener una cita por ID
   * @param {number|string} id - ID de la cita
   * @returns {Promise<Object>} Datos de la cita
   */
  getById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID de la cita es requerido');
      }

      const response = await apiRequest.get(`${APPOINTMENTS_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear una nueva cita
   * @param {Object} appointmentData - Datos de la cita
   * @param {number} appointmentData.id_cliente - ID del cliente
   * @param {string} appointmentData.fecha_servicio - Fecha del servicio (YYYY-MM-DD)
   * @param {string} appointmentData.hora_entrada - Hora de entrada (HH:MM:SS)
   * @param {string} appointmentData.hora_salida - Hora de salida (HH:MM:SS)
   * @param {string} appointmentData.estado - Estado de la cita
   * @param {number} appointmentData.valor_total - Valor total
   * @param {string} appointmentData.motivo - Motivo (opcional)
   * @param {Array} appointmentData.servicios - Array de servicios
   * @returns {Promise<Object>} Cita creada
   */
  create: async (appointmentData) => {
    try {
      console.log('Validating appointment data:', appointmentData);

      // Validaciones básicas
      // Permitir creación con id_cliente (usuario autenticado) o con cliente (usuario no autenticado)
      const hasIdCliente = appointmentData.cita?.id_cliente;
      const hasClienteData = appointmentData.cliente && 
                            appointmentData.cliente.nombre && 
                            appointmentData.cliente.correo && 
                            appointmentData.cliente.telefono;
      
      if (!appointmentData.cita) {
        console.error('Validation failed: cita missing', appointmentData);
        throw new Error('Los datos de la cita son requeridos');
      }
      
      if (!hasIdCliente && !hasClienteData) {
        console.error('Validation failed: id_cliente or cliente data missing', {
          hasCita: !!appointmentData.cita,
          cita: appointmentData.cita,
          id_cliente: appointmentData.cita?.id_cliente,
          cliente: appointmentData.cliente
        });
        throw new Error('El ID del cliente o los datos del cliente son requeridos');
      }
      if (!appointmentData.cita.fecha_servicio) {
        throw new Error('La fecha del servicio es requerida');
      }
      if (!appointmentData.servicios || !Array.isArray(appointmentData.servicios) || appointmentData.servicios.length === 0) {
        throw new Error('Al menos un servicio es requerido');
      }

      // Validar que todos los servicios tengan IDs válidos
      const invalidServices = appointmentData.servicios.filter(s => !s.id_servicio || s.id_servicio <= 0);
      if (invalidServices.length > 0) {
        console.error('Invalid services found:', invalidServices);
        throw new Error('Uno o más servicios no tienen ID válido');
      }

      // Validar que todos los empleados tengan IDs válidos
      const invalidEmployees = appointmentData.servicios.filter(s => !s.id_empleado || s.id_empleado <= 0);
      if (invalidEmployees.length > 0) {
        console.error('Invalid employees found:', invalidEmployees);
        throw new Error('Uno o más empleados no tienen ID válido');
      }

      // Estructurar datos según lo esperado por el backend
      const cleanData = {
        cita: {
          id_cliente: appointmentData.cita.id_cliente,
          fecha_servicio: appointmentData.cita.fecha_servicio,
          hora_entrada: appointmentData.cita.hora_entrada, // Asegurar que hora_entrada esté presente
          estado: appointmentData.cita.estado || 'Agendada',
          ...(appointmentData.cita.motivo && { motivo: appointmentData.cita.motivo.trim() })
        },
        servicios: appointmentData.servicios.map(s => ({
          id_servicio: s.id_servicio,
          id_empleado: s.id_empleado,
          hora_inicio: s.hora_inicio,
          cantidad: s.cantidad || 1,
          ...(s.observaciones && { observaciones: s.observaciones })
        }))
      };

      console.log('API Service: Sending appointment data to backend:', JSON.stringify(cleanData, null, 2));
      const response = await apiRequest.post(APPOINTMENTS_ENDPOINT, cleanData);
      return response;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  /**
   * Actualizar una cita existente
   * @param {number|string} id - ID de la cita
   * @param {Object} appointmentData - Datos actualizados de la cita
   * @returns {Promise<Object>} Cita actualizada
   */
  update: async (id, appointmentData) => {
    try {
      if (!id) {
        throw new Error('ID de la cita es requerido');
      }

      // Validar que todos los servicios tengan IDs válidos si se incluyen
      if (appointmentData.servicios && appointmentData.servicios.length > 0) {
        const invalidServices = appointmentData.servicios.filter(s => !s.id_servicio || s.id_servicio <= 0);
        if (invalidServices.length > 0) {
          console.error('Invalid services found:', invalidServices);
          throw new Error('Uno o más servicios no tienen ID válido');
        }

        const invalidEmployees = appointmentData.servicios.filter(s => !s.id_empleado || s.id_empleado <= 0);
        if (invalidEmployees.length > 0) {
          console.error('Invalid employees found:', invalidEmployees);
          throw new Error('Uno o más empleados no tienen ID válido');
        }
      }

      // Estructurar datos según lo esperado por el backend para actualización
      const cleanData = {
        cita: {
          ...(appointmentData.fecha_servicio && { fecha_servicio: appointmentData.fecha_servicio }),
          ...(appointmentData.estado && { estado: appointmentData.estado }),
          ...(appointmentData.motivo !== undefined && { motivo: appointmentData.motivo?.trim() }),
          ...(appointmentData.id_cliente && { id_cliente: appointmentData.id_cliente })
        },
        ...(appointmentData.servicios && {
          servicios: appointmentData.servicios.map(s => ({
            id_servicio: s.id_servicio,
            id_empleado: s.id_empleado,
            hora_inicio: s.hora_inicio,
            cantidad: s.cantidad || 1,
            ...(s.observaciones && { observaciones: s.observaciones })
          }))
        })
      };

      console.log('API Service: Updating appointment data:', JSON.stringify(cleanData, null, 2));
      const response = await apiRequest.put(`${APPOINTMENTS_ENDPOINT}/${id}`, cleanData);
      return response;
    } catch (error) {
      console.error(`Error updating appointment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cancelar una cita
   * @param {number|string} id - ID de la cita
   * @param {string} motivoCancelacion - Motivo de la cancelación (opcional)
   * @returns {Promise<Object>} Cita cancelada
   */
  cancel: async (id, motivoCancelacion = null) => {
    try {
      if (!id) {
        throw new Error('ID de la cita es requerido');
      }

      const data = motivoCancelacion ? { motivo: motivoCancelacion } : {};
      const response = await apiRequest.patch(`${APPOINTMENTS_ENDPOINT}/${id}/cancelar`, data);
      return response;
    } catch (error) {
      console.error(`Error canceling appointment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Agregar un servicio a una cita existente
   * @param {number|string} appointmentId - ID de la cita
   * @param {Object} serviceData - Datos del servicio
   * @returns {Promise<Object>} Servicio agregado
   */
  addService: async (appointmentId, serviceData) => {
    try {
      if (!appointmentId) {
        throw new Error('ID de la cita es requerido');
      }

      const response = await apiRequest.post(`${APPOINTMENTS_ENDPOINT}/${appointmentId}/servicios`, serviceData);
      return response;
    } catch (error) {
      console.error(`Error adding service to appointment ${appointmentId}:`, error);
      throw error;
    }
  },

  /**
   * Cancelar un servicio específico de una cita
   * @param {number|string} appointmentId - ID de la cita
   * @param {number|string} serviceDetailId - ID del detalle del servicio
   * @returns {Promise<Object>} Servicio cancelado
   */
  cancelService: async (appointmentId, serviceDetailId) => {
    try {
      if (!appointmentId || !serviceDetailId) {
        throw new Error('ID de la cita y del servicio son requeridos');
      }

      const response = await apiRequest.patch(`${APPOINTMENTS_ENDPOINT}/${appointmentId}/servicios/${serviceDetailId}/cancelar`);
      return response;
    } catch (error) {
      console.error(`Error canceling service ${serviceDetailId} from appointment ${appointmentId}:`, error);
      throw error;
    }
  },

  /**
   * Buscar citas por término
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

      return await appointmentsService.getAll(params);
    } catch (error) {
      console.error('Error searching appointments:', error);
      throw error;
    }
  },

  /**
   * Obtener citas por empleado
   * @param {number|string} employeeId - ID del empleado
   * @param {Object} filters - Filtros adicionales (opcional)
   * @returns {Promise<Object>} Citas del empleado
   */
  getByEmployee: async (employeeId, filters = {}) => {
    try {
      if (!employeeId) {
        throw new Error('ID del empleado es requerido');
      }

      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = queryParams.toString()
        ? `${APPOINTMENTS_ENDPOINT}/empleado/${employeeId}?${queryParams.toString()}`
        : `${APPOINTMENTS_ENDPOINT}/empleado/${employeeId}`;

      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      console.error(`Error fetching appointments for employee ${employeeId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener citas por usuario/cliente
   * @param {number|string} userId - ID del usuario
   * @param {Object} filters - Filtros adicionales (opcional)
   * @returns {Promise<Object>} Citas del usuario
   */
  getByUser: async (userId, filters = {}) => {
    try {
      if (!userId) {
        throw new Error('ID del usuario es requerido');
      }

      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = queryParams.toString()
        ? `${APPOINTMENTS_ENDPOINT}/usuario/${userId}?${queryParams.toString()}`
        : `${APPOINTMENTS_ENDPOINT}/usuario/${userId}`;

      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      console.error(`Error fetching appointments for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de citas
   * @returns {Promise<Object>} Estadísticas de citas
   */
  getStats: async () => {
    try {
      const response = await apiRequest.get(`${APPOINTMENTS_ENDPOINT}/estadisticas`);
      return response;
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
      throw error;
    }
  }
};

export default appointmentsService;