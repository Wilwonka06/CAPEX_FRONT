export const validateCustomer = (customerData, customers, excludeId = null) => {
  const errors = {};

  // Validar nombre
  if (!customerData.firstName || customerData.firstName.trim().length < 2) {
    errors.firstName = 'El nombre debe tener al menos 2 caracteres';
  }

  // Validar apellido
  if (!customerData.lastName || customerData.lastName.trim().length < 2) {
    errors.lastName = 'El apellido debe tener al menos 2 caracteres';
  }

  // Validar tipo de documento
  if (!customerData.documentType) {
    errors.documentType = 'El tipo de documento es requerido';
  }

  // Validar número de documento
  if (!customerData.documentNumber || customerData.documentNumber.trim().length < 5) {
    errors.documentNumber = 'El número de documento debe tener al menos 5 caracteres';
  }

  // Validar email
  if (!customerData.email) {
    errors.email = 'El correo electrónico es requerido';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
    errors.email = 'El correo electrónico no es válido';
  } else {
    // Verificar duplicado de email
    const emailExists = customers.some(customer => 
      customer.email === customerData.email && customer.id !== excludeId
    );
    if (emailExists) {
      errors.email = 'El correo electrónico ya está registrado';
    }
  }

  // Validar teléfono
  if (!customerData.phone || customerData.phone.trim().length < 7) {
    errors.phone = 'El teléfono debe tener al menos 7 caracteres';
  }

  // Verificar duplicado de documento
  if (customerData.documentType && customerData.documentNumber) {
    const documentExists = customers.some(customer => 
      customer.documentType === customerData.documentType && 
      customer.documentNumber === customerData.documentNumber &&
      customer.id !== excludeId
    );
    if (documentExists) {
      errors.documentNumber = 'El documento ya está registrado';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 