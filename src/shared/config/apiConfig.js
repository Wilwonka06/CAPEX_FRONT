import axios from 'axios';
import { showError } from '../utils/toastUtils';

const BASE_URL = import.meta.env.DEV
  ? (localStorage.getItem('apiBaseUrl') || 'http://localhost:3000/api')
  : 'https://capex-back.onrender.com/api';


// Log de configuración en desarrollo
if (import.meta.env.DEV) {
  console.log('🔵 API Configuration:', {
    BASE_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    '💡 Consejo': 'Puedes cambiar el backend en desarrollo con localStorage.setItem("apiBaseUrl", "http://localhost:3000/api")',
  });
}

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Importante para incluir cookies HttpOnly
});

// Interceptor de request - cookies HttpOnly manejan la autenticación automáticamente
apiClient.interceptors.request.use(
  (config) => {
    // Evitar interferencias del localStorage: usar cookies HttpOnly
    const token = (() => {
      try { return localStorage.getItem('authToken'); } catch { return null; }
    })();
    if (token && !config.headers?.Authorization) {
      config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
    }

    // Log de requests en desarrollo
    if (import.meta.env.DEV) {
      const fullUrl = `${config.baseURL}${config.url}`;
      console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${fullUrl}`, {
        baseURL: config.baseURL,
        url: config.url,
        withCredentials: config.withCredentials,
        headers: config.headers,
      });
    }

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor de response - manejo global de respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    // Log de responses exitosas en desarrollo
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    // Log de errores
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    const skipGlobalErrorHandling = error.config?.skipGlobalErrorHandling === true;

    // Si se omite el manejo global, solo rechazar la promesa sin mostrar toast
    if (skipGlobalErrorHandling) {
      return Promise.reject(error);
    }

    // Manejo específico de errores por código de estado
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          if (import.meta.env.DEV) {
            console.warn('Error 400:', data?.message || 'Solicitud incorrecta');
          }
          break;
        case 401: {
          localStorage.removeItem('currentUser');
          try { localStorage.removeItem('authToken'); } catch {}
          const currentPath = window.location.pathname;
          const isPublicRoute = ['/', '/login', '/iniciar-sesion', '/registrarse', '/register', '/forgot-password', '/reset-password'].includes(currentPath) || 
                               currentPath.startsWith('/landing');
          const isAuthCheck = error.config?.url?.includes('/auth/me');
          const isLoginRoute = error.config?.url?.includes('/auth/login');
          
          // Solo mostrar toast y redirigir si no es una ruta pública, no es verificación de auth, y no es un error de login
          // Si es un error de login, el componente LoginPage ya maneja el error, no necesitamos redirigir
          if (!isPublicRoute && !isAuthCheck && !isLoginRoute) {
            // Usar showError que previene duplicados automáticamente
            showError('No autorizado. Por favor, inicia sesión nuevamente', 'auth-error-401');
            setTimeout(() => {
              window.location.href = '/iniciar-sesion';
            }, 2000);
          }
          break;
        }
        case 403: {
          // Usar showError que previene duplicados automáticamente
          const toastId403 = `error-403-${error.config?.url || 'default'}`;
          showError('No tienes permisos para realizar esta acción', toastId403);
          break;
        }
        case 404: {
          // Usar showError que previene duplicados automáticamente
          const toastId404 = `error-404-${error.config?.url || 'default'}`;
          showError(data?.message || 'Recurso no encontrado', toastId404);
          break;
        }
        case 422:
          // Errores de validación - No mostrar toast automático
          if (import.meta.env.DEV) {
            console.warn('Error 422:', data?.message || 'Error de validación', data?.errors);
          }
          // No mostrar toast para evitar duplicados con toast.promise en componentes
          break;
        case 500: {
          // Usar showError que previene duplicados automáticamente
          const toastId500 = `error-500-${error.config?.url || 'default'}`;
          showError('Error interno del servidor. Intenta nuevamente', toastId500);
          break;
        }
        default: {
          // Usar showError que previene duplicados automáticamente
          const toastIdDefault = `error-${status}-${error.config?.url || 'default'}`;
          showError(data?.message || 'Error inesperado', toastIdDefault);
        }
      }
    } else if (error.request) {
      // Error de red o timeout - Mensajes más específicos
      console.error('🔴 Error de red completo:', {
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
        },
        request: error.request,
      });

      // Usar showError que previene duplicados automáticamente
      if (error.code === 'ECONNABORTED') {
        showError('La petición tardó demasiado. El servidor puede estar ocupado o "dormido". Intenta nuevamente.', { 
          id: 'error-timeout',
          duration: 5000 
        });
        // Reintento automático simple para cold start
        const originalRequest = error.config;
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          return apiClient.request(originalRequest);
        }
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        const baseUrl = error.config?.baseURL || BASE_URL;
        showError(`Error de conexión con ${baseUrl}. Verifica tu conexión a internet o que el servidor esté disponible.`, { 
          id: 'error-network',
          duration: 5000 
        });
        if (import.meta.env.DEV) {
          console.error('💡 Sugerencias:', {
            '1. Verifica que el backend esté desplegado': 'https://capex-back.onrender.com',
            '2. El backend puede estar "dormido"': 'En Render Free, el primer request puede tardar 30-60 segundos',
            '3. Verifica CORS': 'Asegúrate de que tu puerto local esté permitido en el backend',
            '4. Revisa la consola del navegador': 'Busca errores de CORS en la pestaña Network',
          });
        }
      } else {
        showError(`Error de conexión: ${error.message || 'Error desconocido'}`, { 
          id: 'error-connection' 
        });
      }
    } else {
      showError('Error inesperado', { id: 'error-unexpected' });
      console.error('Error inesperado:', error);
    }

    return Promise.reject(error);
  }
);

// Funciones helper para diferentes tipos de requests
export const apiRequest = {
  // GET request
  get: async (url, config = {}) => {
    const response = await apiClient.get(url, config);
    return response.data;
  },

  // POST request
  post: async (url, data = {}, config = {}) => {
    const response = await apiClient.post(url, data, config);
    return response.data;
  },

  // PUT request
  put: async (url, data = {}, config = {}) => {
    const response = await apiClient.put(url, data, config);
    return response.data;
  },

  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    const response = await apiClient.patch(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async (url, config = {}) => {
    const response = await apiClient.delete(url, config);
    return response.data;
  },
};

// Función para manejar uploads de archivos
export const uploadFile = async (url, file, onUploadProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onUploadProgress ? (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onUploadProgress(percentCompleted);
    } : undefined,
  });
  return response.data;
};

// Función para cancelar requests
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

// Función para verificar si un error es de cancelación
export const isCancel = (error) => {
  return axios.isCancel(error);
};

// Exportar la instancia de axios para casos especiales
export { apiClient };

// Exportar la URL base para referencia
export { BASE_URL };

// Configuración de la API (compatibilidad con código legacy)
export const API_CONFIG = {
  BASE_URL: BASE_URL,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Endpoints específicos (consolidados desde api.js)
export const API_ENDPOINTS = {
  ROLES: '/roles',
  PRIVILEGES: '/privileges',
  USERS: '/usuarios',
  AUTH: '/auth',
  CUSTOMERS: '/customers',
};

// Función para obtener headers (mantener compatibilidad)
// Nota: Con cookies HttpOnly, no necesitamos agregar manualmente headers de autenticación
// Las cookies se incluyen automáticamente con withCredentials: true
export const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
};

export default apiRequest;
