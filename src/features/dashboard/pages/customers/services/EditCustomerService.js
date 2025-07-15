import { validateCustomer } from '../../../../../shared/validations';

// Servicio simulado para editar un cliente
export async function editCustomer(customerData, allCustomers = []) {
  // Validación interna usando ValidateCustomerService
  const otherCustomers = allCustomers.filter(c => c.id !== customerData.id);
  const validation = validateCustomer(customerData, otherCustomers, customerData.id);
  
  if (!validation.isValid) {
    // Lanza el primer error encontrado
    const firstError = Object.values(validation.errors)[0];
    throw new Error(firstError);
  }

  // Simula una petición a backend y retorna el cliente actualizado
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: customerData.id,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        documentType: customerData.documentType,
        documentNumber: customerData.documentNumber,
        email: customerData.email,
        phone: customerData.phone,
        status: customerData.status
      });
    }, 500);
  });
} 