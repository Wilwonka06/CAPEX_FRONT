import { toggleCustomerStatus as toggleCustomerStatusApi } from './CustomerService.js';

// Servicio para cambiar el estado de un cliente usando la API real
export async function toggleCustomerStatus(customerId) {
  try {
    const response = await toggleCustomerStatusApi(customerId);
    return response;
  } catch (error) {
    // Re-lanzar el error con el mensaje apropiado
    throw new Error(error.message || 'Error al cambiar el estado del cliente. Por favor, intenta nuevamente.');
  }
}

