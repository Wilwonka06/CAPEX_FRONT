import { validateCustomer } from '../../../../../shared/validations';
import { createCustomer as createCustomerApi, validateDocumentExists, validateEmailExists } from './CustomerService.js';

// Servicio para crear un cliente usando la API real
export async function createCustomer(customerData, customers = []) {
  // Validación local primero
  const validation = validateCustomer(customerData, customers);
  
  if (!validation.isValid) {
    // Lanza el primer error encontrado
    const firstError = Object.values(validation.errors)[0];
    throw new Error(firstError);
  }

  try {
    // Validar documento único en el backend
    const documentValidation = await validateDocumentExists(
      customerData.documentNumber, 
      customerData.documentType
    );
    
    if (documentValidation.exists) {
      throw new Error('Ya existe un cliente con este número de documento');
    }

    // Validar email único en el backend
    const emailValidation = await validateEmailExists(customerData.email);
    
    if (emailValidation.exists) {
      throw new Error('Ya existe un cliente con este email');
    }

    // Crear cliente en el backend
    const newCustomer = await createCustomerApi(customerData);
    return newCustomer;
    
  } catch (error) {
    // Si es un error de validación del backend, lo re-lanzamos
    if (error.message.includes('Ya existe') || error.message.includes('documento') || error.message.includes('email')) {
      throw error;
    }
    
    // Para otros errores, lanzamos un mensaje genérico
    throw new Error('Error al crear el cliente. Por favor, intenta nuevamente.');
  }
} 