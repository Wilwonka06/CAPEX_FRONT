import React, { useState, useEffect } from "react";
import ServiceSelector from "./ServiceSelector";
import ProductSelector from "./ProductSelector";

const EditServiceOrder = ({ isOpen, onClose, order, onEdit, loading }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    dineroProporcionado: 0,
    devolucion: 0,
    status: "En ejecucion"
  });
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [errors, setErrors] = useState({});

  // Cargar datos de la orden al abrir
  useEffect(() => {
    if (order) {
      setFormData({
        clientName: order.clientName || "",
        dineroProporcionado: order.dineroProporcionado || 0,
        devolucion: order.devolucion || 0,
        status: order.status || "En ejecucion"
      });
      setSelectedServices(order.servicios || []);
      setSelectedProducts(order.productos || []);
      setErrors({});
    }
  }, [order]);

  // Calcular totales
  const totalServices = selectedServices.reduce((total, service) => total + (service.subtotal || 0), 0);
  const totalProducts = selectedProducts.reduce((total, product) => total + (product.subtotal || 0), 0);
  const totalGeneral = totalServices + totalProducts;

  // Calcular devolución automáticamente
  useEffect(() => {
    const devolucion = Math.max(0, formData.dineroProporcionado - totalGeneral);
    setFormData(prev => ({
      ...prev,
      devolucion: devolucion
    }));
  }, [formData.dineroProporcionado, totalGeneral]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.clientName.trim()) newErrors.clientName = "El nombre del cliente es requerido";
    if (selectedServices.length === 0 && selectedProducts.length === 0) newErrors.items = "Debe agregar al menos un servicio o producto";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'dineroProporcionado' ? parseFloat(value) || 0 : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onEdit({
      clientName: formData.clientName,
      dineroProporcionado: formData.dineroProporcionado,
      devolucion: formData.devolucion,
      status: formData.status,
      servicios: selectedServices,
      productos: selectedProducts,
      totalServices,
      totalProducts,
      totalGeneral
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Editar Orden de Servicio</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cliente */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium w-20 text-text-main">Cliente:</label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="flex-1 border border-accent bg-background text-text-main rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Nombre del cliente"
            />
          </div>
          {/* Estado */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium w-20 text-text-main">Estado:</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="flex-1 border border-accent bg-background text-text-main rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="En ejecucion">En ejecución</option>
              <option value="Pagado">Pagado</option>
            </select>
          </div>
          {/* Servicios */}
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium w-20">Servicios:</label>
              <div className="flex-1">
                <ServiceSelector
                  selectedServices={selectedServices}
                  onServicesChange={setSelectedServices}
                />
              </div>
            </div>
          </div>
          {/* Productos */}
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium w-20">Productos:</label>
              <div className="flex-1">
                <ProductSelector
                  selectedProducts={selectedProducts}
                  onProductsChange={setSelectedProducts}
                />
              </div>
            </div>
          </div>
          {/* Resumen de totales */}
          <div className="border rounded p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Resumen de Venta</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Total Servicios:</span>
                  <span className="text-blue-600 font-bold">${totalServices.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Productos:</span>
                  <span className="text-green-600 font-bold">${totalProducts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold text-lg">TOTAL GENERAL:</span>
                  <span className="text-purple-600 font-bold text-lg">${totalGeneral.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Dinero proporcionado por el cliente:</label>
                  <input
                    type="number"
                    name="dineroProporcionado"
                    value={formData.dineroProporcionado}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Devolución:</label>
                  <div className="w-full border rounded px-3 py-2 text-sm bg-gray-100 font-bold">
                    ${formData.devolucion.toLocaleString()}
                  </div>
                </div>
                {formData.dineroProporcionado < totalGeneral && totalGeneral > 0 && (
                  <div className="text-red-600 text-sm font-medium">
                    Falta: ${(totalGeneral - formData.dineroProporcionado).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Errores */}
          {errors.items && <div className="text-red-600 text-center text-sm">{errors.items}</div>}
          {/* Botones */}
          <div className="flex justify-center space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-accent text-text-main rounded hover:bg-accent-light transition">Cancelar</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-primary-dark text-white rounded hover:bg-primary transition disabled:opacity-50">{loading ? "Guardando..." : "Guardar Cambios"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServiceOrder; 