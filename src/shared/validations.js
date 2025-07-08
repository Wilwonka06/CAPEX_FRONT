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

// ===== VALIDACIONES DE ROLES =====

// Verifica si ya existe un rol con el mismo nombre (insensible a mayúsculas)
export function isDuplicateRoleName(nombre, roles, rolActual = null) {
  const normalizar = (str) => str.trim().toLowerCase();
  return roles.some(r => {
    // Si estamos editando, excluir el rol actual
    if (rolActual && r.id === rolActual.id) {
      return false;
    }
    return normalizar(r.name) === normalizar(nombre);
  });
}

// Valida nombre de rol (requerido, mínimo 3 caracteres)
export function isValidRoleName(nombre) {
  return nombre && nombre.trim().length >= 3;
}

// Valida que se hayan seleccionado al menos un privilegio
export function hasAnyPrivilege(privileges) {
  return privileges && Object.values(privileges).some(
    mod => mod && Object.values(mod).some(Boolean)
  );
}

// Validación completa de rol
export function validateRole(formData, privileges, roles = [], rolActual = null) {
  const errors = {};
  
  // Validar nombre
  if (!isValidRoleName(formData.nombre)) {
    errors.nombre = 'El nombre es requerido y debe tener al menos 3 caracteres.';
  } else if (isDuplicateRoleName(formData.nombre, roles, rolActual)) {
    errors.nombre = 'Ya existe un rol con ese nombre.';
  }
  
  // Validar privilegios
  if (!hasAnyPrivilege(privileges)) {
    errors.privilegios = 'Debes seleccionar al menos un privilegio.';
  }
  
  return errors;
}

// ===== VALIDACIONES DE CLIENTES =====

// Verifica si ya existe un cliente con el mismo email
export function isDuplicateCustomerEmail(email, customers, customerActual = null) {
  const normalizar = (str) => str.trim().toLowerCase();
  return customers.some(c => {
    // Si estamos editando, excluir el cliente actual
    if (customerActual && c.id === customerActual.id) {
      return false;
    }
    return normalizar(c.email) === normalizar(email);
  });
}

// Verifica si ya existe un cliente con el mismo documento
export function isDuplicateCustomerDocument(documentType, documentNumber, customers, customerActual = null) {
  return customers.some(c => {
    // Si estamos editando, excluir el cliente actual
    if (customerActual && c.id === customerActual.id) {
      return false;
    }
    return c.documentType === documentType && c.documentNumber === documentNumber;
  });
}

// Valida nombre de cliente (requerido, mínimo 2 caracteres)
export function isValidCustomerName(name) {
  return name && name.trim().length >= 2;
}

// Valida número de documento (requerido, mínimo 5 caracteres)
export function isValidDocumentNumber(documentNumber) {
  return documentNumber && documentNumber.trim().length >= 5;
}

// Valida teléfono de cliente (requerido, mínimo 7 caracteres)
export function isValidCustomerPhone(phone) {
  return phone && phone.trim().length >= 7;
}

// Validación completa de cliente
export function validateCustomer(customerData, customers, excludeId = null) {
  const errors = {};

  // Validar nombre
  if (!isValidCustomerName(customerData.firstName)) {
    errors.firstName = 'El nombre debe tener al menos 2 caracteres';
  }

  // Validar apellido
  if (!isValidCustomerName(customerData.lastName)) {
    errors.lastName = 'El apellido debe tener al menos 2 caracteres';
  }

  // Validar tipo de documento
  if (!customerData.documentType) {
    errors.documentType = 'El tipo de documento es requerido';
  }

  // Validar número de documento
  if (!isValidDocumentNumber(customerData.documentNumber)) {
    errors.documentNumber = 'El número de documento debe tener al menos 5 caracteres';
  }

  // Validar email
  if (!customerData.email) {
    errors.email = 'El correo electrónico es requerido';
  } else if (!isValidEmail(customerData.email)) {
    errors.email = 'El correo electrónico no es válido';
  } else {
    // Verificar duplicado de email
    const customerActual = excludeId ? customers.find(c => c.id === excludeId) : null;
    if (isDuplicateCustomerEmail(customerData.email, customers, customerActual)) {
      errors.email = 'El correo electrónico ya está registrado';
    }
  }

  // Validar teléfono
  if (!isValidCustomerPhone(customerData.phone)) {
    errors.phone = 'El teléfono debe tener al menos 7 caracteres';
  }

  // Verificar duplicado de documento
  if (customerData.documentType && customerData.documentNumber) {
    const customerActual = excludeId ? customers.find(c => c.id === excludeId) : null;
    if (isDuplicateCustomerDocument(customerData.documentType, customerData.documentNumber, customers, customerActual)) {
      errors.documentNumber = 'El documento ya está registrado';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// ===== VALIDACIONES DE ÓRDENES DE SERVICIO =====

// Valida nombre del cliente en orden de servicio
export function isValidServiceOrderClientName(clientName) {
  return clientName && clientName.trim().length >= 2;
}

// Valida que la orden tenga al menos un servicio o producto
export function hasServiceOrderItems(servicios = [], productos = []) {
  return (servicios.length > 0) || (productos.length > 0);
}

// Valida dinero proporcionado para órdenes pagadas
export function isValidMoneyProvided(dineroProporcionado, totalGeneral) {
  if (!dineroProporcionado || isNaN(dineroProporcionado)) {
    return false;
  }
  return parseFloat(dineroProporcionado) >= totalGeneral;
}

// Validación completa de orden de servicio
export function validateServiceOrder(orderData, orders = [], totalGeneral = 0, status = '') {
  const errors = {};

  // Validación del nombre del cliente
  if (!isValidServiceOrderClientName(orderData.clientName)) {
    errors.clientName = 'El nombre del cliente es requerido y debe tener al menos 2 caracteres';
  }

  // Validación de servicios y productos
  if (!hasServiceOrderItems(orderData.servicios, orderData.productos)) {
    errors.items = 'Debe agregar al menos un servicio o producto';
  }

  // Validación de dinero proporcionado si el status es "Pagado"
  if (status === 'Pagado') {
    if (!isValidMoneyProvided(orderData.dineroProporcionado, totalGeneral)) {
      errors.dineroProporcionado = 'El dinero proporcionado es requerido y debe ser mayor o igual al total general';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
} 