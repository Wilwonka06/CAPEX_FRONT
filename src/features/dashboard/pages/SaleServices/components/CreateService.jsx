import React, { useState, useEffect } from "react";
import ServiceSelector from "./ServiceSelector";
import ProductSelector from "./ProductSelector";

const CreateService = ({ onBack }) => {
  const [formData, setFormData] = useState({
    cliente: "",
    dineroProporcionado: 0,
    devolucion: 0
  });

  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Calcular totales
  const totalServices = selectedServices.reduce((total, service) => total + service.subtotal, 0);
  const totalProducts = selectedProducts.reduce((total, product) => total + product.subtotal, 0);
  const totalGeneral = totalServices + totalProducts;

  // Calcular devolución automáticamente
  useEffect(() => {
    const devolucion = Math.max(0, formData.dineroProporcionado - totalGeneral);
    setFormData(prev => ({
      ...prev,
      devolucion: devolucion
    }));
  }, [formData.dineroProporcionado, totalGeneral]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos del servicio:", {
      ...formData,
      servicios: selectedServices,
      productos: selectedProducts,
      totalServices,
      totalProducts,
      totalGeneral
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'dineroProporcionado' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="p-6 bg-white">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-3">
          <i className="bi bi-arrow-left text-xl"></i>
        </button>
        <h2 className="text-xl font-semibold">Crear Venta de Servicio</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium w-20">Cliente:</label>
          <input
            type="text"
            name="cliente"
            value={formData.cliente}
            onChange={handleInputChange}
            className="flex-1 border rounded px-3 py-1 text-sm"
            placeholder="Buscar cliente..."
          />
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
                  onChange={handleInputChange}
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

        {/* Botones */}
        <div className="flex justify-center space-x-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Crear Venta de Servicio
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateService;