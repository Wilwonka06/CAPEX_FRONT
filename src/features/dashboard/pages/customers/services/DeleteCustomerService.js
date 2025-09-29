import { deleteCustomer as deleteCustomerApi } from './CustomerService.js';

// Servicio para eliminar un cliente usando la API real
export async function deleteCustomer(customerId) {
  try {
    const response = await deleteCustomerApi(customerId);
    return response;
  } catch (error) {
    // Re-lanzar el error con el mensaje apropiado
    throw new Error(error.message || 'Error al eliminar el cliente. Por favor, intenta nuevamente.');
  }
}

