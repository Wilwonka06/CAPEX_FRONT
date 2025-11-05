/**
 * Utilidades de formateo para números y moneda
 * Estándar del proyecto: separador de miles con punto, sin decimales
 */

/**
 * Formatea un número con separador de miles (punto) sin decimales
 * @param {number|string} num - Número a formatear
 * @returns {string} Número formateado (ej: "1.234.567")
 */
export const formatNumber = (num) => {
    if (num === '' || num === undefined || num === null) return '';
    const cleanNum = typeof num === 'string' ? num.replace(/[^0-9.-]/g, '') : num;
    const parsed = parseFloat(cleanNum);
    if (isNaN(parsed)) return '';
    return Math.round(parsed).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };
  
  /**
   * Formatea un número como precio con símbolo $ y sin decimales
   * @param {number|string} price - Precio a formatear
   * @returns {string} Precio formateado (ej: "$1.234.567")
   */
  export const formatPrice = (price) => {
    if (price === '' || price === undefined || price === null) return '$0';
    const cleanNum = typeof price === 'string' ? price.replace(/[^0-9.-]/g, '') : price;
    const parsed = parseFloat(cleanNum);
    if (isNaN(parsed)) return '$0';
    return '$' + Math.round(parsed).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };
  
  /**
   * Limpia un string formateado y devuelve solo los números
   * @param {string} str - String con formato (ej: "1.234.567")
   * @returns {string} Números sin formato (ej: "1234567")
   */
  export const cleanNumber = (str) => {
    if (!str) return '';
    return str.toString().replace(/[^0-9]/g, '');
  };
  
  /**
   * Formatea un número para input (para escribir)
   * Mantiene el formato mientras el usuario escribe
   * @param {string} value - Valor actual del input
   * @returns {string} Valor formateado
   */
  export const formatNumberInput = (value) => {
    if (!value) return '';
    const cleaned = cleanNumber(value);
    if (!cleaned) return '';
    return formatNumber(cleaned);
  };
  
  /**
   * Valida si un string representa un número válido
   * @param {string} value - Valor a validar
   * @returns {boolean} true si es válido
   */
  export const isValidNumber = (value) => {
    if (!value) return false;
    const cleaned = cleanNumber(value);
    const parsed = parseInt(cleaned);
    return !isNaN(parsed) && parsed >= 0;
  };
  
  /**
   * Parsea un número formateado a número
   * @param {string|number} value - Valor formateado o número
   * @returns {number} Número parseado
   */
  export const parseFormattedNumber = (value) => {
    if (typeof value === 'number') return Math.round(value);
    if (!value) return 0;
    const cleaned = cleanNumber(value);
    const parsed = parseInt(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };
  
  /**
   * Formatea porcentaje sin decimales
   * @param {number|string} num - Número a formatear como porcentaje
   * @returns {string} Porcentaje formateado (ej: "19%")
   */
  export const formatPercentage = (num) => {
    if (num === '' || num === undefined || num === null) return '0%';
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return '0%';
    return Math.round(parsed) + '%';
  };
  
  export default {
    formatNumber,
    formatPrice,
    cleanNumber,
    formatNumberInput,
    isValidNumber,
    parseFormattedNumber,
    formatPercentage
  };