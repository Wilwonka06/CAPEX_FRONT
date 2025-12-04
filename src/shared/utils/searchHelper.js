/**
 * Función helper para búsqueda universal en objetos
 * Busca recursivamente en todos los campos de un objeto, incluyendo objetos anidados y arrays
 * 
 * @param {any} value - El valor a buscar (puede ser objeto, array, string, número, etc.)
 * @param {string} searchTerm - El término de búsqueda
 * @returns {boolean} - true si el término se encuentra en algún campo
 */
export const searchInObject = (value, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return true; // Si no hay término de búsqueda, incluir todo
  }

  const normalizedTerm = normalizeText(searchTerm);

  return searchRecursive(value, normalizedTerm);
};

/**
 * Función recursiva para buscar en cualquier tipo de valor
 */
const searchRecursive = (value, normalizedTerm) => {
  // Manejar null y undefined
  if (value === null || value === undefined) {
    return false;
  }

  // Si es un número, convertir a string y buscar
  if (typeof value === 'number') {
    return normalizeText(value.toString()).includes(normalizedTerm);
  }

  // Si es un boolean, convertir a string y buscar
  if (typeof value === 'boolean') {
    return normalizeText(value.toString()).includes(normalizedTerm);
  }

  // Si es un string, normalizar y buscar
  if (typeof value === 'string') {
    return normalizeText(value).includes(normalizedTerm);
  }

  // Si es un array, buscar en cada elemento
  if (Array.isArray(value)) {
    return value.some(item => searchRecursive(item, normalizedTerm));
  }

  // Si es un objeto, buscar en todos sus valores
  if (typeof value === 'object') {
    return Object.values(value).some(val => searchRecursive(val, normalizedTerm));
  }

  return false;
};

/**
 * Normaliza texto para búsqueda (sin tildes, minúsculas, sin espacios extra)
 * @param {string} text - Texto a normalizar
 * @returns {string} - Texto normalizado
 */
export const normalizeText = (text) => {
  if (!text) return '';
  
  return String(text)
    .toLowerCase()
    .normalize('NFD') // Normalizar caracteres Unicode
    .replace(/[\u0300-\u036f]/g, '') // Eliminar tildes y diacríticos
    .trim();
};

/**
 * Función para filtrar un array de objetos usando búsqueda universal
 * @param {Array} items - Array de objetos a filtrar
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Array} - Array filtrado
 */
export const filterBySearch = (items, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return items;
  }

  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter(item => searchInObject(item, searchTerm));
};

