import { validateCustomer } from '../../../../../shared/validations';
import { updateCustomer as updateCustomerApi, validateDocumentExists, validateEmailExists } from './CustomerService.js';

// Servicio para editar un cliente usando la API real
export async function editCustomer(customerData, allCustomers = []) {
  // Validación local primero
  const otherCustomers = allCustomers.filter(c => c.id !== customerData.id);
  const validation = validateCustomer(customerData, otherCustomers, customerData.id);
  
  if (!validation.isValid) {
    // Lanza el primer error encontrado
    const firstError = Object.values(validation.errors)[0];
    throw new Error(firstError);
  }

  try {
    // Validar documento único en el backend (excluyendo el cliente actual)
    const documentValidation = await validateDocumentExists(
      customerData.documentNumber, 
      customerData.documentType,
      customerData.id
    );
    
    if (documentValidation.exists) {
      throw new Error('Ya existe otro cliente con este número de documento');
    }

    // Validar email único en el backend (excluyendo el cliente actual)
    const emailValidation = await validateEmailExists(customerData.email, customerData.id);
    
    if (emailValidation.exists) {
      throw new Error('Ya existe otro cliente con este email');
    }

    // Actualizar cliente en el backend
    const updatedCustomer = await updateCustomerApi(customerData.id, customerData);
    return updatedCustomer;
    
  } catch (error) {
    // Si es un error de validación del backend, lo re-lanzamos
    if (error.message.includes('Ya existe') || error.message.includes('documento') || error.message.includes('email')) {
      throw error;
    }
    
    // Para otros errores, lanzamos un mensaje genérico
    throw new Error('Error al actualizar el cliente. Por favor, intenta nuevamente.');
  }
} 