import toast from 'react-hot-toast';

/**
 * Sistema estandarizado de alertas con toast
 * Previene duplicados y asegura mensajes claros
 */

/**
 * Genera un ID único para el toast basado en la operación
 * @param {string} operation - Tipo de operación (create, update, delete, etc.)
 * @param {string} entity - Entidad afectada (employee, product, etc.)
 * @param {string|number} id - ID opcional del elemento
 * @returns {string} ID único para el toast
 */
const generateToastId = (operation, entity, id = '') => {
  return `${operation}-${entity}${id ? `-${id}` : ''}`;
};

/**
 * Registra eventos de notificación en memoria y sessionStorage
 */
const _toastEvents = [];
const logToastEvent = (type, payload) => {
  const entry = {
    ts: new Date().toISOString(),
    type,
    ...payload,
  };
  _toastEvents.push(entry);
  try {
    const prev = JSON.parse(sessionStorage.getItem('__toastEvents') || '[]');
    prev.push(entry);
    sessionStorage.setItem('__toastEvents', JSON.stringify(prev.slice(-200)));
  } catch { 0; }
};

/**
 * Mensajes estandarizados para operaciones CRUD
 */
const MESSAGES = {
  loading: {
    create: 'Creando...',
    update: 'Actualizando...',
    delete: 'Eliminando...',
    fetch: 'Cargando...',
    save: 'Guardando...',
    upload: 'Subiendo archivo...',
    process: 'Procesando...',
  },
  success: {
    create: 'creado exitosamente',
    update: 'actualizado exitosamente',
    delete: 'eliminado exitosamente',
    save: 'guardado exitosamente',
    upload: 'archivo subido exitosamente',
  },
  error: {
    create: 'Error al crear',
    update: 'Error al actualizar',
    delete: 'Error al eliminar',
    fetch: 'Error al cargar',
    save: 'Error al guardar',
    upload: 'Error al subir archivo',
    network: 'No se puede conectar al servidor. Verifique su conexión a internet.',
    unknown: 'Ocurrió un error inesperado',
  }
};

/**
 * Extrae el mensaje de error del backend
 * @param {Error} error - Error capturado
 * @returns {string} Mensaje de error formateado
 */
const extractErrorMessage = (error) => {
  // Error de red
  if (error.code === 'ERR_NETWORK' || 
      error.message?.includes('ERR_NAME_NOT_RESOLVED') || 
      !error.response) {
    return MESSAGES.error.network;
  }

  // Mensajes del backend (prioridad)
  const backendMessage = 
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.response?.data?.msg;

  if (backendMessage) {
    return backendMessage;
  }

  // Errores de validación
  if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    const firstError = error.response.data.errors[0];
    return firstError?.message || firstError || MESSAGES.error.unknown;
  }

  // Mensaje genérico del error
  return error.message || MESSAGES.error.unknown;
};

/**
 * Ejecuta una operación con toast promise estandarizado
 * @param {Function} promiseFn - Función que retorna una promesa
 * @param {Object} options - Opciones de configuración
 * @param {string} options.operation - Tipo de operación (create, update, delete)
 * @param {string} options.entity - Nombre de la entidad (empleado, producto, etc.)
 * @param {string|number} options.id - ID opcional del elemento
 * @param {string} options.loadingMessage - Mensaje personalizado de carga
 * @param {string|Function} options.successMessage - Mensaje personalizado de éxito
 * @param {Function} options.onSuccess - Callback al completar exitosamente
 * @param {Function} options.onError - Callback al fallar
 * @returns {Promise} Promesa de la operación
 */
