export const editCustomer = async (customerData) => {
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