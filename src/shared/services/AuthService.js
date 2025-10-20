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
 * Inicia sesión y obtiene el token JWT
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error ${response.status}: ${error}`);
    }

    const result = await response.json();
    
    // Guardar token en localStorage
    if (result.token) {
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('token', result.token); // Backup
    }
    
    // Guardar información del usuario
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
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No hay token disponible');
    }

    const response = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
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
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No hay token disponible');
    }

    const response = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
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
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (token) {
      // Intentar cerrar sesión en el backend
      try {
        await fetch(`${BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.warn('Error al cerrar sesión en el backend:', error);
      }
    }
    
    // Limpiar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    
    return { success: true, message: 'Sesión cerrada correctamente' };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
};

/**
 * Verifica si el usuario está autenticado
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  return !!token;
};

/**
 * Obtiene el token actual
 */
export const getCurrentToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};

