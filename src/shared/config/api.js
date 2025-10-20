// Configuración de la API
export const API_CONFIG = {
  // URL base del backend - usa proxy en desarrollo, URL directa en producción
  BASE_URL: import.meta.env.DEV 
    ? '/api' // Proxy local en desarrollo
    : 'https://capex-back.onrender.com/api', // URL directa en producción
  
  // Timeout para las peticiones (en milisegundos)
  TIMEOUT: 30000,
  
  // Configuración de reintentos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Endpoints específicos
export const API_ENDPOINTS = {
  ROLES: '/roles',
  PRIVILEGES: '/privileges',
  USERS: '/usuarios',
  AUTH: '/auth',
  CUSTOMERS: '/customers',
  // Agregar más endpoints según sea necesario
};

// Headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Función para obtener headers con autenticación
export const getAuthHeaders = () => {
  try {
    // Intentar obtener el token JWT del localStorage
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    const headers = {
      ...DEFAULT_HEADERS,
    };
    
    // Agregar Authorization header si hay token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  } catch (error) {
    console.error('Error al obtener headers de autenticación:', error);
    return DEFAULT_HEADERS;
  }
};