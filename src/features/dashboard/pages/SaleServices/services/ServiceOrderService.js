// Servicio simulado para órdenes de servicio

export const createServiceOrder = async (orderData, orders) => {
  // Simula delay de API
  await new Promise(resolve => setTimeout(resolve, 500));

  // Validación básica: cliente requerido, al menos un servicio o producto
  if (!orderData.clientName || orderData.clientName.trim().length < 2) {
    throw new Error('El nombre del cliente es requerido');
  }
  if ((orderData.servicios?.length || 0) === 0 && (orderData.productos?.length || 0) === 0) {
    throw new Error('Debe agregar al menos un servicio o producto');
  }

  // Generar nuevo ID
  const maxId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) : 0;
  const newId = maxId + 1;

  return {
    id: newId,
    ...orderData
  };
};

export const editServiceOrder = async (orderData, orders) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Validación igual que en create
  if (!orderData.clientName || orderData.clientName.trim().length < 2) {
    throw new Error('El nombre del cliente es requerido');
  }
  if ((orderData.servicios?.length || 0) === 0 && (orderData.productos?.length || 0) === 0) {
    throw new Error('Debe agregar al menos un servicio o producto');
  }
  // Retorna la orden editada
  return { ...orderData };
};

export const deleteServiceOrder = async (orderId, orders) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // Retorna la lista filtrada
  return orders.filter(order => order.id !== orderId);
};

export const validateServiceOrder = (orderData, orders) => {
  const errors = {};
  if (!orderData.clientName || orderData.clientName.trim().length < 2) {
    errors.clientName = 'El nombre del cliente es requerido';
  }
  if ((orderData.servicios?.length || 0) === 0 && (orderData.productos?.length || 0) === 0) {
    errors.items = 'Debe agregar al menos un servicio o producto';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 