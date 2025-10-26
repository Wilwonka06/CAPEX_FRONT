import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de características de productos
 * Endpoints base: /api/caracteristicas
 */

const CHARACTERISTICS_ENDPOINT = '/caracteristicas';

export const characteristicsService = {
  /**
   * Obtener todas las características
   * @returns {Promise<Object>} Lista de características
   */
  getAll: async () => {
    try {
      const response = await apiRequest.get(CHARACTERISTICS_ENDPOINT);
      return response;
    } catch (error) {
      console.error('Error fetching characteristics:', error);
      throw error;
    }
  },

  /**
   * Obtener una característica por ID
   * @param {number|string} id - ID de la característica
   * @returns {Promise<Object>} Datos de la característica
   */
  getById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID de la característica es requerido');
      }

      const response = await apiRequest.get(`${CHARACTERISTICS_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching characteristic ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear una nueva característica
   * @param {Object} characteristicData - Datos de la característica
   * @param {string} characteristicData.nombre - Nombre de la característica
   * @returns {Promise<Object>} Característica creada
   */
  create: async (characteristicData) => {
    try {
      if (!characteristicData.nombre || characteristicData.nombre.trim() === '') {
        throw new Error('El nombre de la característica es requerido');
      }

      const response = await apiRequest.post(CHARACTERISTICS_ENDPOINT, {
        nombre: characteristicData.nombre.trim()
      });
      return response;
    } catch (error) {
      console.error('Error creating characteristic:', error);
      throw error;
    }
  },

  /**
   * Actualizar una característica existente
   * @param {number|string} id - ID de la característica
   * @param {Object} characteristicData - Datos actualizados de la característica
   * @returns {Promise<Object>} Característica actualizada
   */
  update: async (id, characteristicData) => {
    try {
      if (!id) {
        throw new Error('ID de la característica es requerido');
      }

      if (characteristicData.nombre && characteristicData.nombre.trim() === '') {
        throw new Error('El nombre de la característica no puede estar vacío');
      }

      const response = await apiRequest.put(`${CHARACTERISTICS_ENDPOINT}/${id}`, {
        nombre: characteristicData.nombre?.trim()
      });
      return response;
    } catch (error) {
      console.error(`Error updating characteristic ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar una característica
   * @param {number|string} id - ID de la característica
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  delete: async (id) => {
    try {
      if (!id) {
        throw new Error('ID de la característica es requerido');
      }

      const response = await apiRequest.delete(`${CHARACTERISTICS_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting characteristic ${id}:`, error);
      throw error;
    }
  }
};

export default characteristicsService;