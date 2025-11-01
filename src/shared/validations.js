// Función de normalización robusta (remueve tildes, convierte a minúsculas y elimina espacios extra)
export function normalizeText(str) {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remueve tildes y diacríticos
    .replace(/\s+/g, ' '); // Normaliza espacios múltiples a uno solo
}

export function isDuplicateProductName(nombre, productos) {
  const normalizedNombre = normalizeText(nombre);
  return productos.some(p => normalizeText(p.nombre) === normalizedNombre);
}

// Verifica si ya existe un servicio con el mismo nombre (insensible a mayúsculas, minúsculas, tildes y espacios)
export function isDuplicateServiceName(nombre, servicios, servicioActual = null) {
  const normalizedNombre = normalizeText(nombre);
  return servicios.some(s => {
    if (servicioActual && s.id === servicioActual.id) {
      return false;
    }
    return normalizeText(s.name) === normalizedNombre;
  });
}

// Verifica si ya existe un empleado con el mismo correo (insensible a mayúsculas, minúsculas, tildes y espacios)
export function isDuplicateEmployeeEmail(correo, empleados, empleadoActual = null) {
  const normalizedCorreo = normalizeText(correo);
  return empleados.some(e => {
    if (empleadoActual && e.id === empleadoActual.id) {
      return false;
    }
    return normalizeText(e.correo) === normalizedCorreo;
  });
}

// Verifica si ya existe un empleado con el mismo documento (insensible a mayúsculas, minúsculas, tildes y espacios)
export function isDuplicateEmployeeDocument(documento, empleados, empleadoActual = null) {
  const normalizedDocumento = normalizeText(documento);
  return empleados.some(e => {
    if (empleadoActual && e.id === empleadoActual.id) {
      return false;
    }
    return normalizeText(e.documento) === normalizedDocumento;
  });
}

// Verifica si ya existe una categoría con el mismo nombre (insensible a mayúsculas, minúsculas, tildes y espacios)
export function isDuplicateCategoryName(nombre, categorias, categoriaActual = null) {
  const normalizedNombre = normalizeText(nombre);
  return categorias.some(c => {
    if (categoriaActual && c.id === categoriaActual.id) {
      return false;
    }
    // Soporta tanto 'name' como 'Categoria' y 'nombre'
    return normalizeText(c.name || c.Categoria || c.nombre) === normalizedNombre;
  });
}

// Valida fecha de inicio de programación
export function validateSchedulingStartDate(fechaInicio) {
  const errors = {};
  
  if (!fechaInicio) {
    errors.fechaInicio = 'Fecha inicio obligatoria';
  } else {
    const fecha = new Date(fechaInicio);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fecha < hoy) {
      errors.fechaInicio = 'La fecha de inicio no puede ser anterior a hoy';
    }
  }
  
  return errors;
}

// Valida fecha de fin de programación
export function validateSchedulingEndDate(fechaFin, fechaInicio) {
  const errors = {};
  
  if (!fechaFin) {
    errors.fechaFin = 'Fecha fin obligatoria';
  } else if (fechaInicio && fechaFin < fechaInicio) {
    errors.fechaFin = 'La fecha fin no puede ser menor que la fecha inicio';
  }
  
  return errors;
}

// Valida hora de inicio de programación
export function validateSchedulingStartTime(horaInicio) {
  const errors = {};
  
  if (!horaInicio) {
    errors.horaInicio = 'Hora inicio obligatoria';
  }
  
  return errors;
}

// Valida hora de fin de programación
export function validateSchedulingEndTime(horaFin, horaInicio) {
  const errors = {};
  
  if (!horaFin) {
    errors.horaFin = 'Hora fin obligatoria';
  } else if (horaInicio && horaFin <= horaInicio) {
    errors.horaFin = 'La hora fin debe ser mayor que la hora inicio';
  }
  
  return errors;
}

// Valida repetición de programación
export function validateSchedulingRepetition(repeticion) {
  const errors = {};
  
  if (!repeticion) {
    errors.repeticion = 'Selecciona la frecuencia';
  } else if (!['No se repite', 'Semanal', 'Mensual'].includes(repeticion)) {
    errors.repeticion = 'Frecuencia inválida';
  }
  
  return errors;
}

