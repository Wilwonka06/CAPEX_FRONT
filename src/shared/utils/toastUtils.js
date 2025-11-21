import toast from 'react-hot-toast';

// Cache de toasts activos para prevenir duplicados
const activeToasts = new Map();

/**
 * Genera un ID único basado en el mensaje para prevenir duplicados
 * @param {string} message - Mensaje del toast
 * @param {string} type - Tipo de toast (error, success, loading, etc.)
 * @returns {string} ID único
 */
const generateToastId = (message, type = 'default') => {
  // Normalizar el mensaje para crear un ID consistente
  const normalizedMessage = message
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  return `${type}-${normalizedMessage}`;
};

/**
 * Muestra un toast de error evitando duplicados
 * @param {string} message - Mensaje de error
 * @param {string|object} options - ID personalizado u opciones del toast
 */
export const showError = (message, options = {}) => {
  let toastId;
  let toastOptions = {};

  if (typeof options === 'string') {
    toastId = options;
    toastOptions = { id: toastId };
  } else {
    toastId = options.id || generateToastId(message, 'error');
    toastOptions = { ...options, id: toastId };
  }

  // Descartar cualquier toast existente con el mismo ID
  if (activeToasts.has(toastId)) {
    toast.dismiss(toastId);
  }

  // Mostrar el nuevo toast y guardarlo en el cache
  toast.error(message, toastOptions);
  activeToasts.set(toastId, Date.now());

  // Limpiar del cache después de que el toast expire
  setTimeout(() => {
    activeToasts.delete(toastId);
  }, toastOptions.duration || 4000);
};

/**
 * Muestra un toast de éxito evitando duplicados
 * @param {string} message - Mensaje de éxito
 * @param {string|object} options - ID personalizado u opciones del toast
 */
export const showSuccess = (message, options = {}) => {
  let toastId;
  let toastOptions = {};

  if (typeof options === 'string') {
    toastId = options;
    toastOptions = { id: toastId };
  } else {
    toastId = options.id || generateToastId(message, 'success');
    toastOptions = { ...options, id: toastId };
  }

  // Descartar cualquier toast existente con el mismo ID
  if (activeToasts.has(toastId)) {
    toast.dismiss(toastId);
  }

  // Mostrar el nuevo toast y guardarlo en el cache
  toast.success(message, toastOptions);
  activeToasts.set(toastId, Date.now());

  // Limpiar del cache después de que el toast expire
  setTimeout(() => {
    activeToasts.delete(toastId);
  }, toastOptions.duration || 3000);
};

/**
 * Muestra un toast de loading evitando duplicados
 * @param {string} message - Mensaje de loading
 * @param {string|object} options - ID personalizado u opciones del toast
 * @returns {string} ID del toast
 */
export const showLoading = (message, options = {}) => {
  let toastId;
  let toastOptions = {};

  if (typeof options === 'string') {
    toastId = options;
    toastOptions = { id: toastId };
  } else {
    toastId = options.id || generateToastId(message, 'loading');
    toastOptions = { ...options, id: toastId };
  }

  // Descartar cualquier toast existente con el mismo ID
  if (activeToasts.has(toastId)) {
    toast.dismiss(toastId);
  }

  // Mostrar el nuevo toast y guardarlo en el cache
  const id = toast.loading(message, toastOptions);
  activeToasts.set(toastId, Date.now());

  return id;
};

/**
 * Wrapper para toast.promise que previene duplicados
 * @param {Promise} promise - Promesa a observar
 * @param {object} messages - Objeto con loading, success, error
 * @param {object} options - Opciones adicionales (id, etc.)
 */
export const showPromise = (promise, messages, options = {}) => {
  const toastId = options.id || generateToastId(messages.loading, 'promise');

  // Descartar cualquier toast existente con el mismo ID
  if (activeToasts.has(toastId)) {
    toast.dismiss(toastId);
  }

  // Mostrar el toast de promise
  toast.promise(
    promise,
    messages,
    {
      ...options,
      id: toastId,
    }
  );

  activeToasts.set(toastId, Date.now());

  // Limpiar del cache después de un tiempo razonable
  promise.finally(() => {
    setTimeout(() => {
      activeToasts.delete(toastId);
    }, 5000);
  });

  return promise;
};

/**
 * Descartar un toast específico por ID
 * @param {string} toastId - ID del toast a descartar
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
  activeToasts.delete(toastId);
};

/**
 * Descartar todos los toasts
 */
export const dismissAll = () => {
  toast.dismiss();
  activeToasts.clear();
};

// Exportar toast original para casos especiales
export { toast };


