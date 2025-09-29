/**
 * Utilidades para implementar actualizaciones optimistas
 */

/**
 * Genera un ID temporal único para entidades optimistas
 * @returns {string} ID temporal único
 */
export const generateTempId = () => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Crea una entidad optimista con datos por defecto
 * @param {Object} entityData - Datos de la entidad
 * @param {string} tempId - ID temporal
 * @param {Object} defaults - Valores por defecto
 * @returns {Object} Entidad optimista
 */
export const createOptimisticEntity = (entityData, tempId, defaults = {}) => {
  return {
    id: tempId,
    ...entityData,
    estado: defaults.estado || 'Activo',
    createdAt: defaults.createdAt || new Date().toISOString(),
    updatedAt: defaults.updatedAt || new Date().toISOString(),
    ...defaults
  };
};

/**
 * Actualiza una entidad en el array de entidades
 * @param {Array} entities - Array de entidades
 * @param {string|number} entityId - ID de la entidad a actualizar
 * @param {Object} updates - Campos a actualizar
 * @returns {Array} Nuevo array con la entidad actualizada
 */
export const updateEntityInArray = (entities, entityId, updates) => {
  return entities.map(entity => 
    entity.id === entityId 
      ? { ...entity, ...updates }
      : entity
  );
};

/**
 * Agrega una entidad al inicio del array
 * @param {Array} entities - Array de entidades
 * @param {Object} newEntity - Nueva entidad
 * @returns {Array} Nuevo array con la entidad agregada
 */
export const addEntityToArray = (entities, newEntity) => {
  return [newEntity, ...entities];
};

/**
 * Reemplaza una entidad temporal con la entidad real del backend
 * @param {Array} entities - Array de entidades
 * @param {string} tempId - ID temporal
 * @param {Object} realEntity - Entidad real del backend
 * @returns {Array} Nuevo array con la entidad reemplazada
 */
export const replaceTempEntity = (entities, tempId, realEntity) => {
  return entities.map(entity => 
    entity.id === tempId ? realEntity : entity
  );
};

/**
 * Remueve una entidad del array
 * @param {Array} entities - Array de entidades
 * @param {string|number} entityId - ID de la entidad a remover
 * @returns {Array} Nuevo array sin la entidad
 */
export const removeEntityFromArray = (entities, entityId) => {
  return entities.filter(entity => entity.id !== entityId);
};

/**
 * Encuentra una entidad por ID
 * @param {Array} entities - Array de entidades
 * @param {string|number} entityId - ID de la entidad
 * @returns {Object|undefined} Entidad encontrada o undefined
 */
export const findEntityById = (entities, entityId) => {
  return entities.find(entity => entity.id === entityId);
};

/**
 * Encuentra el índice de una entidad por ID
 * @param {Array} entities - Array de entidades
 * @param {string|number} entityId - ID de la entidad
 * @returns {number} Índice de la entidad o -1 si no se encuentra
 */
export const findEntityIndex = (entities, entityId) => {
  return entities.findIndex(entity => entity.id === entityId);
};

/**
 * Hook personalizado para manejar actualizaciones optimistas
 * @param {Function} setEntities - Función para actualizar el estado de entidades
 * @returns {Object} Funciones de utilidad para actualizaciones optimistas
 */
export const useOptimisticUpdates = (setEntities) => {
  return {
    /**
     * Actualiza una entidad optimistamente
     * @param {string|number} entityId - ID de la entidad
     * @param {Object} updates - Campos a actualizar
     */
    updateEntity: (entityId, updates) => {
      setEntities(prev => updateEntityInArray(prev, entityId, updates));
    },

    /**
     * Agrega una entidad optimistamente
     * @param {Object} newEntity - Nueva entidad
     */
    addEntity: (newEntity) => {
      setEntities(prev => addEntityToArray(prev, newEntity));
    },

    /**
     * Remueve una entidad optimistamente
     * @param {string|number} entityId - ID de la entidad
     */
    removeEntity: (entityId) => {
      setEntities(prev => removeEntityFromArray(prev, entityId));
    },

    /**
     * Reemplaza una entidad temporal con la real
     * @param {string} tempId - ID temporal
     * @param {Object} realEntity - Entidad real del backend
     */
    replaceTempEntity: (tempId, realEntity) => {
      setEntities(prev => replaceTempEntity(prev, tempId, realEntity));
    },

    /**
     * Revierte el estado a una versión anterior
     * @param {Array} previousState - Estado anterior
     */
    revertState: (previousState) => {
      setEntities(previousState);
    }
  };
};

/**
 * Configuración por defecto para entidades optimistas
 */
export const DEFAULT_OPTIMISTIC_CONFIG = {
  estado: 'Activo',
  permisos: [],
  privilegios: [],
  privileges: {},
  createdAt: () => new Date().toISOString(),
  updatedAt: () => new Date().toISOString()
};

/**
 * Crea una configuración personalizada para entidades optimistas
 * @param {Object} customConfig - Configuración personalizada
 * @returns {Object} Configuración completa
 */
export const createOptimisticConfig = (customConfig = {}) => {
  return {
    ...DEFAULT_OPTIMISTIC_CONFIG,
    ...customConfig
  };
};

/**
 * Valida si una entidad es temporal (tiene ID temporal)
 * @param {Object} entity - Entidad a validar
 * @returns {boolean} True si es temporal
 */
export const isTempEntity = (entity) => {
  return entity && entity.id && entity.id.toString().startsWith('temp_');
};

/**
 * Extrae el timestamp de un ID temporal
 * @param {string} tempId - ID temporal
 * @returns {number|null} Timestamp o null si no es válido
 */
export const getTempIdTimestamp = (tempId) => {
  if (!isTempEntity({ id: tempId })) return null;
  
  const parts = tempId.split('_');
  return parts.length > 1 ? parseInt(parts[1]) : null;
};

/**
 * Limpia entidades temporales antiguas (más de 5 minutos)
 * @param {Array} entities - Array de entidades
 * @param {number} maxAge - Edad máxima en milisegundos (default: 5 minutos)
 * @returns {Array} Array sin entidades temporales antiguas
 */
export const cleanOldTempEntities = (entities, maxAge = 5 * 60 * 1000) => {
  const now = Date.now();
  return entities.filter(entity => {
    if (!isTempEntity(entity)) return true;
    
    const timestamp = getTempIdTimestamp(entity.id);
    return timestamp && (now - timestamp) < maxAge;
  });
};
