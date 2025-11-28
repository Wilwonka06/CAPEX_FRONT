import toast from 'react-hot-toast';

/**
 * Helper para generar IDs únicos para toasts y evitar duplicados
 * @param {string} operation - Tipo de operación (create, update, delete, etc.)
 * @param {string} resource - Recurso (product, user, service, etc.)
 * @param {string|number} identifier - Identificador único (ID del recurso, etc.)
 * @returns {string} ID único para el toast
 */
export const generateToastId = (operation, resource, identifier = '') => {
  if (identifier) {
    return `${operation}-${resource}-${identifier}`;
  }
  return `${operation}-${resource}`;
};

/**
 * Helper para mostrar toast.promise evitando duplicados
 * Descartará cualquier toast existente con el mismo ID antes de mostrar uno nuevo
 * @param {Promise} promise - Promesa a observar
 * @param {Object} messages - Mensajes para loading, success, error
 * @param {string} toastId - ID único para el toast (evita duplicados)
 * @returns {Promise} La promesa original
 */
export const toastPromiseWithId = (promise, messages, toastId) => {
  // Descartar cualquier toast existente con el mismo ID
  if (toastId) {
    toast.dismiss(toastId);
  }
  
  // Crear el toast de loading con ID
  const loadingToastId = toast.loading(messages.loading, { id: toastId });
  
  // Manejar la promesa
  promise
    .then((result) => {
      toast.dismiss(loadingToastId);
      const successMessage = typeof messages.success === 'function' ? messages.success(result) : messages.success;
      toast.success(successMessage, { id: toastId });
      return result;
    })
    .catch((error) => {
      toast.dismiss(loadingToastId);
      const errorMessage = typeof messages.error === 'function' ? messages.error(error) : messages.error;
      toast.error(errorMessage, { id: toastId });
      throw error;
    });
  
  return promise;
};

/**
 * Wrapper simplificado para toast.promise que evita duplicados
 * Compatible con la sintaxis original de toast.promise pero con prevención de duplicados
 * @param {Promise} promise - Promesa a observar
 * @param {Object} options - Opciones con loading, success, error y toastId
 * @returns {Promise} La promesa original
 */
export const safeToastPromise = (promise, options) => {
  const { loading, success, error, id } = options;
  
  // Si no hay ID, generar uno basado en el mensaje de loading
  const toastId = id || `toast-${loading?.substring(0, 20).replace(/\s/g, '-')}`;
  
  // Descartar cualquier toast existente con el mismo ID
  toast.dismiss(toastId);
  
  // Crear el toast de loading con ID
  const loadingToastId = toast.loading(loading, { id: toastId });
  
  // Manejar la promesa
  promise
    .then((result) => {
      toast.dismiss(loadingToastId);
      const successMessage = typeof success === 'function' ? success(result) : success;
      toast.success(successMessage, { id: toastId });
      return result;
    })
    .catch((err) => {
      toast.dismiss(loadingToastId);
      const errorMessage = typeof error === 'function' ? error(err) : error;
      toast.error(errorMessage, { id: toastId });
      throw err;
    });
  
  return promise;
};

/**
 * Helper para mostrar toast de éxito con ID único
 * @param {string} message - Mensaje de éxito
 * @param {string} id - ID único (opcional)
 */
export const toastSuccess = (message, id = null) => {
  if (id) {
    toast.success(message, { id });
  } else {
    toast.success(message);
  }
};

/**
 * Helper para mostrar toast de error con ID único
 * @param {string} message - Mensaje de error
 * @param {string} id - ID único (opcional)
 */
export const toastError = (message, id = null) => {
  if (id) {
    toast.error(message, { id });
  } else {
    toast.error(message);
  }
};

export default {
  generateToastId,
  toastPromise,
  toastSuccess,
  toastError,
};

