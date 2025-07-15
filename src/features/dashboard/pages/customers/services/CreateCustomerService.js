import { validateCustomer } from '../../../../../shared/validations';

// Servicio simulado para crear un cliente
export async function createCustomer(customerData, customers = []) {
  // Validación interna usando ValidateCustomerService
  const validation = validateCustomer(customerData, customers);
  
  if (!validation.isValid) {
    // Lanza el primer error encontrado
    const firstError = Object.values(validation.errors)[0];
    throw new Error(firstError);
  }

  // Busca el máximo id actual y suma 1
  const maxId = customers.length ? Math.max(...customers.map(c => c.id)) : 0;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: maxId + 1,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        documentType: customerData.documentType,
        documentNumber: customerData.documentNumber,
        email: customerData.email,
        phone: customerData.phone,
        status: 'Activo'
      });
    }, 500);
  });
} 