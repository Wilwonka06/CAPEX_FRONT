// Servicio de autenticación para conectar con el backend
import { API_CONFIG } from '../config/api.js';

const BASE_URL = API_CONFIG.BASE_URL;

/**
 * Registra un nuevo usuario
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error ${response.status}: ${error}`);
    }

    const result = await response.json();
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
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include', // Importante para incluir cookies
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error ${response.status}: ${error}`);
    }

    const result = await response.json();

    // El token ya está en cookies HttpOnly, no lo guardamos en localStorage
    // Solo guardamos la información del usuario si es necesario
    if (result.user) {
      localStorage.setItem('currentUser', JSON.stringify(result.user));
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
    const response = await fetch(`${BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: Token inválido`);
    }

    const result = await response.json();
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
    const response = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Importante para incluir cookies HttpOnly
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado o inválido - limpiar localStorage
        localStorage.removeItem('currentUser');
        throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const user = await response.json();

    // Actualizar información del usuario en localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));

    return user;
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    throw error;
  }
};

/**
 * Actualiza el perfil del usuario
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Importante para incluir cookies HttpOnly
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // Actualizar información del usuario en localStorage
    if (result.user) {
      localStorage.setItem('currentUser', JSON.stringify(result.user));
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
    await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Importante para incluir cookies
    });

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

