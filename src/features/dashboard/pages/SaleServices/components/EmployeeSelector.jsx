import React, { useState, useEffect } from "react";
import { apiRequest } from '../../../../../shared/config/apiConfig';

const EmployeeSelector = ({ selectedEmployee, onEmployeeChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar empleados desde el backend
  useEffect(() => {
    const cargarEmpleados = async () => {
      setLoading(true);
      try {
        const empleados = await apiRequest.get('/empleados');
        // Manejar diferentes estructuras de respuesta
        let empleadosArray = [];
        if (Array.isArray(empleados)) {
          empleadosArray = empleados;
        } else if (empleados && typeof empleados === 'object') {
          empleadosArray = empleados.data || empleados.empleados || empleados.results || [];
        }
        setAvailableEmployees(empleadosArray);
      } catch (error) {
        console.error('Error al cargar empleados:', error);
        setAvailableEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    cargarEmpleados();
  }, []);

  const filteredEmployees = Array.isArray(availableEmployees) 
    ? availableEmployees.filter(employee =>
        (employee.nombre || employee.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleEmployeeSelect = (employee) => {
    onEmployeeChange(employee);
    setSearchTerm(employee.nombre || employee.name);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={selectedEmployee ? (selectedEmployee.nombre || selectedEmployee.name) : searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              onEmployeeChange(null);
            }
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full border border-accent bg-background text-text-main rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Buscar empleado..."
        />
        <i className="bi bi-search absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      </div>

      {/* Dropdown de empleados */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-accent rounded shadow-lg max-h-40 overflow-y-auto">
          {loading ? (
            <div className="px-3 py-2 text-gray-500 text-sm flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Cargando empleados...
            </div>
          ) : (
            <>
              {filteredEmployees.map(employee => (
                <div
                  key={employee.id_usuario || employee.id}
                  onClick={() => handleEmployeeSelect(employee)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
                >
                  {employee.nombre || employee.name}
                </div>
              ))}
              {filteredEmployees.length === 0 && !loading && (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No se encontraron empleados
                </div>
              )}
            </>
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