// Valida días de programación
export function validateSchedulingDays(dias, repeticion) {
  const errors = {};
  
  if ((repeticion === 'Semanal' || repeticion === 'Mensual') && (!dias || dias.length === 0)) {
    errors.dias = 'Selecciona al menos un día';
  }
  
  return errors;
}

// Valida formulario completo de programación
export function validateSchedulingForm(formData) {
  const errors = {};

  // Validar fecha de inicio
  const fechaInicioErrors = validateSchedulingStartDate(formData.fechaInicio);
  if (fechaInicioErrors.fechaInicio) {
    errors.fechaInicio = fechaInicioErrors.fechaInicio;
  }

  // Validar fecha de fin
  const fechaFinErrors = validateSchedulingEndDate(formData.fechaFin, formData.fechaInicio);
  if (fechaFinErrors.fechaFin) {
    errors.fechaFin = fechaFinErrors.fechaFin;
  }

  // Validar hora de inicio
  const horaInicioErrors = validateSchedulingStartTime(formData.horaInicio);
  if (horaInicioErrors.horaInicio) {
    errors.horaInicio = horaInicioErrors.horaInicio;
  }

  // Validar hora de fin
  const horaFinErrors = validateSchedulingEndTime(formData.horaFin, formData.horaInicio);
  if (horaFinErrors.horaFin) {
    errors.horaFin = horaFinErrors.horaFin;
  }

  return errors;
}

// Valida nombre de empleado
export function validateEmployeeName(nombre) {
  const errors = {};
  
  if (!nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio';
  } else if (!isValidTextLength(nombre, 2, 30)) {
    errors.nombre = 'El nombre debe tener entre 2 y 30 caracteres';
  }
  
  return errors;
}

// Valida apellido de empleado
export function validateEmployeeLastName(apellido) {
  const errors = {};
  if (!apellido.trim()) {
    errors.apellido = 'El apellido es obligatorio';
  } else if (!isValidTextLength(apellido, 2, 30)) {
    errors.apellido = 'El apellido debe tener entre 2 y 30 caracteres';
  }
  return errors;
}

// Valida documento de empleado
export function validateEmployeeDocument(documento, empleados = [], empleadoActual = null) {
  const errors = {};
  
  if (!documento.trim()) {
    errors.documento = 'El documento es obligatorio';
  } else if (!isValidDocumentNumber(documento)) {
    errors.documento = 'El documento debe tener entre 8 y 15 dígitos';
  } else if (isDuplicateEmployeeDocument(documento, empleados, empleadoActual)) {
    errors.documento = 'Ya existe un empleado con este documento';
  }
  
  return errors;
}

// Valida correo de empleado
export function validateEmployeeEmail(correo, empleados = [], empleadoActual = null) {
  const errors = {};
  
  if (!correo.trim()) {
    errors.correo = 'El correo es obligatorio';
  } else if (!isValidEmail(correo)) {
    errors.correo = 'Formato de correo electrónico inválido';
  } else if (isDuplicateEmployeeEmail(correo, empleados, empleadoActual)) {
    errors.correo = 'Ya existe un empleado con este correo';
  }
  
  return errors;
}

// Valida contraseña de empleado
export function validateEmployeePassword(contrasena) {
  const errors = {};
  
  if (!contrasena.trim()) {
    errors.contrasena = 'La contraseña es obligatoria';
  } else if (!isValidPassword(contrasena)) {
    errors.contrasena = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
  }
  
  return errors;
}

// Valida confirmación de contraseña
export function validatePasswordConfirmation(contrasena, confirmarContrasena) {
  const errors = {};
  
  if (!confirmarContrasena.trim()) {
    errors.confirmarContrasena = 'Confirma la contraseña';
  } else if (contrasena !== confirmarContrasena) {
    errors.confirmarContrasena = 'Las contraseñas no coinciden';
  }
  
  return errors;
}