export const executeWithToast = async ({
  promiseFn,
  operation,
  entity,
  id = '',
  loadingMessage,
  successMessage,
  onSuccess,
  onError,
}) => {
  const toastId = generateToastId(operation, entity, id);
  
  // Descartar cualquier toast anterior con el mismo ID
  try { toast.dismiss(toastId); } catch { 0; }

  // Mensaje de carga
  const loading = loadingMessage || `${MESSAGES.loading[operation]} ${entity}...`;
  
  // Crear el toast de loading
  let loadingToastId = null;
  try {
    loadingToastId = toast.loading(loading, { id: toastId });
    logToastEvent('loading', { id: toastId, operation, entity, message: loading });
  } catch (e) {
    console.warn('Toast loading failed:', e);
  }

  try {
    // Ejecutar la promesa
    const result = await promiseFn();

    // Descartar el loading
    try { if (loadingToastId) toast.dismiss(loadingToastId); } catch { 0; }

    // Mensaje de éxito
    const success = typeof successMessage === 'function'
      ? successMessage(result)
      : successMessage || `${entity} ${MESSAGES.success[operation]}`;
    
    try {
      toast.success(success, { id: toastId, duration: 4000 });
      logToastEvent('success', { id: toastId, operation, entity, message: success });
    } catch (e) {
      console.warn('Toast success failed:', e);
    }

    // Ejecutar callback de éxito si existe
    if (onSuccess) {
      onSuccess(result);
    }

    return result;
  } catch (error) {
    // Descartar el loading
    try { if (loadingToastId) toast.dismiss(loadingToastId); } catch { 0; }

    // Extraer mensaje de error
    const errorMessage = extractErrorMessage(error);
    
    // Mostrar error
    try {
      toast.error(errorMessage, { id: toastId, duration: 5000 });
      logToastEvent('error', { id: toastId, operation, entity, message: errorMessage });
    } catch (e) {
      console.warn('Toast error failed:', e);
    }

    // Ejecutar callback de error si existe
    if (onError) {
      onError(error);
    }

    throw error;
  }
};

/**
 * Muestra un toast de éxito simple
 * @param {string} message - Mensaje a mostrar
 * @param {Object} options - Opciones adicionales
 */
export const showSuccess = (message, options = {}) => {
  const id = options.id || `success-${Date.now()}`;
  toast.dismiss(id);
  toast.success(message, { id, duration: 4000, ...options });
};

/**
 * Muestra un toast de error simple
 * @param {string|Error} messageOrError - Mensaje o error a mostrar
 * @param {Object} options - Opciones adicionales
 */
export const showError = (messageOrError, options = {}) => {
  const id = options.id || `error-${Date.now()}`;
  toast.dismiss(id);
  
  const message = typeof messageOrError === 'string'
    ? messageOrError
    : extractErrorMessage(messageOrError);
  
  toast.error(message, { id, duration: 5000, ...options });
};

/**
 * Muestra un toast de información simple
 * @param {string} message - Mensaje a mostrar
 * @param {Object} options - Opciones adicionales
 */
export const showInfo = (message, options = {}) => {
  const id = options.id || `info-${Date.now()}`;
  toast.dismiss(id);
  toast(message, { id, duration: 4000, ...options });
};

/**
 * Descarta todos los toasts activos
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};

/**
 * Wrapper para toast.promise con configuración estandarizada
 * @param {Promise} promise - Promesa a ejecutar
 * @param {Object} messages - Mensajes para cada estado
 * @param {string} messages.loading - Mensaje de carga
 * @param {string|Function} messages.success - Mensaje de éxito
 * @param {string|Function} messages.error - Mensaje de error
 * @param {string} id - ID opcional para el toast
 */
export const promiseToast = (promise, messages, id) => {
  const toastId = id || `promise-${Date.now()}`;
  toast.dismiss(toastId);

  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Procesando...',
      success: messages.success || 'Operación completada exitosamente',
      error: messages.error || extractErrorMessage,
    },
    { id: toastId }
  );
};

export default {
  executeWithToast,
  showSuccess,
  showError,
  showInfo,
  dismissAllToasts,
  promiseToast,
  extractErrorMessage,
};
