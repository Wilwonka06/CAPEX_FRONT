import React, { useState, useEffect } from 'react';
import GeneralCalendar from './components/GeneralCalendar';
// import Calendar from '../employees/components/Calendar';

const EMPLOYEES_KEY = 'capex_employees';

// Función para normalizar texto (remover tildes)
const normalizeText = (text) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

const Scheduling = () => {
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem(EMPLOYEES_KEY);
        setEmployees(stored ? JSON.parse(stored) : []);
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filtrar empleados basado en el término de búsqueda
    const filteredEmployees = employees.filter(emp => {
        const hasMatchingSchedulings = (emp.schedulings || []).some(ev => 
            normalizeText(emp.nombre).includes(normalizeText(searchTerm)) ||
            normalizeText(ev.title || '').includes(normalizeText(searchTerm)) ||
            normalizeText(ev.fechaInicio || '').includes(normalizeText(searchTerm)) ||
            normalizeText(ev.fechaFin || '').includes(normalizeText(searchTerm)) ||
            normalizeText(ev.horaInicio || '').includes(normalizeText(searchTerm)) ||
            normalizeText(ev.horaFin || '').includes(normalizeText(searchTerm)) ||
            normalizeText(ev.repeticion || '').includes(normalizeText(searchTerm)) ||
            normalizeText(ev.dias?.join(', ') || '').includes(normalizeText(searchTerm))
        );
        return hasMatchingSchedulings;
    });

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Agendamiento de Servicios</h1>
            <div className="flex justify-end mb-8">
                <div className="relative w-full max-w-xs pr-4">
                    <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-text-main/50"></i>
                    <input
                        type="text"
                        placeholder="Buscar programación..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="border border-gray-300 pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
                    />
                </div>
            </div>
            <div className="w-full">
                <GeneralCalendar employees={filteredEmployees} />
            </div>
        </div>
    )
}

export default Scheduling
