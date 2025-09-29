import React, { useState, useEffect, useCallback } from "react";
import ServiceSelector from "./ServiceSelector";
import ProductSelector from "./ProductSelector";
import ErrorBoundary from "./ErrorBoundary";
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
  const [touched, setTouched] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  // Calcular totales
  const totalServices = selectedServices.reduce((total, service) => total + (service.subtotal || 0), 0);
  const totalProducts = selectedProducts.reduce((total, product) => total + (product.subtotal || 0), 0);
  const totalGeneral = totalServices + totalProducts;

  // Define la lista de productos disponibles al inicio del componente
  // Elimina la definición de availableProducts

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

  // Validación solo cuando se envían servicios/productos (no en tiempo real)
  useEffect(() => {
    if (isOpen && (selectedServices.length > 0 || selectedProducts.length > 0)) {
      const orderData = {
        ...formData,
        servicios: selectedServices,
        productos: selectedProducts
      };
      
      const validation = validateServiceOrder(orderData, services, totalGeneral, formData.status);
      setErrors(validation.errors);
    }
  }, [selectedServices.length, selectedProducts.length, totalGeneral, services, isOpen]);

  // Helpers para errores separados - solo servicios son obligatorios
  const showServiceError = (showErrors || touched.clientName || touched.dineroProporcionado) && (!selectedServices || selectedServices.length === 0);
  // Los productos son opcionales, no se muestran errores

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
      setTouched({});
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowErrors(true);
    setTouched({
      clientName: true,
      dineroProporcionado: true,
      // Agrega aquí otros campos si los hay
    });
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

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Solo marcar como tocado, no validar en tiempo real
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    // No validar en tiempo real para evitar re-renderizados
  }, []);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen || !order) return null;

  const EditOrderCard = ({ children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative animate-fade-in max-h-[90vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <div>
            <h2 className="text-xl font-bold text-accent m-0">Editar Orden de Servicio</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-black text-xl font-bold"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {/* Contenido */}
        <div className="p-8 bg-white overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <EditOrderCard>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <div>
          <label className="block text-xs font-medium text-black mb-1">
            Nombre del Cliente <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
            placeholder="Ingrese el nombre del cliente..."
          />
          {(touched.clientName || showErrors) && errors.clientName && (
            <p className="text-red-600 text-xs mt-1">{errors.clientName}</p>
          )}
        </div>

        {/* Estado */}
        <div>
          <label className="block text-xs font-medium text-black mb-1">
            Estado
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
          >
            <option value="En ejecucion">En ejecución</option>
            <option value="Pagado">Pagado</option>
          </select>
        </div>

        {/* Servicios */}
        <div>
          <label className="block text-xs font-medium text-black mb-1">
            Servicios
          </label>
          <ErrorBoundary>
            <ServiceSelector 
              selectedServices={selectedServices}
              onServicesChange={setSelectedServices}
            />
          </ErrorBoundary>
          {showServiceError && (
            <p className="text-red-600 text-xs mt-1">Debes agregar al menos un servicio</p>
          )}
        </div>

        {/* Productos - Opcionales */}
        <div>
          <label className="block text-xs font-medium text-black mb-1">
            Productos (Opcional)
          </label>
          <ErrorBoundary>
            <ProductSelector 
              selectedProducts={selectedProducts}
              onProductsChange={setSelectedProducts}
            />
          </ErrorBoundary>
        </div>

        {/* Resumen de totales */}
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4 text-accent">Resumen de Venta</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-black">Total Servicios:</span>
                <span className="text-blue-600 font-bold">${totalServices.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium text-black">Total Productos:</span>
                <span className="text-green-600 font-bold">${totalProducts.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-black">Total General:</span>
                <span className="text-primary font-bold">${totalGeneral.toLocaleString()}</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-black mb-1">
                  Dinero Proporcionado
                </label>
                <input
                  type="text"
                  name="dineroProporcionado"
                  value={formData.dineroProporcionado}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                  placeholder="0"
                />
                {(touched.dineroProporcionado || showErrors) && errors.dineroProporcionado && (
                  <p className="text-red-600 text-xs mt-1">{errors.dineroProporcionado}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-black mb-1">
                  Devolución
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                  ${formData.dineroProporcionado && !isNaN(parseFloat(formData.dineroProporcionado)) 
                    ? Math.max(0, parseFloat(formData.dineroProporcionado) - totalGeneral).toLocaleString() 
                    : '0'}
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
            className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </form>
    </EditOrderCard>
  );
};

export default EditServiceOrder;