import { validateCustomer } from './ValidateCustomerService';

export const editCustomer = async (customerData, allCustomers = []) => {
  // Validación interna usando ValidateCustomerService
  const otherCustomers = allCustomers.filter(c => c.id !== customerData.id);
  const validation = validateCustomer(customerData, otherCustomers);
  
  if (!validation.isValid) {
    // Lanza el primer error encontrado
    const firstError = Object.values(validation.errors)[0];
    throw new Error(firstError);
  }

  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 1000));

  const updatedCustomer = {
    id: customerData.id,
    documentType: customerData.documentType,
    documentNumber: customerData.documentNumber,
    firstName: customerData.firstName,
    lastName: customerData.lastName,
    email: customerData.email,
    phone: customerData.phone,
    status: customerData.status
  };

  return updatedCustomer;
}; 