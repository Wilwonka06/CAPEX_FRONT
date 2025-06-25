import React, { useState } from "react";

const EmployeeSelector = ({ selectedEmployee, onEmployeeChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const availableEmployees = [
    { id: 1, name: "Wilson" },
    { id: 2, name: "Cruz" },
    { id: 3, name: "María García" },
    { id: 4, name: "Carlos López" },
    { id: 5, name: "Ana Martínez" }
  ];

  const filteredEmployees = availableEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmployeeSelect = (employee) => {
    onEmployeeChange(employee);
    setSearchTerm(employee.name);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={selectedEmployee ? selectedEmployee.name : searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              onEmployeeChange(null);
            }
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full border rounded px-3 py-1 text-sm"
          placeholder="Buscar empleado..."
        />
        <i className="bi bi-search absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      </div>

      {/* Dropdown de empleados */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-40 overflow-y-auto">
          {filteredEmployees.map(employee => (
            <div
              key={employee.id}
              onClick={() => handleEmployeeSelect(employee)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
            >
              {employee.name}
            </div>
          ))}
          {filteredEmployees.length === 0 && (
            <div className="px-3 py-2 text-gray-500 text-sm">
              No se encontraron empleados
            </div>
          )}
        </div>
      )}

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

export default EmployeeSelector;