import { apiRequest } from '../../../shared/config/apiConfig';

/**
 * Servicio de autenticación para el frontend
 * Maneja todas las operaciones relacionadas con autenticación de usuarios
 */
export const authService = {
  /**
   * Iniciar sesión
   * @param {Object} credentials - Credenciales del usuario
   * @param {string} credentials.correo - Correo electrónico
   * @param {string} credentials.contrasena - Contraseña
   * @returns {Promise<Object>} Token y datos del usuario
   */
  async login(credentials) {
    try {
      console.log('🔐 Auth Service: Attempting login for:', credentials.correo);

      const response = await apiRequest.post('/auth/login', {
        correo: credentials.correo.trim().toLowerCase(),
        contrasena: credentials.contrasena
      });

      console.log('✅ Auth Service: Login response:', response);

      if (!response.success || !response.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      const { user } = response.data;
      return {
        success: true,
        data: { user }
      };
    } catch (error) {
      console.error('❌ Auth Service: Login error:', error);

      

      throw error;
    }
  },

  /**
   * Registrar nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario registrado
   */
  async register(userData) {
    try {
      // Validar campos requeridos
      if (!userData.nombre || !userData.correo || !userData.contrasena) {
        throw new Error('Nombre, correo y contraseña son requeridos');
      }

      // Limpiar y preparar datos
      const cleanData = {
        nombre: userData.nombre.trim(),
        correo: userData.correo.trim().toLowerCase(),
        contrasena: userData.contrasena,
        tipo_documento: userData.tipoDocumento || userData.tipo_documento || 'Cedula de ciudadania',
        documento: userData.documento?.trim() || '',
        telefono: userData.telefono?.trim() || ''
      };

      console.log('📝 Auth Service: Registering user:', cleanData.correo);

      const response = await apiRequest.post('/auth/register', cleanData);

      console.log('✅ Auth Service: Registration successful');
      return response;
    } catch (error) {
      console.error('❌ Auth Service: Register error:', error);
      throw error;
    }
  },

  /**
   * Verificar unicidad de campo
   * @param {string} field - Campo a verificar (correo, documento)
   * @param {string} value - Valor a verificar
   * @returns {Promise<boolean>} True si es único, False si existe
   */
  async checkUniqueness(field, value) {
    try {
      const response = await apiRequest.post('/auth/check-uniqueness', {
        field,
        value
      });
      return response.isUnique;
    } catch (error) {
      console.error(`❌ Auth Service: Error checking uniqueness for ${field}:`, error);
      return false; // Asumir que no es único en caso de error para evitar duplicados
    }
  },

  /**
   * Verificar token
   * @param {string} token - Token JWT
   * @returns {Promise<Object>} Información del usuario
   */
  async verifyToken(token) {
    try {
      const payload = token ? { token } : {};
      const response = await apiRequest.post('/auth/verify', payload);

      console.log('✅ Auth Service: Token valid');
      return response;
    } catch (error) {
      console.error('❌ Auth Service: Token verification error:', error);
      throw error;
    }
  },

  /**
   * Obtener información del usuario actual
   * @returns {Promise<Object>} Información del usuario
   */
  async getCurrentUser() {
    try {
      console.log('👤 Auth Service: Getting current user');

      const response = await apiRequest.get('/auth/me');

      console.log('✅ Auth Service: User data received');
      return response;
    } catch (error) {
      console.error('❌ Auth Service: Get current user error:', error);

      

      throw error;
    }
  },

  /**
   * Editar perfil del usuario
   * @param {Object} profileData - Datos del perfil
   * @returns {Promise<Object>} Usuario actualizado
   */
  async editProfile(profileData) {
    try {
      console.log('✏️ Auth Service: Editing profile');

      const response = await apiRequest.put('/auth/profile', profileData);

      console.log('✅ Auth Service: Profile updated');
      return response;
    } catch (error) {
      console.error('❌ Auth Service: Edit profile error:', error);
      throw error;
    }
  },

  /**
   * Cerrar sesión
   * @returns {Promise<Object>} Confirmación de logout
   */
  async logout() {
    try {
      console.log('👋 Auth Service: Logging out');

      const response = await apiRequest.post('/auth/logout');

      console.log('✅ Auth Service: Logout successful');
      return response;
    } catch (error) {
      console.error('⚠️ Auth Service: Logout error (continuing anyway):', error);
      // Continuar con el logout incluso si falla la petición
      return { success: true };
    } finally {
      
    }
  },

  /**
   * Solicitar recuperación de contraseña
   * @param {string} email - Correo electrónico
   * @returns {Promise<Object>} Confirmación de envío
   */
  async forgotPassword(email) {
    try {
      if (!email) {
        throw new Error('Correo electrónico es requerido');
      }

      console.log('🔑 Auth Service: Requesting password reset for:', email);

      const response = await apiRequest.post('/auth/forgot-password', {
        correo: email.trim().toLowerCase()
      });

      console.log('✅ Auth Service: Password reset email sent');
      return response;
    } catch (error) {
      console.error('❌ Auth Service: Forgot password error:', error);
      throw error;
    }
  },

  /**
   * Restablecer contraseña
   * @param {Object} resetData - Datos para reset
   * @param {string} resetData.token - Token de reset
   * @param {string} resetData.newPassword - Nueva contraseña
   * @returns {Promise<Object>} Confirmación de reset
   */
  async resetPassword(resetData) {
    try {
      if (!resetData.token || !resetData.newPassword) {
        throw new Error('Token y nueva contraseña son requeridos');
      }

      console.log('🔐 Auth Service: Resetting password');

      const response = await apiRequest.post('/auth/reset-password', resetData);

      console.log('✅ Auth Service: Password reset successful');
      return response;
    } catch (error) {
      console.error('❌ Auth Service: Reset password error:', error);
      throw error;
    }
  },

  /**
   * Obtener privilegios actualizados del usuario
   * @returns {Promise<Object>} Privilegios del usuario
   */
  async getUserPrivileges() {
    try {
      console.log('🔑 Auth Service: Getting user privileges');

      const response = await apiRequest.get('/auth/privileges');

      console.log('✅ Auth Service: Privileges obtained successfully');
      return response;
    } catch (error) {
      console.error('❌ Auth Service: Get privileges error:', error);
      throw error;
    }
  }
};

export default authService;