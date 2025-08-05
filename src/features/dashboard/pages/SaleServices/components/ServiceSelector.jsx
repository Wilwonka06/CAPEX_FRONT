import React, { useState } from "react";

const ServiceSelector = ({ selectedServices, onServicesChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedServiceForQuantity, setSelectedServiceForQuantity] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedEmployeeForService, setSelectedEmployeeForService] = useState("");

  const availableServices = [
    { id: 1, name: "Tintura Color verde", price: 15000, category: "Coloración", duration: "2 horas" },
    { id: 2, name: "Aplicación de Extensión", price: 25000, category: "Extensiones", duration: "3 horas" },
    { id: 3, name: "Manicura", price: 10000, category: "Uñas", duration: "45 min" },
    { id: 4, name: "Pedicura", price: 12000, category: "Uñas", duration: "1 hora" },
    { id: 5, name: "Corte de Cabello", price: 8000, category: "Cabello", duration: "30 min" },
    { id: 6, name: "Barbería", price: 10000, category: "Cabello", duration: "45 min" }
  ];

  const availableEmployees = [
    { id: 1, name: "Wilson" },
    { id: 2, name: "Cruz" },
    { id: 3, name: "Sara" },
    { id: 4, name: "María" }
  ];

  const filteredServices = availableServices.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleServiceSelect = (service) => {
    const isAlreadySelected = selectedServices.some(s => s.id === service.id);
    if (!isAlreadySelected) {
      setSelectedServiceForQuantity(service);
      setQuantity(1);
      setSelectedEmployeeForService("");
      setShowQuantityModal(true);
    }
    setSearchTerm("");
    setIsOpen(false);
  };

  const confirmServiceSelection = () => {
    if (selectedServiceForQuantity && selectedEmployeeForService && quantity > 0) {
      const serviceWithDetails = {
        ...selectedServiceForQuantity,
        quantity: quantity,
        subtotal: selectedServiceForQuantity.price * quantity,
        employee: availableEmployees.find(emp => emp.id === parseInt(selectedEmployeeForService)),
        uniqueId: Date.now()
      };
      onServicesChange([...selectedServices, serviceWithDetails]);
      setShowQuantityModal(false);
      setSelectedServiceForQuantity(null);
      setQuantity(1);
      setSelectedEmployeeForService("");
    }
  };

  const cancelServiceSelection = () => {
    setShowQuantityModal(false);
    setSelectedServiceForQuantity(null);
    setQuantity(1);
    setSelectedEmployeeForService("");
  };

  const removeService = (uniqueId) => {
    onServicesChange(selectedServices.filter(s => s.uniqueId !== uniqueId));
  };

  const isFormValid = selectedEmployeeForService && quantity > 0;
  const totalServices = selectedServices.reduce((total, service) => total + service.subtotal, 0);

  // Funciones simples para evitar problemas de hooks
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleSearchFocus = () => {
    setIsOpen(true);
  };

  const handleQuantityChange = (e) => {
    setQuantity(Math.max(1, parseInt(e.target.value) || 1));
  };

  const handleEmployeeChange = (e) => {
    setSelectedEmployeeForService(e.target.value);
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
            placeholder="Buscar servicios..."
          />
          <i className="bi bi-search absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {/* Dropdown de servicios */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg">
          {filteredServices.map(service => (
            <div
              key={service.id}
              onClick={() => handleServiceSelect(service)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
            >
              <div className="flex justify-between">
                <span>{service.name}</span>
                <span className="text-gray-600">${service.price}</span>
              </div>
            </div>
          ))}
          {filteredServices.length === 0 && (
            <div className="px-3 py-2 text-gray-500 text-sm">
              No se encontraron servicios
            </div>
          )}
        </div>
      )}

      {/* Modal para cantidad, empleado y detalles del servicio */}
      {showQuantityModal && selectedServiceForQuantity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-in flex flex-col border border-gray-200">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
              <div>
                <h2 className="text-xl font-bold text-accent m-0">Detalles del Servicio</h2>
              </div>
              <button
                onClick={cancelServiceSelection}
                className="text-gray-400 hover:text-black text-xl font-bold"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            
            {/* Contenido */}
            <div className="p-8 bg-white">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-black mb-1">Servicio</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                    {selectedServiceForQuantity.name}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-black mb-1">Categoría</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                    {selectedServiceForQuantity.category}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-black mb-1">Duración</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                    {selectedServiceForQuantity.duration}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-black mb-1">Precio unitario</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                    ${selectedServiceForQuantity.price}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-black mb-1">
                    Cantidad <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-16 text-center border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                      min="1"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-black mb-1">
                    Empleado <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedEmployeeForService}
                    onChange={handleEmployeeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                  >
                    <option value="">Seleccionar empleado</option>
                    {availableEmployees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="border-t pt-3">
                  <label className="block text-xs font-medium text-black mb-1">Subtotal</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm font-bold text-blue-600">
                    ${(selectedServiceForQuantity.price * quantity).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={cancelServiceSelection}
                  className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmServiceSelection}
                  disabled={!isFormValid}
                  className={`px-4 py-2 rounded-md text-white ${isFormValid ? 'bg-accent hover:bg-accent-dark' : 'bg-gray-300 cursor-not-allowed'} transition-colors`}
                >
                  Agregar Servicio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de servicios seleccionados - SIEMPRE VISIBLE */}
      <div className="mt-4">
        <h4 className="text-xs font-medium mb-2">Lista de Servicios:</h4>
        <div className="border border-gray-300 rounded-md overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Categoría Servicio</th>
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Servicio</th>
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Empleado</th>
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Cantidad</th>
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Subtotal</th>
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Duración del servicio</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {selectedServices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-2 py-4 text-center text-gray-500">
                    No hay servicios seleccionados
                  </td>
                </tr>
              ) : (
                selectedServices.map((service) => (
                  <tr key={service.uniqueId} className="border-t hover:bg-gray-50">
                    <td className="px-2 py-2 border-r">{service.category}</td>
                    <td className="px-2 py-2 border-r">{service.name}</td>
                    <td className="px-2 py-2 border-r">{service.employee?.name}</td>
                    <td className="px-2 py-2 border-r text-center">{service.quantity}</td>
                    <td className="px-2 py-2 border-r">${service.subtotal?.toLocaleString()}</td>
                    <td className="px-2 py-2 border-r">{service.duration}</td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => removeService(service.uniqueId)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar servicio"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Total de servicios */}
        <div className="mt-2 text-sm bg-blue-50 p-2 rounded-md border border-blue-100">
          <span className="font-medium">TOTAL DE SERVICIOS: </span>
          <span className="font-bold text-blue-600">
            ${totalServices.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Overlay para cerrar dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default ServiceSelector;