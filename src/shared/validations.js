// Verifica si ya existe un producto con el mismo nombre (insensible a mayúsculas y espacios)
export function isDuplicateProductName(nombre, productos) {
  const normalizar = (str) => str.trim().toLowerCase();
  return productos.some(p => normalizar(p.nombre) === normalizar(nombre));
}

// Previene que se ingrese la letra 'e', 'E', '+', '-' en campos numéricos
export function isNumberInputValid(e) {
  if (["e", "E", "+", "-", "."].includes(e.key)) {
    e.preventDefault();
  }
}

// Solo números enteros positivos
export function isValidNumber(value) {
  return /^\d*$/.test(value);
}

// Números decimales positivos (máximo un punto)
export function isValidDecimal(value) {
  return /^\d*(\.\d{0,2})?$/.test(value);
} 