import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de citas
 * Endpoints base: /api/citas
 */

const APPOINTMENTS_ENDPOINT = '/citas';

export const appointmentsService = {
  /**
   * Obtener todas las citas con paginación y filtros
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
      throw error;
    }
  },

  /**
   * Obtener una cita por ID
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
   */
  create: async (appointmentData) => {
    try {
      console.log('Validating appointment data:', appointmentData);

      // Validaciones básicas
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
          hora_entrada: appointmentData.cita.hora_entrada,
          estado: appointmentData.cita.estado || 'Agendada',
          // Solo enviar motivo si tiene contenido, de lo contrario no enviarlo (el backend lo manejará como null)
          ...(appointmentData.cita.motivo && appointmentData.cita.motivo.trim() && { motivo: appointmentData.cita.motivo.trim() })
        },
        servicios: appointmentData.servicios.map(s => ({
          id_servicio: s.id_servicio,
          id_empleado: s.id_empleado,
          hora_inicio: s.hora_inicio,
          cantidad: s.cantidad || 1,
          ...(s.observaciones && { observaciones: s.observaciones })
        })),
        // Si hay datos de cliente para crear usuario nuevo
        ...(appointmentData.cliente && { cliente: appointmentData.cliente })
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
          ...(appointmentData.cita?.fecha_servicio && { fecha_servicio: appointmentData.cita.fecha_servicio }),
          ...(appointmentData.cita?.estado && { estado: appointmentData.cita.estado }),
          ...(appointmentData.cita?.motivo !== undefined && { motivo: appointmentData.cita.motivo?.trim() }),
          ...(appointmentData.cita?.id_cliente && { id_cliente: appointmentData.cita.id_cliente })
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
   * Obtener empleados disponibles
   */
  getEmployees: async () => {
    try {
      const response = await apiRequest.get('/empleados');
      return response;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  /**
   * Obtener servicios disponibles
   */
  getServices: async () => {
    try {
      const response = await apiRequest.get('/servicios');
      return response;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  /**
   * Obtener programación de un empleado por fecha
   */
  getEmployeeSchedule: async (employeeId, date) => {
    try {
      if (!employeeId || !date) {
        throw new Error('ID del empleado y fecha son requeridos');
      }

      const response = await apiRequest.get(`/programaciones/usuario/${employeeId}?fecha=${date}`);
      return response;
    } catch (error) {
      console.error(`Error fetching schedule for employee ${employeeId} on ${date}:`, error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de citas
   */
  getStats: async () => {
    try {
      const response = await apiRequest.get(`${APPOINTMENTS_ENDPOINT}/estadisticas`);
      return response;
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
      throw error;
    }
  },

  /**
   * TEMPORAL: Activar todas las citas canceladas y ponerlas en estado "En ejecución"
   */
  activateCanceledAppointments: async () => {
    try {
      const response = await apiRequest.post(`${APPOINTMENTS_ENDPOINT}/activar-canceladas`);
      return response;
    } catch (error) {
      console.error('Error activating canceled appointments:', error);
      throw error;
    }
  }
};

export default appointmentsService;
