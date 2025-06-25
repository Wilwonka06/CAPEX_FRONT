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

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full border rounded px-3 py-1 text-sm"
            placeholder="Buscar servicios..."
          />
          <i className="bi bi-search absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {/* Dropdown de servicios */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-40 overflow-y-auto">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Detalles del Servicio</h3>
            
            <div className="space-y-3 mb-6">
              <div>
                <span className="font-medium">Servicio:</span>
                <span className="ml-2">{selectedServiceForQuantity.name}</span>
              </div>
              
              <div>
                <span className="font-medium">Categoría:</span>
                <span className="ml-2">{selectedServiceForQuantity.category}</span>
              </div>
              
              <div>
                <span className="font-medium">Duración:</span>
                <span className="ml-2">{selectedServiceForQuantity.duration}</span>
              </div>
              
              <div>
                <span className="font-medium">Precio unitario:</span>
                <span className="ml-2">${selectedServiceForQuantity.price}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="font-medium">Cantidad:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border rounded px-2 py-1"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block font-medium mb-2">Empleado: *</label>
                <select
                  value={selectedEmployeeForService}
                  onChange={(e) => setSelectedEmployeeForService(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
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
                <span className="font-medium text-lg">Subtotal:</span>
                <span className="ml-2 text-lg font-bold text-blue-600">
                  ${(selectedServiceForQuantity.price * quantity).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelServiceSelection}
                className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmServiceSelection}
                disabled={!isFormValid}
                className={`px-4 py-2 rounded text-sm ${
                  isFormValid 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Agregar Servicio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de servicios seleccionados - SIEMPRE VISIBLE */}
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Lista de Servicios:</h4>
        <div className="border rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left border-r">Categoría Servicio</th>
                <th className="px-2 py-2 text-left border-r">Servicio</th>
                <th className="px-2 py-2 text-left border-r">Empleado</th>
                <th className="px-2 py-2 text-left border-r">Cantidad</th>
                <th className="px-2 py-2 text-left border-r">Subtotal</th>
                <th className="px-2 py-2 text-left border-r">Duración del servicio</th>
                <th className="px-2 py-2 text-left">Acciones</th>
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
                  <tr key={service.uniqueId} className="border-t">
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
        <div className="mt-2 text-sm bg-blue-50 p-2 rounded">
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