import apiRequest from '../../../../../shared/config/apiConfig';
import { mapUserToCustomer, mapCustomerToUser } from '../../../../../shared/utils/entityMapper';

const USERS_ENDPOINT = '/usuarios';
const CUSTOMER_ROLE_NAME = 'Cliente';

// Cache del roleId de Cliente (sigue siendo local al módulo — es un detalle de UI, no de dominio)
let customerRoleIdCache = null;
const getCustomerRoleId = async () => {
  if (customerRoleIdCache) return customerRoleIdCache;
  try {
    const response = await apiRequest.get(`${USERS_ENDPOINT}/available-roles`);
    if (response.success && response.data) {
      const clienteRole = response.data.find(
        (role) =>
          role.nombre === CUSTOMER_ROLE_NAME ||
          role.nombre?.toLowerCase() === 'cliente'
      );
      if (clienteRole) {
        customerRoleIdCache = clienteRole.id_rol || clienteRole.id;
        return customerRoleIdCache;
      }
    }
  } catch (error) {
    console.warn('No se pudo obtener el ID del rol Cliente:', error);
  }
  customerRoleIdCache = null;
  return null;
};

export const customersService = {
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      const roleId = await getCustomerRoleId();
      if (roleId) queryParams.append('roleId', roleId.toString());
      if (params.page)   queryParams.append('page',   params.page.toString());
      if (params.limit)  queryParams.append('limit',  params.limit.toString());
      if (params.search) queryParams.append('search', params.search);

      const url = `${USERS_ENDPOINT}?${queryParams.toString()}`;
      const response = await apiRequest.get(url);

      let users = response.data || [];
      if (!roleId && response.success) {
        users = users.filter(
          (u) =>
            u.rol?.nombre === CUSTOMER_ROLE_NAME ||
            u.rol?.nombre?.toLowerCase() === 'cliente'
        );
      }

      if (response.success) {
        const customers = users.map(mapUserToCustomer);
        const total = roleId
          ? response.pagination?.total || customers.length
          : customers.length;
        const limit = response.pagination?.limit || params.limit || 10;
        return {
          success: true,
          data: customers,
          total,
          page: response.pagination?.page || params.page || 1,
          limit,
          totalPages: roleId
            ? response.pagination?.totalPages || Math.ceil(total / limit)
            : Math.ceil(customers.length / limit),
          pagination: response.pagination,
        };
      }

      return { success: true, data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      if (!id) throw new Error('ID del cliente es requerido');
      const response = await apiRequest.get(`${USERS_ENDPOINT}/${id}`);
      if (response.success && response.data) {
        const userRoleName = response.data.rol?.nombre || '';
        const isCliente =
          userRoleName === CUSTOMER_ROLE_NAME ||
          userRoleName.toLowerCase() === 'cliente';
        if (!isCliente) throw new Error('El usuario no es un cliente');
        return { success: true, data: mapUserToCustomer(response.data) };
      }
      return response;
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error);
      throw error;
    }
  },

  create: async (customerData) => {
    try {
      if (!customerData.firstName && !customerData.nombre)
        throw new Error('El nombre del cliente es requerido');
      if (!customerData.email && !customerData.correo)
        throw new Error('El correo electrónico es requerido');

      let password = customerData.contrasena || customerData.password;
      if (!password) {
        const documentNumber = customerData.documentNumber || customerData.documento || '123456';
        password = `Cliente${documentNumber}`;
      }

      const roleId = await getCustomerRoleId();
      if (!roleId)
        throw new Error(
          'No se pudo obtener el ID del rol Cliente. Por favor, verifica la configuración del sistema.'
        );

      const userData = mapCustomerToUser({ ...customerData, contrasena: password, roleId });
      console.log('API Service: Sending customer data to backend:', userData);
      const response = await apiRequest.post(USERS_ENDPOINT, userData);

      if (response.success && response.data) {
        return {
          success: true,
          data: mapUserToCustomer(response.data),
          message: response.message || 'Cliente creado exitosamente',
        };
      }
      return response;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  update: async (id, customerData) => {
    try {
      if (!id) throw new Error('ID del cliente es requerido');
      if (customerData.firstName?.trim() === '')
        throw new Error('El nombre del cliente no puede estar vacío');
      if (customerData.email?.trim() === '')
        throw new Error('El correo electrónico no puede estar vacío');

      const userData = mapCustomerToUser(customerData);
      if (!customerData.contrasena && !customerData.password) {
        delete userData.contrasena;
      } else {
        userData.contrasena = customerData.contrasena || customerData.password;
      }

      const response = await apiRequest.put(`${USERS_ENDPOINT}/${id}`, userData);
      if (response.success && response.data) {
        return {
          success: true,
          data: mapUserToCustomer(response.data),
          message: response.message || 'Cliente actualizado exitosamente',
        };
      }
      return response;
    } catch (error) {
      console.error(`Error updating customer ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      if (!id) throw new Error('ID del cliente es requerido');
      return await apiRequest.delete(`${USERS_ENDPOINT}/${id}`);
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error);
      throw error;
    }
  },

  changeStatus: async (id, nuevoEstado, conceptoEstado = null) => {
    try {
      if (!id) throw new Error('ID del cliente es requerido');
      const estadosValidos = [
        'Activo','Inactivo','Vacaciones','Suspendido',
        'Enfermo','Incapacitado','Luto','Fallecido',
      ];
      if (!estadosValidos.includes(nuevoEstado)) throw new Error('Estado no válido');
      if (nuevoEstado === 'Inactivo' && !conceptoEstado)
        throw new Error('El concepto de estado es obligatorio cuando el estado es Inactivo');

      const requestData = { nuevoEstado };
      if (conceptoEstado) requestData.conceptoEstado = conceptoEstado;

      const response = await apiRequest.patch(
        `${USERS_ENDPOINT}/${id}/cambiar-estado`,
        requestData
      );
      if (response.success && response.data) {
        return {
          success: true,
          data: mapUserToCustomer(response.data),
          message: response.message || 'Estado del cliente actualizado exitosamente',
        };
      }
      return response;
    } catch (error) {
      console.error(`Error changing customer status ${id}:`, error);
      throw error;
    }
  },

  search: async (searchTerm, filters = {}) => {
    try {
      if (!searchTerm?.trim()) throw new Error('Término de búsqueda es requerido');
      return await customersService.getAll({ search: searchTerm.trim(), ...filters });
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  },

  validateDocument: async (documentNumber, documentType, excludeId = null) => {
    try {
      const response = await customersService.getAll();
      if (!response.success) return { isValid: true };
      const duplicate = response.data.find(
        (c) =>
          c.documentNumber === documentNumber &&
          c.documentType === documentType &&
          c.id !== excludeId
      );
      return { isValid: !duplicate, isDuplicate: !!duplicate };
    } catch (error) {
      console.error('Error validating document:', error);
      return { isValid: true };
    }
  },
};

export default customersService;
