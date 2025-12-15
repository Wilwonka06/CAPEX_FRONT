/**
 * Utilidades de formateo para números y moneda
 * Estándar del proyecto: separador de miles con punto, decimales con coma
 * Formato colombiano: 1.234.567,50
 */

/**
 * Formatea un número con separador de miles (punto) y decimales con coma
 * @param {number|string} num - Número a formatear
 * @param {number} decimals - Número de decimales (default: 0)
 * @returns {string} Número formateado (ej: "1.234.567" o "1.234.567,50")
 */
export const formatNumber = (num, decimals = 0) => {
    if (num === '' || num === undefined || num === null) return '';
    const cleanNum = typeof num === 'string' ? num.replace(/[^0-9.-]/g, '') : num;
    const parsed = parseFloat(cleanNum);
    if (isNaN(parsed)) return '';
    
    // Formatear con decimales
    const fixed = parsed.toFixed(decimals);
    const parts = fixed.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimalPart = parts[1] && decimals > 0 ? ',' + parts[1] : '';
    
    return integerPart + decimalPart;
  };
  
  /**
   * Formatea un número como precio con símbolo COP, separador de miles (punto) y decimales con coma
   * @param {number|string} price - Precio a formatear
   * @param {number} decimals - Número de decimales (default: 2 para mostrar centavos)
   * @returns {string} Precio formateado (ej: "COP 1.234.567,50")
   */
  export const formatPrice = (price, decimals = 2) => {
    if (price === '' || price === undefined || price === null) return 'COP 0,00';
    const cleanNum = typeof price === 'string' ? price.replace(/[^0-9.-]/g, '') : price;
    const parsed = parseFloat(cleanNum);
    if (isNaN(parsed)) return 'COP 0,00';
    
    // Formatear con decimales
    const fixed = parsed.toFixed(decimals);
    const parts = fixed.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimalPart = parts[1] ? ',' + parts[1] : ',00';
    
    return 'COP ' + integerPart + decimalPart;
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
   * @param {number} decimals - Número de decimales (default: 0)
   * @returns {string} Valor formateado
   */
export const formatNumberInput = (value, decimals = 0) => {
  if (!value) return '';
  
  // Permitir números, puntos y comas
  let cleaned = value.toString().replace(/[^0-9.,]/g, '');
  
  // Si no hay nada, retornar vacío
  if (!cleaned) return '';
  
  // Detectar separador decimal: preferir coma, si no existe usar punto
  const sep = cleaned.includes(',') ? ',' : (cleaned.includes('.') ? '.' : null);
  if (sep) {
    const parts = cleaned.split(sep);
    const integerPart = parts[0].replace(/\./g, '');
    const decimalPart = parts[1] ? parts[1].substring(0, decimals) : '';
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    if (decimals > 0 && decimalPart) {
      return formattedInteger + ',' + decimalPart;
    } else if (decimals > 0 && cleaned.endsWith(sep)) {
      return formattedInteger + ',';
    }
    return formattedInteger;
  }
  
  // Si solo tiene puntos (miles) o números
  const numericValue = cleaned.replace(/\./g, '');
  if (!numericValue) return '';
  
  // Formatear con puntos de miles
  const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Si se requieren decimales pero no hay coma, no agregar decimales automáticamente
  return formatted;
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
   * Parsea un número formateado a número (acepta coma como decimal)
   * @param {string|number} value - Valor formateado o número
   * @returns {number} Número parseado
   */
export const parseFormattedNumber = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  // Convertir a string y limpiar
  let str = value.toString().trim();
  if (!str) return 0;
  
  // Normalizar: si hay coma, tratar como decimal; si no, usar punto como posible decimal
  if (str.includes(',') || str.includes('.')) {
    const sep = str.includes(',') ? ',' : '.';
    const parts = str.split(sep);
    const integerPart = parts[0].replace(/\./g, '');
    const decimalPart = parts[1] || '00';
    const combined = integerPart + '.' + decimalPart;
    const parsed = parseFloat(combined);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  // Si solo tiene puntos (miles) o números, eliminar puntos y parsear
  const cleaned = str.replace(/\./g, '');
  const parsed = parseFloat(cleaned);
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
