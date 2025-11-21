import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de programaciones (legacy)
 * Endpoints base: /api/scheduling
 */

const SCHEDULING_ENDPOINT = '/scheduling';

const normalizeScheduling = (item) => ({
  id: item.id_programacion ?? item.id,
  id_usuario: item.id_usuario,
  fecha: item.fecha_inicio,
  hora_entrada: item.hora_entrada,
  hora_salida: item.hora_salida,
  fechaInicio: item.fecha_inicio,
  fechaFin: item.fecha_inicio,
  horaInicio: item.hora_entrada,
  horaFin: item.hora_salida,
  dias: [],
  repeticion: 'No se repite',
  empleadoId: item.id_usuario,
  createdAt: item.createdAt ?? new Date().toISOString(),
  updatedAt: item.updatedAt ?? new Date().toISOString(),
});

export const schedulingService = {
  /**
   * Obtener todas las programaciones
   * @returns {Promise<Array>} Lista de programaciones
   */
  getAll: async () => {
    try {
      const raw = await apiRequest.get(SCHEDULING_ENDPOINT, { timeout: 12000 });
      let list = [];
      if (Array.isArray(raw)) {
        list = raw;
      } else if (raw?.data && Array.isArray(raw.data)) {
        list = raw.data;
      } else if (raw?.results && Array.isArray(raw.results)) {
        list = raw.results;
      }
      return list.map(normalizeScheduling);
    } catch (error) {
      console.error('[schedulingService] getAll ERROR:', error?.message);
      return [];
    }
  },

  /**
   * Obtener programaciones por usuario
   * @param {number|string} userId - ID del usuario
   * @returns {Promise<Array>} Lista de programaciones del usuario
   */
  getByUser: async (userId) => {
    try {
      const raw = await apiRequest.get(`${SCHEDULING_ENDPOINT}/usuario/${userId}`, { timeout: 12000 });
      let list = [];
      if (Array.isArray(raw)) {
        list = raw;
      } else if (raw?.data && Array.isArray(raw.data)) {
        list = raw.data;
      } else if (raw?.results && Array.isArray(raw.results)) {
        list = raw.results;
      }
      return list.map(normalizeScheduling);
    } catch (error) {
      console.error('[schedulingService] getByUser ERROR:', error?.message);
      return [];
    }
  },

  /**
   * Obtener programación por ID
   * @param {number|string} id - ID de la programación
   * @returns {Promise<Object|null>} Datos de la programación
   */
  getById: async (id) => {
    try {
      const item = await apiRequest.get(`${SCHEDULING_ENDPOINT}/${id}`, { timeout: 12000 });
      if (!item) return null;
      return normalizeScheduling(item);
    } catch (error) {
      console.error('[schedulingService] getById ERROR:', error?.message);
      return null;
    }
  },

  /**
   * Buscar programaciones
   * @param {string} query - Término de búsqueda
   * @returns {Promise<Array>} Lista de programaciones encontradas
   */
  search: async (query) => {
    try {
      const raw = await apiRequest.get(`${SCHEDULING_ENDPOINT}/search`, {
        params: { q: query },
        timeout: 12000
      });
      let list = [];
      if (Array.isArray(raw)) {
        list = raw;
      } else if (raw?.data && Array.isArray(raw.data)) {
        list = raw.data;
      } else if (raw?.results && Array.isArray(raw.results)) {
        list = raw.results;
      }
      return list.map(normalizeScheduling);
    } catch (error) {
      console.error('[schedulingService] search ERROR:', error?.message);
      return [];
    }
  },

  /**
   * Crear nueva programación
   * @param {Object} scheduling - Datos de la programación
   * @returns {Promise<Object>} Programación creada
   */
  create: async (scheduling) => {
    const payload = {
      id_usuario: parseInt(scheduling.id_usuario ?? scheduling.empleadoId),
      fecha_inicio: scheduling.fecha_inicio ?? scheduling.fechaInicio ?? scheduling.fecha,
      hora_entrada: scheduling.hora_entrada ?? scheduling.horaInicio,
      hora_salida: scheduling.hora_salida ?? scheduling.horaFin,
    };

    if (!payload.id_usuario || !payload.fecha_inicio || !payload.hora_entrada || !payload.hora_salida) {
      throw new Error("Faltan campos obligatorios: id_usuario, fecha_inicio, hora_entrada, hora_salida");
    }

    try {
      const created = await apiRequest.post(SCHEDULING_ENDPOINT, payload);
      return normalizeScheduling(created);
    } catch (err) {
      console.error('[schedulingService] create ERROR:', err.response?.status, err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Actualizar programación
   * @param {number|string} id - ID de la programación
   * @param {Object} scheduling - Datos actualizados
   * @returns {Promise<Object>} Programación actualizada
   */
  update: async (id, scheduling) => {
    const payload = {
      id_usuario: parseInt(scheduling.id_usuario ?? scheduling.empleadoId),
      fecha_inicio: scheduling.fecha_inicio ?? scheduling.fechaInicio ?? scheduling.fecha,
      hora_entrada: scheduling.hora_entrada ?? scheduling.horaInicio,
      hora_salida: scheduling.hora_salida ?? scheduling.horaFin,
    };

    if (!payload.id_usuario || !payload.fecha_inicio || !payload.hora_entrada || !payload.hora_salida) {
      throw new Error("Faltan campos obligatorios para actualizar");
    }

    try {
      const updated = await apiRequest.put(`${SCHEDULING_ENDPOINT}/${id}`, payload);
      return normalizeScheduling(updated);
    } catch (err) {
      console.error('[schedulingService] update ERROR:', err.response?.status, err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Eliminar programación
   * @param {number|string} id - ID de la programación
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  delete: async (id) => {
    try {
      const res = await apiRequest.delete(`${SCHEDULING_ENDPOINT}/${id}`);
      return res;
    } catch (err) {
      console.error('[schedulingService] delete ERROR:', err.response?.status, err.response?.data || err.message);
      throw err;
    }
  },
};

// Alias para compatibilidad con código existente
export const getAllSchedulings = schedulingService.getAll;
export const getSchedulingsByUser = schedulingService.getByUser;
export const getSchedulingById = schedulingService.getById;
export const searchSchedulings = schedulingService.search;
export const createScheduling = schedulingService.create;
export const updateScheduling = schedulingService.update;
export const deleteScheduling = schedulingService.delete;
