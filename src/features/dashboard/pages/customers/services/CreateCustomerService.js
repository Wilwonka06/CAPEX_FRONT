export const createCustomer = async (customerData, customers) => {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Validar que el email no esté duplicado
  const emailExists = customers.some(customer => customer.email === customerData.email);
  if (emailExists) {
    throw new Error('El correo electrónico ya está registrado');
  }

  // Validar que el documento no esté duplicado
  const documentExists = customers.some(customer => 
    customer.documentType === customerData.documentType && 
    customer.documentNumber === customerData.documentNumber
  );
  if (documentExists) {
    throw new Error('El documento ya está registrado');
  }

  // Generar nuevo ID (máximo actual + 1)
  const maxId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) : 0;
  const newId = maxId + 1;

  const newCustomer = {
    id: newId,
    documentType: customerData.documentType,
    documentNumber: customerData.documentNumber,
    firstName: customerData.firstName,
    lastName: customerData.lastName,
    email: customerData.email,
    phone: customerData.phone,
    status: 'Activo'
  };

  return newCustomer;
}; 