import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de clientes
 * Los clientes son usuarios con rol "Cliente"
 * Endpoints base: /api/usuarios
 */

const USERS_ENDPOINT = '/usuarios';
const CUSTOMER_ROLE_NAME = 'Cliente';

/**
 * Función helper para obtener el ID del rol "Cliente"
 * Intenta obtenerlo desde el endpoint de roles disponibles
 */
let customerRoleIdCache = null;
const getCustomerRoleId = async () => {
  if (customerRoleIdCache) {
    return customerRoleIdCache;
  }

  try {
    // Intentar obtener roles disponibles desde el endpoint de usuarios
    const response = await apiRequest.get(`${USERS_ENDPOINT}/available-roles`);
    if (response.success && response.data) {
      const clienteRole = response.data.find(role => 
        role.nombre === CUSTOMER_ROLE_NAME || 
        role.nombre.toLowerCase() === 'cliente'
      );
      if (clienteRole) {
        customerRoleIdCache = clienteRole.id_rol || clienteRole.id;
        return customerRoleIdCache;
      }
    }
  } catch (error) {
    console.warn('No se pudo obtener el ID del rol Cliente, usando valor por defecto:', error);
  }

  // Valor por defecto: si los roles se crean en orden, Cliente suele ser el 3er rol (id=3)
  // Pero puede variar según la base de datos. Se intentará usar el nombre del rol en el filtro.
  customerRoleIdCache = null; // No cachear si no se encontró
  return null;
};

/**
 * Función helper para mapear datos de usuario a formato de cliente
 */
const mapUserToCustomer = (user) => {
  return {
    id: user.id_usuario || user.id,
    documentType: user.tipo_documento || 'Cedula de ciudadania',
    documentNumber: user.documento || '',
    nombre: user.nombre || '',
    // Mantener firstName y lastName para retrocompatibilidad (se derivan de nombre)
    firstName: user.nombre ? user.nombre.split(' ')[0] : '',
    lastName: user.nombre ? user.nombre.split(' ').slice(1).join(' ') : '',
    email: user.correo || '',
    phone: user.telefono || '',
    status: user.estado || 'Activo',
    createdAt: user.createdAt || user.created_at || new Date().toISOString(),
    updatedAt: user.updatedAt || user.updated_at || new Date().toISOString(),
    // Campos adicionales del usuario
    userId: user.id_usuario || user.id,
    role: user.rol?.nombre || 'Cliente',
    foto: user.foto || null,
    direccion: user.direccion || null,
    // Mantener compatibilidad con formato original
    nombre: user.nombre || '',
    tipo_documento: user.tipo_documento || 'Cedula de ciudadania',
    documento: user.documento || '',
    correo: user.correo || '',
    telefono: user.telefono || '',
    estado: user.estado || 'Activo',
  };
};

/**
 * Función helper para mapear datos de cliente a formato de usuario
 */
const mapCustomerToUser = (customerData) => {
  return {
    nombre: customerData.firstName && customerData.lastName
      ? `${customerData.firstName} ${customerData.lastName}`.trim()
      : customerData.nombre || '',
    correo: customerData.email || customerData.correo || '',
    telefono: customerData.phone || customerData.telefono || '',
    tipo_documento: customerData.documentType || customerData.tipo_documento || 'CC',
    documento: customerData.documentNumber || customerData.documento || '',
    roleId: customerData.roleId || null, // Se asignará antes de llamar a esta función
    estado: customerData.status || customerData.estado || 'Activo',
    ...(customerData.foto && { foto: customerData.foto }),
    ...(customerData.direccion && { direccion: customerData.direccion }),
    ...(customerData.contrasena && { contrasena: customerData.contrasena }),
  };
};

