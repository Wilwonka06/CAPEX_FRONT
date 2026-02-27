import axios from 'axios';
import { showError } from '../utils/toastUtils';

// ─────────────────────────────────────────────────────────────
// URL BASE — Resuelta por entorno usando variables de Vite
// ─────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : import.meta.env.DEV
    ? 'http://localhost:3000/api'       // Fallback desarrollo
    : 'https://capex-back.onrender.com/api'; // Fallback producción

if (import.meta.env.DEV) {
  console.log('🔵 API Config:', {
    BASE_URL,
    MODE: import.meta.env.MODE,
    TIP: 'Configura VITE_API_URL en .env.local para cambiar el backend',
  });
}

// ─────────────────────────────────────────────────────────────
// INSTANCIA DE AXIOS
// ─────────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Necesario para cookies HttpOnly
});

// ─────────────────────────────────────────────────────────────
// INTERCEPTOR DE REQUEST
// ─────────────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Leer token del localStorage como fallback (las cookies HttpOnly son el método principal)
    const token = (() => {
      try { return localStorage.getItem('authToken'); } catch { return null; }
    })();

    if (token && !config.headers?.Authorization) {
      config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
    }

    // Log de requests solo en desarrollo
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
    // Log de errores siempre (no solo en dev) pero sin datos sensibles
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });

    // Si el caller quiere manejar el error él mismo, lo respetamos
    if (error.config?.skipGlobalErrorHandling === true) {
      return Promise.reject(error);
    }

    // Manejo global de errores comunes
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      // Token expirado o inválido — limpiar sesión
      try { localStorage.removeItem('authToken'); } catch {}
      showError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      // Redirigir al login sin recargar toda la app
      if (window.location.pathname !== '/iniciar-sesion') {
        window.location.href = '/iniciar-sesion';
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
  TIMEOUT: 90000,
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

export { apiClient, BASE_URL };
export default apiRequest;
