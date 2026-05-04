import apiRequest from '../../../../../shared/config/apiConfig';

const SHIPPING_ZONES_ENDPOINT = '/shipping-zones';

export const shippingZonesService = {
  /**
   * Obtiene todas las zonas de envío
   * @param {Object} params - Parámetros de consulta (page, limit, includeInactive)
   */
  async getAll(params = {}) {
    try {
      const response = await apiRequest.get(SHIPPING_ZONES_ENDPOINT, { params });
      return response.success ? response : { success: true, data: response.data || response };
    } catch (error) {
      console.error('Error fetching shipping zones:', error);
      throw error;
    }
  },

  /**
   * Obtiene una zona de envío por ID
   */
  async getById(id) {
    try {
      return await apiRequest.get(`${SHIPPING_ZONES_ENDPOINT}/${id}`);
    } catch (error) {
      console.error(`Error fetching shipping zone ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crea una nueva zona de envío
   */
  async create(data) {
    try {
      return await apiRequest.post(SHIPPING_ZONES_ENDPOINT, data);
    } catch (error) {
      console.error('Error creating shipping zone:', error);
      throw error;
    }
  },

  /**
   * Actualiza una zona de envío
   */
  async update(id, data) {
    try {
      return await apiRequest.put(`${SHIPPING_ZONES_ENDPOINT}/${id}`, data);
    } catch (error) {
      console.error(`Error updating shipping zone ${id}:`, error);
      throw error;
    }
  },

  /**
   * Elimina (desactiva) una zona de envío
   */
  async delete(id) {
    try {
      return await apiRequest.delete(`${SHIPPING_ZONES_ENDPOINT}/${id}`);
    } catch (error) {
      console.error(`Error deleting shipping zone ${id}:`, error);
      throw error;
    }
  }
};

export default shippingZonesService;