// Valida formulario completo de empleado (crear)
export function validateEmployeeForm(formData, empleados = []) {
  const errors = {};

  // Validar nombre
  const nombreErrors = validateEmployeeName(formData.nombre);
  if (nombreErrors.nombre) {
    errors.nombre = nombreErrors.nombre;
  }

  // Validar tipo de documento
  if (!formData.tipoDocumento.trim()) {
    errors.tipoDocumento = 'El tipo de documento es obligatorio';
  } else if (!isValidDocumentType(formData.tipoDocumento)) {
    errors.tipoDocumento = 'Tipo de documento inválido';
  }

  // Validar documento
  const documentoErrors = validateEmployeeDocument(formData.documento, empleados);
  if (documentoErrors.documento) {
    errors.documento = documentoErrors.documento;
  }

  // Validar teléfono
  if (!formData.telefono.trim()) {
    errors.telefono = 'El teléfono es obligatorio';
  } else if (!isValidPhone(formData.telefono)) {
    errors.telefono = 'El teléfono debe tener entre 7 y 15 dígitos';
  }

  // Validar correo
  const correoErrors = validateEmployeeEmail(formData.correo, empleados);
  if (correoErrors.correo) {
    errors.correo = correoErrors.correo;
  }

  // Validar dirección
  if (!formData.direccion.trim()) {
    errors.direccion = 'La dirección es obligatoria';
  } else if (!isValidTextLength(formData.direccion, 5, 200)) {
    errors.direccion = 'La dirección debe tener entre 5 y 200 caracteres';
  }

  // Nota: Las contraseñas son auto-generadas con el número de documento, por lo que no se validan manualmente

  // Validar estado
  if (!formData.estado.trim()) {
    errors.estado = 'El estado es obligatorio';
  }

  return errors;
}

// Valida formulario completo de empleado (editar)
export function validateEmployeeEditForm(formData, empleados = [], empleadoActual = null) {
  const errors = {};

  // Validar nombre
  const nombreErrors = validateEmployeeName(formData.nombre);
  if (nombreErrors.nombre) {
    errors.nombre = nombreErrors.nombre;
  }

  // Validar tipo de documento
  if (!formData.tipoDocumento.trim()) {
    errors.tipoDocumento = 'El tipo de documento es obligatorio';
  } else if (!isValidDocumentType(formData.tipoDocumento)) {
    errors.tipoDocumento = 'Tipo de documento inválido';
  }

  // Validar documento
  const documentoErrors = validateEmployeeDocument(formData.documento, empleados, empleadoActual);
  if (documentoErrors.documento) {
    errors.documento = documentoErrors.documento;
  }

  // Validar teléfono
  if (!formData.telefono.trim()) {
    errors.telefono = 'El teléfono es obligatorio';
  } else if (!isValidPhone(formData.telefono)) {
    errors.telefono = 'El teléfono debe tener entre 7 y 15 dígitos';
  }

  // Validar correo
  const correoErrors = validateEmployeeEmail(formData.correo, empleados, empleadoActual);
  if (correoErrors.correo) {
    errors.correo = correoErrors.correo;
  }

  // Validar dirección
  if (!formData.direccion.trim()) {
    errors.direccion = 'La dirección es obligatoria';
  } else if (!isValidTextLength(formData.direccion, 5, 200)) {
    errors.direccion = 'La dirección debe tener entre 5 y 200 caracteres';
  }

  // Validar estado
  if (!formData.estado.trim()) {
    errors.estado = 'El estado es obligatorio';
  }

  return errors;
}

// Valida categoría de servicios
export function validateCategory(categoria, existingCategories = [], categoriaActual = null) {
  const errors = {};
  
  if (!categoria.trim()) {
    errors.categoria = 'La categoría es obligatoria';
  } else if (!isValidTextLength(categoria, 2, 50)) {
    errors.categoria = 'La categoría debe tener entre 2 y 50 caracteres';
  } else if (isDuplicateCategoryName(categoria, existingCategories, categoriaActual)) {
    errors.categoria = 'Ya existe una categoría con este nombre';
  }
  
  return errors;
}

// Valida descripción de categoría
export function validateCategoryDescription(descripcion) {
  const errors = {};
  
  if (!descripcion.trim()) {
    errors.descripcion = 'La descripción es obligatoria';
  } else if (!isValidTextLength(descripcion, 5, 200)) {
    errors.descripcion = 'La descripción debe tener entre 5 y 200 caracteres';
  }
  
  return errors;
}

