// Verifica si ya existe un producto con el mismo nombre (insensible a mayúsculas y espacios)
export function isDuplicateProductName(nombre, productos) {
  const normalizar = (str) => str.trim().toLowerCase();
  return productos.some(p => normalizar(p.nombre) === normalizar(nombre));
}

// Verifica si ya existe una categoría con el mismo nombre (insensible a mayúsculas y espacios)
export function isDuplicateCategoryName(nombre, categorias, categoriaActual = null) {
  const normalizar = (str) => str.trim().toLowerCase();
  return categorias.some(c => {
    // Si estamos editando, excluir la categoría actual
    if (categoriaActual && c.id === categoriaActual.id) {
      return false;
    }
    return normalizar(c.name) === normalizar(nombre);
  });
}

// Verifica si ya existe un proveedor con el mismo correo (insensible a mayúsculas y espacios)
export function isDuplicateSupplierEmail(correo, proveedores, proveedorActual = null) {
  const normalizar = (str) => str.trim().toLowerCase();
  return proveedores.some(p => {
    // Si estamos editando, excluir el proveedor actual
    if (proveedorActual && p.id === proveedorActual.id) {
      return false;
    }
    return normalizar(p.correo) === normalizar(correo);
  });
}

// Valida formato de correo electrónico
export function isValidEmail(email) {
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  return emailRegex.test(email.toLowerCase());
}

// Valida formato de NIT (letra seguida de números)
export function isValidNIT(nit) {
  const nitRegex = /^[A-Za-z]\d+$/;
  return nitRegex.test(nit);
}

// Valida formato de teléfono (código de país + números)
export function isValidPhone(telefono) {
  const phoneRegex = /^\+\d{7,15}$/;
  return phoneRegex.test(telefono);
}

// Valida tipo de proveedor (N o J)
export function isValidSupplierType(tipo) {
  return ['N', 'J'].includes(tipo.toUpperCase());
}

// Trunca texto para mostrar en tablas
export function truncateText(text, maxLength = 30) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
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