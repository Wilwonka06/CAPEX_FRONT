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
  } else if (!isValidAlphaNumericSpace(formData.nombre)) {
    errors.nombre = 'El nombre solo puede contener letras, números y espacios.';
  } else if (!startsWithAlpha(formData.nombre)) {
    errors.nombre = 'El nombre debe comenzar con una letra.';
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

// Valida que solo contenga letras (incluyendo tildes, ñ, Ñ y espacios)
export function isValidAlphaOnly(value) {
  if (value === null || value === undefined || value.trim() === '') return true;
  const regex = /^[A-Za-z\u00C0-\u00FF\sñÑ]+$/;
  return regex.test(value);
}

// Valida que empiece por una letra (no número, símbolo o espacio)
export function startsWithAlpha(value) {
  if (value === null || value === undefined || value.trim() === '') return true;
  const regex = /^[A-Za-z\u00C0-\u00FFñÑ]/;
  return regex.test(value);
}

// Valida que solo contenga números
export function isNumeric(value) {
  if (value === null || value === undefined || String(value).trim() === '') return true;
  const regex = /^\d+$/;
  return regex.test(String(value));
}

// ===== VALIDACIONES DE CONTRASEÑA =====
export function isValidPassword(password) {
  // Al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  return regex.test(password);
}

// Validación completa de cliente
export function validateCustomer(customerData, customers = [], excludeId = null, isSubmit = false) {
  const errors = {};
  // Nombres
  if (!customerData.firstName || customerData.firstName.trim().length < 2) {
    errors.firstName = 'El nombre es requerido y debe tener al menos 2 caracteres.';
  } else {
    if (!isValidAlphaOnly(customerData.firstName)) {
      errors.firstName = 'Solo se permiten letras y espacios.';
    } else if (!startsWithAlpha(customerData.firstName)) {
      errors.firstName = 'Debe comenzar con una letra.';
    }
  }
  if (!customerData.lastName || customerData.lastName.trim().length < 2) {
    errors.lastName = 'El apellido es requerido y debe tener al menos 2 caracteres.';
  } else {
    if (!isValidAlphaOnly(customerData.lastName)) {
      errors.lastName = 'Solo se permiten letras y espacios.';
    } else if (!startsWithAlpha(customerData.lastName)) {
      errors.lastName = 'Debe comenzar con una letra.';
    }
  }
  // Tipo de documento
  if (!customerData.documentType) {
    errors.documentType = 'El tipo de documento es requerido.';
  }
  // Documento
  if (!customerData.documentNumber || customerData.documentNumber.trim().length < 5) {
    errors.documentNumber = 'El número de documento es requerido y debe tener al menos 5 caracteres.';
  } else {
    if (!isNumeric(customerData.documentNumber)) {
      errors.documentNumber = 'Solo se permiten números.';
    }
  }
  // Email
  if (!customerData.email) {
    errors.email = 'El correo electrónico es requerido.';
  } else if (!isValidEmail(customerData.email)) {
    errors.email = 'Correo electrónico inválido.';
  } else if (customers.some(c => c.email === customerData.email && (!excludeId || c.id !== excludeId))) {
    errors.email = 'El correo electrónico ya está registrado.';
  }
  // Teléfono
  if (!customerData.phone) {
    errors.phone = 'El teléfono es requerido.';
  } else if (!isNumeric(customerData.phone)) {
    errors.phone = 'Solo se permiten números.';
  } else if (customerData.phone.length < 7) {
    errors.phone = 'El teléfono debe tener al menos 7 dígitos.';
  }
  // Password y confirmPassword
  if (!excludeId) { // CreateCustomer: password requerido
    if (!customerData.password) {
      errors.password = 'La contraseña es requerida.';
    } else if (!isValidPassword(customerData.password)) {
      errors.password = 'La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.';
    }
    if (!customerData.confirmPassword) {
      errors.confirmPassword = 'Confirma la contraseña.';
    } else if (customerData.password !== customerData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.';
    }
  } else { // EditCustomer: password opcional
    if (customerData.password) {
      if (!isValidPassword(customerData.password)) {
        errors.password = 'La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.';
      }
      if (!customerData.confirmPassword) {
        errors.confirmPassword = 'Confirma la contraseña.';
      } else if (customerData.password !== customerData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden.';
      }
    }
  }
  return { isValid: Object.keys(errors).length === 0, errors };
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

// ===== VALIDACIONES DE ROLES (EXTRA) =====

// Permite letras (incluyendo acentos y Ñ/ñ), números y espacios. Excluye caracteres especiales.
export function isValidAlphaNumericSpace(value) {
  if (value === null || value === undefined || value.trim() === '') return true; // Considerar válido si vacío, para que la validación de 'requerido' lo maneje.
  const regex = /^[A-Za-z0-9\u00C0-\u00FF\sñÑ]+$/;
  return regex.test(value);
} 