export const customersService = {
  /**
   * Obtener todos los clientes con paginación y búsqueda
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.page - Número de página (opcional)
   * @param {number} params.limit - Límite de resultados por página (opcional)
   * @param {string} params.search - Término de búsqueda (opcional)
   * @returns {Promise<Object>} Lista de clientes con metadatos de paginación
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      // Obtener el ID del rol Cliente
      const roleId = await getCustomerRoleId();
      if (roleId) {
        queryParams.append('roleId', roleId.toString());
      }

      // Agregar parámetros de consulta si existen
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);

      const url = `${USERS_ENDPOINT}?${queryParams.toString()}`;
      const response = await apiRequest.get(url);

      // Filtrar clientes por rol si no se pudo obtener el roleId
      let users = response.data || [];
      if (!roleId && response.success) {
        // Filtrar por nombre del rol si no tenemos el ID
        users = users.filter(user => 
          user.rol?.nombre === CUSTOMER_ROLE_NAME || 
          user.rol?.nombre?.toLowerCase() === 'cliente'
        );
      }

      // Mapear usuarios a formato de clientes
      if (response.success) {
        const customers = users.map(mapUserToCustomer);
        const total = roleId ? (response.pagination?.total || customers.length) : customers.length;
        const limit = response.pagination?.limit || params.limit || 10;
        
        return {
          success: true,
          data: customers,
          total: total,
          page: response.pagination?.page || params.page || 1,
          limit: limit,
          totalPages: roleId 
            ? (response.pagination?.totalPages || Math.ceil(total / limit))
            : Math.ceil(customers.length / limit),
          pagination: response.pagination,
        };
      }

      return {
        success: true,
        data: [],
        total: 0,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: 0,
      };
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  /**
   * Obtener un cliente por ID
   * @param {number|string} id - ID del cliente
   * @returns {Promise<Object>} Datos del cliente
   */
  getById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del cliente es requerido');
      }

      const response = await apiRequest.get(`${USERS_ENDPOINT}/${id}`);
      
      if (response.success && response.data) {
        // Verificar que el usuario sea un cliente
        const user = response.data;
        const userRoleName = user.rol?.nombre || '';
        const isCliente = userRoleName === CUSTOMER_ROLE_NAME || 
                         userRoleName.toLowerCase() === 'cliente';
        
        if (!isCliente) {
          throw new Error('El usuario no es un cliente');
        }
        
        return {
          success: true,
          data: mapUserToCustomer(user),
        };
      }

      return response;
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo cliente
   * @param {Object} customerData - Datos del cliente
   * @returns {Promise<Object>} Cliente creado
   */
  create: async (customerData) => {
    try {
      // Validaciones básicas
      if (!customerData.firstName && !customerData.nombre) {
        throw new Error('El nombre del cliente es requerido');
      }
      if (!customerData.email && !customerData.correo) {
        throw new Error('El correo electrónico es requerido');
      }

      // Generar contraseña temporal si no se proporciona
      // La contraseña será el documento por defecto (se puede cambiar después)
      let password = customerData.contrasena || customerData.password;
      if (!password) {
        // Generar contraseña temporal basada en el documento
        const documentNumber = customerData.documentNumber || customerData.documento || '123456';
        password = `Cliente${documentNumber}`;
      }

      // Obtener el ID del rol Cliente
      const roleId = await getCustomerRoleId();
      if (!roleId) {
        throw new Error('No se pudo obtener el ID del rol Cliente. Por favor, verifica la configuración del sistema.');
      }

      // Mapear datos de cliente a formato de usuario
      const userData = mapCustomerToUser({
        ...customerData,
        contrasena: password,
        roleId: roleId, // Asegurar que se use el roleId correcto
      });

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

  /**
   * Actualizar un cliente existente
   * @param {number|string} id - ID del cliente
   * @param {Object} customerData - Datos actualizados del cliente
   * @returns {Promise<Object>} Cliente actualizado
   */
  update: async (id, customerData) => {
    try {
      if (!id) {
        throw new Error('ID del cliente es requerido');
      }

      // Validaciones básicas
      if (customerData.firstName && customerData.firstName.trim() === '') {
        throw new Error('El nombre del cliente no puede estar vacío');
      }
      if (customerData.email && customerData.email.trim() === '') {
        throw new Error('El correo electrónico no puede estar vacío');
      }

      // Mapear datos de cliente a formato de usuario
      const userData = mapCustomerToUser(customerData);
      
      // No incluir contraseña en la actualización a menos que se especifique
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

  /**
   * Eliminar un cliente
   * @param {number|string} id - ID del cliente
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  delete: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del cliente es requerido');
      }

      const response = await apiRequest.delete(`${USERS_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cambiar estado de un cliente
   * @param {number|string} id - ID del cliente
   * @param {string} nuevoEstado - Nuevo estado ('Activo', 'Inactivo', etc.)
   * @param {string} conceptoEstado - Concepto del estado (requerido si estado es Inactivo)
   * @returns {Promise<Object>} Cliente con estado actualizado
   */
  changeStatus: async (id, nuevoEstado, conceptoEstado = null) => {
    try {
      if (!id) {
        throw new Error('ID del cliente es requerido');
      }
      
      const estadosValidos = ['Activo', 'Inactivo', 'Vacaciones', 'Suspendido', 'Enfermo', 'Incapacitado', 'Luto', 'Fallecido'];
      if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error('Estado no válido');
      }

      // Validar conceptoEstado si es requerido
      if (nuevoEstado === 'Inactivo' && !conceptoEstado) {
        throw new Error('El concepto de estado es obligatorio cuando el estado es Inactivo');
      }

      const requestData = { nuevoEstado };
      if (conceptoEstado) {
        requestData.conceptoEstado = conceptoEstado;
      }

      const response = await apiRequest.patch(`${USERS_ENDPOINT}/${id}/cambiar-estado`, requestData);
      
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

  /**
   * Buscar clientes por término
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

      return await customersService.getAll(params);
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  },

  /**
   * Validar si un documento ya existe
   * @param {string} documentNumber - Número de documento
   * @param {string} documentType - Tipo de documento
   * @param {number|string} excludeId - ID a excluir de la validación (opcional)
   * @returns {Promise<Object>} Resultado de validación
   */
  validateDocument: async (documentNumber, documentType, excludeId = null) => {
    try {
      // Obtener todos los clientes
      const response = await customersService.getAll({ page: 1, limit: 1000 });
      const customers = response.data || [];
      
      const exists = customers.some(c => 
        c.documentNumber === documentNumber && 
        c.documentType === documentType &&
        (!excludeId || c.id !== parseInt(excludeId))
      );
      
      return { exists };
    } catch (error) {
      console.error('Error validating document:', error);
      throw error;
    }
  },

  /**
   * Validar si un email ya existe
   * @param {string} email - Email a validar
   * @param {number|string} excludeId - ID a excluir de la validación (opcional)
   * @returns {Promise<Object>} Resultado de validación
   */
  validateEmail: async (email, excludeId = null) => {
    try {
      // Obtener todos los clientes
      const response = await customersService.getAll({ page: 1, limit: 1000 });
      const customers = response.data || [];
      
      const exists = customers.some(c => 
        c.email.toLowerCase() === email.toLowerCase() &&
        (!excludeId || c.id !== parseInt(excludeId))
      );
      
      return { exists };
    } catch (error) {
      console.error('Error validating email:', error);
      throw error;
    }
  },
};

export default customersService;
