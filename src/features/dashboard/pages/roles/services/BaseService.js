import { API_CONFIG, API_ENDPOINTS, getAuthHeaders } from '../../../../../shared/config/api';

class BaseService {
  constructor(endpoint) {
    this.baseURL = `${API_CONFIG.BASE_URL}${endpoint}`;
  }

  // Obtener información del usuario autenticado
  getCurrentUser() {
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error al obtener usuario del localStorage:', error);
      return null;
    }
  }

  // Configurar headers para las peticiones
  getHeaders() {
    return getAuthHeaders();
  }

  // Manejar errores de respuesta
  handleError(error) {
    console.error('🔍 Detalles del error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('La petición fue cancelada por timeout');
    }
    
    if (error.message === 'Failed to fetch') {
      throw new Error('Error de conexión. Verifica tu conexión a internet o que el servidor esté funcionando.');
    }
    
    if (error.status === 400) {
      throw new Error(error.message || 'Solicitud incorrecta. Verifica los datos enviados.');
    }
    
    if (error.status === 401) {
      throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
    }
    
    if (error.status === 403) {
      throw new Error('No tienes permisos para realizar esta acción.');
    }
    
    if (error.status === 404) {
      throw new Error('Recurso no encontrado.');
    }
    
    if (error.status === 422) {
      throw new Error(error.message || 'Datos de validación incorrectos.');
    }
    
    if (error.status === 500) {
      throw new Error('Error interno del servidor. Por favor, intenta más tarde.');
    }
    
    throw new Error(error.message || 'Error inesperado al realizar la petición.');
  }

  // Realizar petición HTTP con timeout
  async makeRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          try {
            errorData = { message: await response.text() };
          } catch (e2) {
            errorData = { message: 'Error desconocido' };
          }
        }
        
        const error = new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleError(error);
    }
  }
}

export default BaseService;
