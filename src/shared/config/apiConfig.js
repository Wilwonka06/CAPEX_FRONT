import axios from 'axios';
import { toast } from 'react-toastify';

// Base URL del backend
const BASE_URL = 'https://capex-back.onrender.com/api';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor de request - agregar token de autenticación si existe
apiClient.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage o contexto de autenticación
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log de requests en desarrollo
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
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

    // Manejo específico de errores por código de estado
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          toast.error(data?.message || 'Solicitud incorrecta');
          break;
        case 401:
          toast.error('No autorizado. Por favor, inicia sesión nuevamente');
          // Limpiar tokens y redirigir al login
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          // Opcional: redirigir al login
          // window.location.href = '/login';
          break;
        case 403:
          toast.error('No tienes permisos para realizar esta acción');
          break;
        case 404:
          toast.error(data?.message || 'Recurso no encontrado');
          break;
        case 422:
          // Errores de validación
          if (data?.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => toast.error(err.message || err));
          } else {
            toast.error(data?.message || 'Error de validación');
          }
          break;
        case 500:
          toast.error('Error interno del servidor. Intenta nuevamente');
          break;
        default:
          toast.error(data?.message || 'Error inesperado');
      }
    } else if (error.request) {
      // Error de red o timeout
      toast.error('Error de conexión. Verifica tu conexión a internet');
    } else {
      toast.error('Error inesperado');
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

export default apiRequest;
