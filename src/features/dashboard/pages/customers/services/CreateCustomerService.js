import { validateCustomer } from './ValidateCustomerService';

export const createCustomer = async (customerData, customers) => {
  // Validación interna usando ValidateCustomerService
  const validation = validateCustomer(customerData, customers);
  
  if (!validation.isValid) {
    // Lanza el primer error encontrado
    const firstError = Object.values(validation.errors)[0];
    throw new Error(firstError);
  }

  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 1000));

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