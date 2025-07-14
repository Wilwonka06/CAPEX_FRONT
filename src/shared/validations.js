// Función de normalización robusta (remueve tildes, convierte a minúsculas y elimina espacios extra)
export function normalizeText(str) {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remueve tildes y diacríticos
    .replace(/\s+/g, ' '); // Normaliza espacios múltiples a uno solo
}

// Verifica si ya existe un producto con el mismo nombre (insensible a mayúsculas, minúsculas, tildes y espacios)
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
    // Si estamos editando, excluir la categoría actual
    if (categoriaActual && c.id === categoriaActual.id) {
      return false;
    }
    return normalizeText(c.name) === normalizedNombre;
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
  
  // Validar repetición
  const repeticionErrors = validateSchedulingRepetition(formData.repeticion);
  if (repeticionErrors.repeticion) {
    errors.repeticion = repeticionErrors.repeticion;
  }
  
  // Validar días
  const diasErrors = validateSchedulingDays(formData.dias, formData.repeticion);
  if (diasErrors.dias) {
    errors.dias = diasErrors.dias;
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
  
  // Validar apellido
  const apellidoErrors = validateEmployeeLastName(formData.apellido);
  if (apellidoErrors.apellido) {
    errors.apellido = apellidoErrors.apellido;
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
  
  // Validar correo
  const correoErrors = validateEmployeeEmail(formData.correo, empleados);
  if (correoErrors.correo) {
    errors.correo = correoErrors.correo;
  }
  
  // Validar contraseña
  const contrasenaErrors = validateEmployeePassword(formData.contrasena);
  if (contrasenaErrors.contrasena) {
    errors.contrasena = contrasenaErrors.contrasena;
  }
  
  // Validar confirmación de contraseña
  const confirmacionErrors = validatePasswordConfirmation(formData.contrasena, formData.confirmarContrasena);
  if (confirmacionErrors.confirmarContrasena) {
    errors.confirmarContrasena = confirmacionErrors.confirmarContrasena;
  }
  
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
  
  // Validar apellido
  const apellidoErrors = validateEmployeeLastName(formData.apellido);
  if (apellidoErrors.apellido) {
    errors.apellido = apellidoErrors.apellido;
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
  
  // Validar correo
  const correoErrors = validateEmployeeEmail(formData.correo, empleados, empleadoActual);
  if (correoErrors.correo) {
    errors.correo = correoErrors.correo;
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
  const phoneRegex = /^\+\d{7,15}$/;
  return phoneRegex.test(telefono);
}

// Valida tipo de proveedor (N o J)
export function isValidSupplierType(tipo) {
  return ['N', 'J'].includes(tipo.toUpperCase());
}

// Valida tipo de documento
export function isValidDocumentType(tipo) {
  return ['CC', 'TI', 'CE', 'PAS'].includes(tipo);
}

// Valida número de documento (solo números)
export function isValidDocumentNumber(documento) {
  const docRegex = /^\d{8,15}$/;
  return docRegex.test(documento);
}

// Valida contraseña (mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número)
export function isValidPassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

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