// Valida formulario completo de categoría de servicios
export function validateCategoryForm(formData, existingCategories = [], categoriaActual = null) {
  const errors = {};
  
  // Validar categoría
  const categoriaErrors = validateCategory(formData.Categoria, existingCategories, categoriaActual);
  if (categoriaErrors.categoria) {
    errors.Categoria = categoriaErrors.categoria;
  }
  
  // Validar descripción
  const descripcionErrors = validateCategoryDescription(formData.Descripcion);
  if (descripcionErrors.descripcion) {
    errors.Descripcion = descripcionErrors.descripcion;
  }
  
  // Validar estado
  if (!formData.estado) {
    errors.estado = 'El estado es obligatorio';
  }
  
  return errors;
}

// Valida nombre de servicio
export function validateServiceName(servicio, existingServices = [], servicioActual = null) {
  const errors = {};
  
  if (!servicio.trim()) {
    errors.servicio = 'El nombre del servicio es obligatorio';
  } else if (!isValidTextLength(servicio, 2, 100)) {
    errors.servicio = 'El nombre del servicio debe tener entre 2 y 100 caracteres';
  } else if (isDuplicateServiceName(servicio, existingServices, servicioActual)) {
    errors.servicio = 'Ya existe un servicio con este nombre';
  }
  
  return errors;
}

// Valida descripción de servicio
export function validateServiceDescription(descripcion) {
  const errors = {};
  
  if (!descripcion.trim()) {
    errors.descripcion = 'La descripción es obligatoria';
  } else if (!isValidTextLength(descripcion, 5, 300)) {
    errors.descripcion = 'La descripción debe tener entre 5 y 300 caracteres';
  }
  
  return errors;
}

// Valida duración de servicio
export function validateServiceDuration(duracion) {
  const errors = {};
  
  if (!duracion) {
    errors.duracion = 'La duración es obligatoria';
  } else if (isNaN(duracion) || Number(duracion) <= 0) {
    errors.duracion = 'La duración debe ser un número mayor a 0';
  } else if (Number(duracion) > 480) { // Máximo 8 horas
    errors.duracion = 'La duración no puede ser mayor a 480 minutos (8 horas)';
  }
  
  return errors;
}

// Valida precio de servicio
export function validateServicePrice(precio) {
  const errors = {};
  
  if (!precio) {
    errors.precio = 'El precio es obligatorio';
  } else if (isNaN(precio) || Number(precio) <= 0) {
    errors.precio = 'El precio debe ser un número mayor a 0';
  } else if (Number(precio) > 1000000) { // Máximo 1 millón
    errors.precio = 'El precio no puede ser mayor a 1,000,000';
  }
  
  return errors;
}

// Valida formulario completo de servicio
export function validateServiceForm(formData, existingServices = [], servicioActual = null) {
  const errors = {};
  
  // Validar nombre del servicio
  const servicioErrors = validateServiceName(formData.Servicio, existingServices, servicioActual);
  if (servicioErrors.servicio) {
    errors.Servicio = servicioErrors.servicio;
  }
  
  // Validar categoría
  if (!formData.Categoria) {
    errors.Categoria = 'La categoría es obligatoria';
  }
  
  // Validar descripción
  const descripcionErrors = validateServiceDescription(formData.Descripcion);
  if (descripcionErrors.descripcion) {
    errors.Descripcion = descripcionErrors.descripcion;
  }
  
  // Validar duración
  const duracionErrors = validateServiceDuration(formData.duracion);
  if (duracionErrors.duracion) {
    errors.duracion = duracionErrors.duracion;
  }
  
  // Validar precio
  const precioErrors = validateServicePrice(formData.precio);
  if (precioErrors.precio) {
    errors.precio = precioErrors.precio;
  }
  
  // Validar estado
  if (!formData.estado) {
    errors.estado = 'El estado es obligatorio';
  }
  
  return errors;
}

