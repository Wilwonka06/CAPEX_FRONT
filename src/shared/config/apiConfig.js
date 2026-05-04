import axios from 'axios';
import { showError } from '../utils/toastUtils';

// ─────────────────────────────────────────────────────────────
// URL BASE — Resuelta por entorno usando variables de Vite
// ─────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : import.meta.env.DEV
    ? 'http://localhost:3000/api'
    : 'https://capex-back.onrender.com/api';

if (import.meta.env.DEV) {
  console.log('🔵 API Config:', {
    BASE_URL,
    MODE: import.meta.env.MODE,
    TIP: 'Configura VITE_API_URL en .env.local para cambiar el backend',
  });
}

// ─────────────────────────────────────────────────────────────
// FLAG PARA PREVENIR MÚLTIPLES REDIRECTS EN 401
// ─────────────────────────────────────────────────────────────
let isRedirecting = false;

// ─────────────────────────────────────────────────────────────
// INSTANCIA DE AXIOS
// ─────────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// ─────────────────────────────────────────────────────────────
// INTERCEPTOR DE REQUEST
// ─────────────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Obtener el token de localStorage
    const token = localStorage.getItem('authToken');
    
    // Si el token existe, agregarlo a los headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(`🔵 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    if (import.meta.env.DEV) console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────
// INTERCEPTOR DE RESPONSE
// ─────────────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Log de errores sin datos sensibles (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
      });
    }

    // Si el caller quiere manejar el error él mismo, lo respetamos
    if (error.config?.skipGlobalErrorHandling === true) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const message = error.response?.data?.message;
    if (status === 401) {
      // Rutas donde NO queremos redirección automática al login
      const publicPaths = [
        '/',
        '/landing',
        '/landing/citas',
        '/landing/citas-cliente',
        '/landing/servicios',
        '/landing/catalogo',
        '/landing/cart',
        '/landing/pedidos',
        '/landing/mis-pedidos',
        '/landing/checkout',
        '/landing/gracias',
        '/landing/productos',
        '/catalogo',
        '/servicios',
      ];

      const currentPath = window.location.pathname;
      const isPublicPage =
        currentPath === '/' ||
        publicPaths.some(path => currentPath === path || currentPath.startsWith(path + '/'));

      if (!isPublicPage && !isRedirecting) {
        isRedirecting = true;
        showError('Tu sesión ha expirado.');
        setTimeout(() => {
          isRedirecting = false;
          window.location.href = '/iniciar-sesion';
        }, 1000);
      }

      return Promise.reject(error);
    }

    if (status === 403) {
      showError('No tienes permisos para realizar esta acción.');
      return Promise.reject(error);
    }

    if (status === 404) {
      // No mostrar toast para 404 — el componente lo maneja
      return Promise.reject(error);
    }

    if (status >= 500) {
      showError(message || 'Error interno del servidor. Intenta de nuevo más tarde.');
      return Promise.reject(error);
    }

    if (!error.response) {
      showError('No se puede conectar al servidor. Verifica tu conexión a internet.');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL DE REQUEST
// ─────────────────────────────────────────────────────────────
const apiRequest = {
  get: (url, config = {}) =>
    apiClient.get(url, config).then(r => r.data),

  post: (url, data, config = {}) =>
    apiClient.post(url, data, config).then(r => r.data),

  put: (url, data, config = {}) =>
    apiClient.put(url, data, config).then(r => r.data),

  patch: (url, data, config = {}) =>
    apiClient.patch(url, data, config).then(r => r.data),

  delete: (url, config = {}) =>
    apiClient.delete(url, config).then(r => r.data),
};

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────
export const API_CONFIG = {
  BASE_URL,
  TIMEOUT: 15000,
};

export const API_ENDPOINTS = {
  ROLES: '/roles',
  PRIVILEGES: '/privileges',
  USERS: '/usuarios',
  AUTH: '/auth',
  CUSTOMERS: '/customers',
};

export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

export { apiClient, BASE_URL, apiRequest };
export default apiRequest;
