// Servicio de autenticación para conectar con el backend
import { apiRequest } from '../config/apiConfig';

/**
 * Registra un nuevo usuario
 */
export const registerUser = async (userData) => {
  try {
    const result = await apiRequest.post('/auth/register', userData);
    return result;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw error;
  }
};

/**
 * Inicia sesión - el token se maneja automáticamente en cookies HttpOnly
 */
export const loginUser = async (credentials) => {
  try {
    const result = await apiRequest.post('/auth/login', credentials);

    // El token ya está en cookies HttpOnly, no lo guardamos en localStorage
    // Solo guardamos la información del usuario si es necesario
    if (result.user || result.data) {
      const userData = result.user || result.data;
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }

    return result;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
};

/**
 * Verifica si el token es válido
 */
export const verifyToken = async (token) => {
  try {
    const result = await apiRequest.post('/auth/verify', { token });
    return result;
  } catch (error) {
    console.error('Error al verificar token:', error);
    throw error;
  }
};

/**
 * Obtiene información del usuario actual
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiRequest.get('/auth/me');
    
    // Manejar diferentes estructuras de respuesta
    const user = response.data || response;

    // Actualizar información del usuario en localStorage
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }

    return user;
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    // Si es error 401, limpiar localStorage
    if (error.response?.status === 401) {
      localStorage.removeItem('currentUser');
    }
    throw error;
  }
};

/**
 * Actualiza el perfil del usuario
 */
export const updateProfile = async (profileData) => {
  try {
    const result = await apiRequest.put('/auth/profile', profileData);

    // Actualizar información del usuario en localStorage
    if (result.user || result.data) {
      const userData = result.user || result.data;
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }

    return result;
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    throw error;
  }
};

/**
 * Cierra sesión
 */
export const logoutUser = async () => {
  try {
    // Cerrar sesión en el backend (limpia la cookie HttpOnly)
    await apiRequest.post('/auth/logout');

    // Limpiar localStorage
    localStorage.removeItem('currentUser');

    return { success: true, message: 'Sesión cerrada correctamente' };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    // Aun si hay error en el backend, limpiamos localStorage
    localStorage.removeItem('currentUser');
    return { success: true, message: 'Sesión cerrada localmente' };
  }
};

/**
 * Verifica si el usuario está autenticado
 * Nota: Con cookies HttpOnly, no podemos verificar directamente desde el frontend
 * Esta función ahora verifica si hay información del usuario en localStorage
 */
export const isAuthenticated = () => {
  const user = localStorage.getItem('currentUser');
  return !!user;
};

/**
 * Obtiene el token actual
 * Nota: Con cookies HttpOnly, el token no está disponible en el frontend
 * Esta función ahora retorna null ya que el token está protegido
 */
export const getCurrentToken = () => {
  // El token está en cookies HttpOnly y no es accesible desde JavaScript
  return null;
};

