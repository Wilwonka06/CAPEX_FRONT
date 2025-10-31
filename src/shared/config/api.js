// Configuración de la API
export const API_CONFIG = {
  // URL base del backend - usa proxy en desarrollo, URL directa en producción

  BASE_URL: import.meta.env.DEV
    ? 'http://localhost:3000' 
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
  // Con cookies HttpOnly, no necesitamos agregar manualmente el header Authorization
  // Las cookies se incluyen automáticamente con credentials: 'include'
  return {
    ...DEFAULT_HEADERS,
  };
};