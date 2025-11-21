import toast from 'react-hot-toast';

/**
 * Utilidades para manejo de APIs y optimización de respuestas
 */

/**
 * Normalizar respuesta de API para formato consistente
 * @param {Object} response - Respuesta de la API
 * @returns {Object} Respuesta normalizada
 */
export const normalizeApiResponse = (response) => {
  // Si la respuesta ya tiene el formato esperado
  if (response && typeof response === 'object' && 'success' in response) {
    return response;
  }

  // Si es una respuesta directa de axios
  if (response && response.data) {
    return {
      success: true,
      data: response.data,
      message: response.message || 'Operación exitosa',
      pagination: response.pagination || null,
    };
  }

  // Si es solo data
  return {
    success: true,
    data: response,
    message: 'Operación exitosa',
    pagination: null,
  };
};

/**
 * Manejar errores de API de forma consistente
 * @param {Error} error - Error de la API
 * @param {Object} options - Opciones de manejo
 * @returns {Object} Error normalizado
 */
export const handleApiError = (error, options = {}) => {
  const {
    showToast = true,
    defaultMessage = 'Ha ocurrido un error inesperado',
    context = '',
  } = options;

  let errorMessage = defaultMessage;
  let errorCode = null;
  let validationErrors = null;

  if (error.response) {
    // Error de respuesta del servidor
    const { status, data } = error.response;
    errorCode = status;

    switch (status) {
      case 400:
        errorMessage = data?.message || 'Solicitud incorrecta';
        break;
      case 401:
        errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente';
        break;
      case 403:
        errorMessage = 'No tienes permisos para realizar esta acción';
        break;
      case 404:
        errorMessage = data?.message || 'Recurso no encontrado';
        break;
      case 422:
        errorMessage = data?.message || 'Error de validación';
        validationErrors = data?.errors || null;
        break;
      case 500:
        errorMessage = 'Error interno del servidor. Intenta nuevamente';
        break;
      default:
        errorMessage = data?.message || defaultMessage;
    }
  } else if (error.request) {
    // Error de red
    errorMessage = 'Error de conexión. Verifica tu conexión a internet';
    errorCode = 'NETWORK_ERROR';
  } else {
    // Error de configuración u otro
    errorMessage = error.message || defaultMessage;
    errorCode = 'UNKNOWN_ERROR';
  }

  // Agregar contexto si se proporciona
  if (context) {
    errorMessage = `${context}: ${errorMessage}`;
  }

  // Mostrar toast si está habilitado
  if (showToast) {
    if (validationErrors && Array.isArray(validationErrors)) {
      validationErrors.forEach(err => {
        toast.error(typeof err === 'string' ? err : err.message);
      });
    } else {
      toast.error(errorMessage);
    }
  }

  return {
    success: false,
    message: errorMessage,
    code: errorCode,
    validationErrors,
    originalError: error,
  };
};

/**
 * Crear parámetros de consulta para URLs
 * @param {Object} params - Parámetros a convertir
 * @returns {URLSearchParams} Parámetros de URL
 */
export const createQueryParams = (params = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      // Manejar arrays
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(key, item));
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });
  
  return queryParams;
};

/**
 * Debounce para búsquedas
 * @param {Function} func - Función a ejecutar
 * @param {number} delay - Retraso en milisegundos
 * @returns {Function} Función con debounce
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Throttle para limitar frecuencia de llamadas
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Límite en milisegundos
 * @returns {Function} Función con throttle
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Validar formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar formato de teléfono (básico)
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} True si es válido
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Formatear precio para mostrar
 * @param {number} price - Precio a formatear
 * @param {string} currency - Moneda (default: 'COP')
 * @returns {string} Precio formateado
 */
export const formatPrice = (price, currency = 'COP') => {
  if (price === null || price === undefined) return '$0';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Formatear fecha para mostrar
 * @param {string|Date} date - Fecha a formatear
 * @param {Object} options - Opciones de formato
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  
  return new Date(date).toLocaleDateString('es-CO', defaultOptions);
};

/**
 * Formatear fecha y hora para mostrar
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  return new Date(date).toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Generar ID único simple
 * @returns {string} ID único
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Limpiar objeto removiendo propiedades vacías
 * @param {Object} obj - Objeto a limpiar
 * @returns {Object} Objeto limpio
 */
export const cleanObject = (obj) => {
  const cleaned = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'string' && value.trim() !== '') {
        cleaned[key] = value.trim();
      } else if (typeof value !== 'string') {
        cleaned[key] = value;
      }
    }
  });
  
  return cleaned;
};

/**
 * Convertir archivo a Base64
 * @param {File} file - Archivo a convertir
 * @returns {Promise<string>} Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Validar tamaño de archivo
 * @param {File} file - Archivo a validar
 * @param {number} maxSizeMB - Tamaño máximo en MB
 * @returns {boolean} True si es válido
 */
export const isValidFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Validar tipo de archivo
 * @param {File} file - Archivo a validar
 * @param {Array} allowedTypes - Tipos permitidos
 * @returns {boolean} True si es válido
 */
export const isValidFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
  return allowedTypes.includes(file.type);
};

/**
 * Crear objeto de paginación estándar
 * @param {number} currentPage - Página actual
 * @param {number} totalItems - Total de elementos
 * @param {number} itemsPerPage - Elementos por página
 * @returns {Object} Objeto de paginación
 */
export const createPagination = (currentPage, totalItems, itemsPerPage) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  return {
    currentPage: Math.max(1, Math.min(currentPage, totalPages)),
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    startIndex: (currentPage - 1) * itemsPerPage,
    endIndex: Math.min(currentPage * itemsPerPage, totalItems),
  };
};

/**
 * Manejar descarga de archivos desde API
 * @param {Blob} blob - Blob del archivo
 * @param {string} filename - Nombre del archivo
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Retry automático para requests fallidos
 * @param {Function} fn - Función a ejecutar
 * @param {number} retries - Número de reintentos
 * @param {number} delay - Retraso entre reintentos
 * @returns {Promise} Resultado de la función
 */
export const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error.response?.status >= 500) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

/**
 * Cache simple en memoria para requests
 */
class SimpleCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutos por defecto
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl,
    });
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

export const apiCache = new SimpleCache();

/**
 * Wrapper para requests con cache
 * @param {string} key - Clave del cache
 * @param {Function} fn - Función que hace el request
 * @param {number} ttl - Tiempo de vida del cache
 * @returns {Promise} Resultado cacheado o nuevo
 */
export const cachedRequest = async (key, fn, ttl) => {
  const cached = apiCache.get(key);
  if (cached) return cached;
  
  const result = await fn();
  apiCache.set(key, result);
  return result;
};

export default {
  normalizeApiResponse,
  handleApiError,
  createQueryParams,
  debounce,
  throttle,
  isValidEmail,
  isValidPhone,
  formatPrice,
  formatDate,
  formatDateTime,
  generateId,
  cleanObject,
  fileToBase64,
  isValidFileSize,
  isValidFileType,
  createPagination,
  downloadFile,
  retryRequest,
  apiCache,
  cachedRequest,
};