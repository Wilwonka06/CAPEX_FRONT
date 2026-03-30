
import apiRequest from '../../../../../shared/config/apiConfig';
import { mapSupplierFromBackend, mapSupplierToBackend } from '../../../../../shared/utils/entityMapper';

const SUPPLIERS_ENDPOINT = '/proveedores';

export const suppliersService = {
  getAll: async () => {
    try {
      const response = await apiRequest.get(SUPPLIERS_ENDPOINT);
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(mapSupplierFromBackend);
      }
      return [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener los proveedores');
    }
  },

  getActive: async () => {
    try {
      const response = await apiRequest.get(SUPPLIERS_ENDPOINT);
      if (response.data && Array.isArray(response.data)) {
        return response.data
          .filter(s => s.estado === 'Activo')
          .map(mapSupplierFromBackend);
      }
      return [];
    } catch (error) {
      console.error('Error fetching active suppliers:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener proveedores activos');
    }
  },

  getById: async (id) => {
    try {
      const response = await apiRequest.get(`${SUPPLIERS_ENDPOINT}/${id}`);
      return response.data ? mapSupplierFromBackend(response.data) : null;
    } catch (error) {
      console.error('Error fetching supplier:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener el proveedor');
    }
  },

  create: async (supplierData) => {
    try {
      const backendData = mapSupplierToBackend(supplierData);
      const response = await apiRequest.post(SUPPLIERS_ENDPOINT, backendData);
      return response.data ? mapSupplierFromBackend(response.data) : response;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw new Error(error.response?.data?.message || 'Error al crear el proveedor');
    }
  },

  update: async (id, supplierData) => {
    try {
      const backendData = mapSupplierToBackend(supplierData);
      const response = await apiRequest.put(`${SUPPLIERS_ENDPOINT}/${id}`, backendData);
      return response.data ? mapSupplierFromBackend(response.data) : response;
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar el proveedor');
    }
  },

  delete: async (id) => {
    try {
      await apiRequest.delete(`${SUPPLIERS_ENDPOINT}/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar el proveedor');
    }
  },

  search: async (nombre) => {
    try {
      const response = await apiRequest.get(
        `${SUPPLIERS_ENDPOINT}/search?nombre=${encodeURIComponent(nombre)}`
      );
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(mapSupplierFromBackend);
      }
      return [];
    } catch (error) {
      console.error('Error searching suppliers:', error);
      throw new Error(error.response?.data?.message || 'Error al buscar proveedores');
    }
  },

  getByStatus: async (estado) => {
    try {
      const response = await apiRequest.get(`${SUPPLIERS_ENDPOINT}/estado/${estado}`);
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(mapSupplierFromBackend);
      }
      return [];
    } catch (error) {
      console.error('Error fetching suppliers by status:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener proveedores por estado');
    }
  },
};

export default suppliersService;