// Verifica si ya existe un proveedor con el mismo correo (insensible a mayúsculas, minúsculas, tildes y espacios)
export function isDuplicateSupplierEmail(correo, proveedores, proveedorActual = null) {
  const normalizedCorreo = normalizeText(correo);
  return proveedores.some(p => {
    // Si estamos editando, excluir el proveedor actual
    if (proveedorActual && p.id === proveedorActual.id) {
      return false;
    }
    return normalizeText(p.correo) === normalizedCorreo;
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
  // Nota: Esta validación es básica, ya que el campo de teléfono en los formularios de cliente
  // ahora usa 'isNumeric' y longitud mínima. Si necesitas código de país, ajusta la regex
  const phoneRegex = /^\d{7,15}$/; // Asumiendo solo números y longitud, sin '+' inicial
  return phoneRegex.test(telefono);
}

// Valida tipo de proveedor (N o J)
export function isValidSupplierType(tipo) {
  return ['N', 'J'].includes(tipo.toUpperCase());
}

// Valida tipo de documento
export function isValidDocumentType(tipo) {

  return ['Cedula de ciudadania', 'Tarjeta de identidad', 'Cedula de extranjeria', 'Pasaporte'].includes(tipo);

}

// Valida número de documento (solo números)
export function isValidDocumentNumber(documento) {
  const docRegex = /^\d{8,15}$/;
  return docRegex.test(documento);
}

// Valida contraseña (mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número)
//export function isValidPassword(password) {
  //const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  //return passwordRegex.test(password);
//}

// Valida longitud de texto
export function isValidTextLength(text, minLength = 2, maxLength = 50) {
  if (!text) return false;
  const trimmedText = text.trim();
  return trimmedText.length >= minLength && trimmedText.length <= maxLength;
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
  const normalizar = (str) => (str ?? '').trim().toLowerCase();
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

// Permite letras (incluyendo acentos y Ñ/ñ), números y espacios. Excluye caracteres especiales.
export function isValidAlphaNumericSpace(value) {
  if (value === null || value === undefined || value.trim() === '') return true; // Considerar válido si vacío, para que la validación de 'requerido' lo maneje.
  const regex = /^[A-Za-z0-9\u00C0-\u00FF\sñÑ]+$/;
  return regex.test(value);
}

// Valida que empiece por una letra (no número, símbolo o espacio)
export function startsWithAlpha(value) {
  if (value === null || value === undefined || value.trim() === '') return true; // Considerar válido si vacío
  const regex = /^[A-Za-z\u00C0-\u00FFñÑ]/;
  return regex.test(value);
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

  return { isValid: Object.keys(errors).length === 0, errors };
}

// ===== VALIDACIONES DE CLIENTES =====

// Verifica si ya existe un cliente con el mismo email
export function isDuplicateCustomerEmail(email, customers, customerActual = null) {
  const normalizar = (str) => (str ?? '').trim().toLowerCase();
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

export function isValidPassword(password) {
  // Al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/;
  return regex.test(password);
}

// Valida teléfono de cliente (requerido, mínimo 7 caracteres)
export function isValidCustomerPhone(phone) {
  // Ya que en el formulario se usa isNumeric, esta validación se enfoca en la longitud y si es requerido.
  return phone && phone.trim().length >= 7;
}

// Valida que solo contenga letras (incluyendo tildes, ñ, Ñ y espacios)
export function isValidAlphaOnly(value) {
  if (value === null || value === undefined || value.trim() === '') return true;
  const regex = /^[A-Za-z\u00C0-\u00FF\sñÑ]+$/;
  return regex.test(value);
}

// Valida que solo contenga números (usado para docNumber y phone en clientes)
export function isNumeric(value) {
  if (value === null || value === undefined || String(value).trim() === '') return true;
  const regex = /^\d+$/;
  return regex.test(String(value));
}

// Valida teléfono con formato internacional (acepta + al inicio)
export function isNumericPhone(value) {
  if (value === null || value === undefined || String(value).trim() === '') return true;
  const regex = /^\+?\d+$/;
  return regex.test(String(value));
}

// ===== VALIDACIONES DE CONTRASEÑA (para clientes) =====
// export function isValidPassword(password) {
//   // Al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
//   const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
//   return regex.test(password);
// }

// Valida si dos contraseñas coinciden
export function isPasswordMatch(password, confirmPassword) {
  return password === confirmPassword;
}

// Validación completa de cliente
export function validateCustomer(customerData, customers = [], excludeId = null, isSubmit = false) {
  const errors = {};
  // Tipo de documento
  if (!customerData.documentType) {
    errors.documentType = 'El tipo de documento es requerido.';
  }
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
  // Número de Documento
  if (!customerData.documentNumber || customerData.documentNumber.trim().length < 5) {
    errors.documentNumber = 'El número de documento es requerido y debe tener al menos 5 caracteres.';
  } else {
    if (!isNumeric(customerData.documentNumber)) { // Usa isNumeric para el número de documento
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
  } else if (!isNumericPhone(customerData.phone)) { // Usa isNumericPhone para el teléfono (acepta +)
    errors.phone = 'Solo se permiten números y el símbolo + al inicio.';
  } else if (customerData.phone.replace('+', '').length < 7) {
    errors.phone = 'El teléfono debe tener al menos 7 dígitos.';
  }
  // Los clientes no necesitan contraseñas - son solo datos de contacto
  return { isValid: Object.keys(errors).length === 0, errors };
}

// ===== VALIDACIONES DE ÓRDENES DE SERVICIO =====

// Valida nombre del cliente en orden de servicio
export function isValidServiceOrderClientName(clientName) {
  return clientName && clientName.trim().length >= 2;
}

// Valida que la orden tenga al menos un servicio (productos son opcionales)
export function hasServiceOrderItems(servicios = [], productos = []) {
  return servicios.length > 0;
}

// Valida dinero proporcionado para órdenes pagadas
export function isValidMoneyProvided(dineroProporcionado, totalGeneral) {
  if (dineroProporcionado === null || dineroProporcionado === undefined || isNaN(dineroProporcionado)) {
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

  // Validación de servicios (productos son opcionales)
  if (!hasServiceOrderItems(orderData.servicios, orderData.productos)) {
    errors.items = 'Debe agregar al menos un servicio';
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

// Valida que el nombre tenga al menos 2 caracteres y no sea solo espacios
export function isValidName(name) {
  return name && name.trim().length >= 2;
}

// ===== VALIDACIONES PERSONALIZADAS PARA USUARIOS =====

// Valida documento según tipo
export function validateUserDocument(tipo, documento) {
  if (!documento) return 'El documento es obligatorio';
  if (tipo === 'Pasaporte') {
    if (!/^[A-Z]{3}\d{6}$/.test(documento)) {
      return 'Pasaporte: 3 letras mayúsculas seguidas de 6 dígitos (ej: ABC123456)';
    }
  } else if (tipo === 'Cedula de ciudadania' || tipo === 'Tarjeta de identidad') {
    if (!/^\d{7,15}$/.test(documento)) {
      return 'Debe tener solo números (7 a 15 dígitos)';
    }
  } else if (tipo === 'Cedula de extranjeria') {
    if (!/^\d{7,15}$/.test(documento)) {
      return 'Debe tener solo números (7 a 15 dígitos)';
    }
  } else if (tipo === 'NIT') {
    if (!/^[A-Za-z]\d+$/.test(documento)) {
      return 'NIT: Una letra seguida de números (ej: A123456789)';
    }
  } else {
    return 'Selecciona un tipo de documento válido';
  }
  return '';
}

// Valida teléfono (formato internacional: opcional +, código de país + números)
export function validateUserPhone(telefono) {
  if (!telefono) return 'El teléfono es obligatorio';
  // Remover espacios para validación
  const cleanPhone = telefono.replace(/\s/g, '');
  // Regex que permite formato internacional: opcional +, primer dígito 1-9, luego 1-14 dígitos
  if (!/^\+?[1-9]\d{1,14}$/.test(cleanPhone)) {
    return 'Formato de teléfono inválido. Debe comenzar con + seguido del código de país y número (ej: +571234567890)';
  }
  return '';
}

function normalizar(valor) {
  return (valor ?? '').trim().toLowerCase();
}