// Servicio para órdenes de servicio con validación centralizada

export const validateServiceOrder = (orderData, orders = [], totalGeneral = 0, status = '') => {
  const errors = {};

  // Validación del nombre del cliente
  if (!orderData.clientName || orderData.clientName.trim().length < 2) {
    errors.clientName = 'El nombre del cliente es requerido y debe tener al menos 2 caracteres';
  }

  // Validación de servicios y productos
  const hasServices = (orderData.servicios?.length || 0) > 0;
  const hasProducts = (orderData.productos?.length || 0) > 0;
  
  if (!hasServices && !hasProducts) {
    errors.items = 'Debe agregar al menos un servicio o producto';
  }

  // Validación de dinero proporcionado si el status es "Pagado"
  if (status === 'Pagado') {
    if (!orderData.dineroProporcionado || isNaN(orderData.dineroProporcionado)) {
      errors.dineroProporcionado = 'El dinero proporcionado es requerido y debe ser un número válido';
    } else if (parseFloat(orderData.dineroProporcionado) < totalGeneral) {
      errors.dineroProporcionado = `El dinero proporcionado debe ser mayor o igual al total general ($${totalGeneral.toLocaleString()})`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const createServiceOrder = async (orderData, orders) => {
  // Simula delay de API
  await new Promise(resolve => setTimeout(resolve, 500));

  // Calcular total general
  const totalServices = (orderData.servicios || []).reduce((sum, service) => sum + (service.subtotal || 0), 0);
  const totalProducts = (orderData.productos || []).reduce((sum, product) => sum + (product.subtotal || 0), 0);
  const totalGeneral = totalServices + totalProducts;

  // Validación centralizada
  const validation = validateServiceOrder(orderData, orders, totalGeneral, orderData.status || 'En ejecucion');
  
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0];
    throw new Error(firstError);
  }

  // Generar nuevo ID
  const maxId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) : 0;
  const newId = maxId + 1;

  // Calcular devolución
  const dineroProporcionado = orderData.dineroProporcionado || 0;
  const devolucion = Math.max(0, dineroProporcionado - totalGeneral);

  return {
    id: newId,
    ...orderData,
    totalServices,
    totalProducts,
    totalGeneral,
    devolucion,
    date: new Date().toLocaleDateString('es-ES'),
    time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  };
};

export const editServiceOrder = async (orderData, orders) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  // Calcular total general
  const totalServices = (orderData.servicios || []).reduce((sum, service) => sum + (service.subtotal || 0), 0);
  const totalProducts = (orderData.productos || []).reduce((sum, product) => sum + (product.subtotal || 0), 0);
  const totalGeneral = totalServices + totalProducts;

  // Validación centralizada
  const validation = validateServiceOrder(orderData, orders, totalGeneral, orderData.status);
  
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0];
    throw new Error(firstError);
  }

  // Calcular devolución
  const dineroProporcionado = orderData.dineroProporcionado || 0;
  const devolucion = Math.max(0, dineroProporcionado - totalGeneral);

  // Retorna la orden editada
  return { 
    ...orderData,
    totalServices,
    totalProducts,
    totalGeneral,
    devolucion
  };
};

export const deleteServiceOrder = async (orderId, orders) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // Retorna la lista filtrada
  return orders.filter(order => order.id !== orderId);
};

export const anularServiceOrder = async (orderId, services) => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simular validación
  const orderExists = services.find(service => service.id === orderId);
  if (!orderExists) {
    throw new Error("La orden de servicio no existe");
  }

  // Simular anulación - cambiar estado a "Anulado"
  const updatedServices = services.map(service => 
    service.id === orderId 
      ? { ...service, status: "Anulado" }
      : service
  );

  return updatedServices;
}; 