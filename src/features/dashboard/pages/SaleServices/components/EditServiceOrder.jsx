import React, { useState, useEffect } from "react";
import ServiceSelector from "./ServiceSelector";
import ProductSelector from "./ProductSelector";
import { validateServiceOrder } from "../../../../../shared/validations";

const EditServiceOrder = ({ isOpen, onClose, onEdit, order, loading, services }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    dineroProporcionado: "",
    status: "En ejecucion"
  });

  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [errors, setErrors] = useState({});

  // Calcular totales
  const totalServices = selectedServices.reduce((total, service) => total + (service.subtotal || 0), 0);
  const totalProducts = selectedProducts.reduce((total, product) => total + (product.subtotal || 0), 0);
  const totalGeneral = totalServices + totalProducts;

  // Cargar datos del order cuando se abre el modal
  useEffect(() => {
    if (isOpen && order) {
      setFormData({
        clientName: order.clientName || "",
        dineroProporcionado: order.dineroProporcionado?.toString() || "",
        status: order.status || "En ejecucion"
      });
      setSelectedServices(order.servicios || []);
      setSelectedProducts(order.productos || []);
    }
  }, [isOpen, order]);

  // Validación en tiempo real
  useEffect(() => {
    if (isOpen) {
      const orderData = {
        ...formData,
        servicios: selectedServices,
        productos: selectedProducts
      };
      
      const validation = validateServiceOrder(orderData, services, totalGeneral, formData.status);
      setErrors(validation.errors);
    }
  }, [formData, selectedServices, selectedProducts, totalGeneral, formData.status, services, isOpen]);

  // Reset form cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        clientName: "",
        dineroProporcionado: "",
        status: "En ejecucion"
      });
      setSelectedServices([]);
      setSelectedProducts([]);
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (Object.keys(errors).length > 0 || loading) {
      return;
    }

    const orderData = {
      ...formData,
      servicios: selectedServices,
      productos: selectedProducts,
      totalServices,
      totalProducts,
      totalGeneral
    };

    onEdit(orderData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen || !order) return null;

  const EditOrderCard = ({ children }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 relative max-h-[90vh] overflow-y-auto w-full max-w-4xl">
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold disabled:opacity-50"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );

  return (
    <EditOrderCard>
      <div className="p-6">
        <h2 className="text-xl font-bold text-text-main mb-6">Editar Orden de Servicio</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Nombre del Cliente *
            </label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.clientName ? 'border-red-500' : 'border-accent'
              }`}
              placeholder="Ingrese el nombre del cliente..."
            />
            {errors.clientName && (
              <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>
            )}
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-accent rounded-md bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="En ejecucion">En ejecución</option>
              <option value="Pagado">Pagado</option>
            </select>
          </div>

          {/* Servicios */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Servicios
            </label>
            <ServiceSelector 
              selectedServices={selectedServices}
              onServicesChange={setSelectedServices}
            />
          </div>

          {/* Productos */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Productos
            </label>
            <ProductSelector 
              selectedProducts={selectedProducts}
              onProductsChange={setSelectedProducts}
            />
          </div>

          {errors.items && (
            <p className="text-red-500 text-sm">{errors.items}</p>
          )}

          {/* Resumen de totales */}
          <div className="border border-accent rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4 text-text-main">Resumen de Venta</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-text-main">Total Servicios:</span>
                  <span className="text-blue-600 font-bold">${totalServices.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium text-text-main">Total Productos:</span>
                  <span className="text-green-600 font-bold">${totalProducts.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold text-lg text-text-main">TOTAL GENERAL:</span>
                  <span className="text-purple-600 font-bold text-lg">${totalGeneral.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-text-main">
                    Dinero proporcionado:
                  </label>
                  <input
                    type="number"
                    name="dineroProporcionado"
                    value={formData.dineroProporcionado}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                      errors.dineroProporcionado ? 'border-red-500' : 'border-accent'
                    }`}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  {errors.dineroProporcionado && (
                    <p className="text-red-500 text-sm mt-1">{errors.dineroProporcionado}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-text-main">Devolución:</label>
                  <div className="w-full px-3 py-2 border border-accent rounded-md bg-background text-text-main font-bold">
                    ${Math.max(0, (formData.dineroProporcionado ? parseFloat(formData.dineroProporcionado) : 0) - totalGeneral).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || Object.keys(errors).length > 0}
              className="px-4 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle mr-2"></i>
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </EditOrderCard>
  );
};

export default EditServiceOrder; 