import React, { useState, useEffect } from 'react';
import { getServices } from '../../../../../shared/services/ServicesDataService';

const AppointmentModal = ({ open, onClose, onSave, initialData }) => {
  // Estado para los campos
  const [servicioBusqueda, setServicioBusqueda] = useState('');
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]); // [{nombre, profesional, inicio, fin, duracion, precio}]
  const [cliente, setCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [estado, setEstado] = useState('Agendada');
  const [duracionTotal, setDuracionTotal] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);

  // Cargar servicios reales al abrir el modal
  useEffect(() => {
    if (open) {
      getServices().then(services => {
        setServiciosDisponibles(services.filter(s => s.active || s.estado === 'Activo'));
      });
    }
  }, [open]);

  // Función para agregar servicio seleccionado
  const handleAgregarServicio = (servicio) => {
    setServiciosSeleccionados(prev => [
      ...prev,
      {
        ...servicio,
        profesional: '',
        inicio: '',
        fin: '',
      }
    ]);
    setServicioBusqueda('');
  };

  // Función para eliminar servicio
  const handleEliminarServicio = (idx) => {
    setServiciosSeleccionados(prev => prev.filter((_, i) => i !== idx));
  };

  // Calcular duración y valor total
  useEffect(() => {
    setDuracionTotal(serviciosSeleccionados.reduce((acc, s) => acc + (parseInt(s.duration) || 0), 0));
    setValorTotal(serviciosSeleccionados.reduce((acc, s) => acc + (parseInt(s.price) || 0), 0));
  }, [serviciosSeleccionados]);

  if (!open) return null;

  // Filtrar servicios por búsqueda
  const serviciosFiltrados = servicioBusqueda
    ? serviciosDisponibles.filter(s => s.name.toLowerCase().includes(servicioBusqueda.toLowerCase()))
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl relative">
        <button
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-primary-dark"
          onClick={onClose}
          aria-label="Cerrar"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-primary mb-4">Crear/Editar cita</h2>
        {/* Buscador de servicios */}
        <div className="mb-4">
          <label className="block font-semibold mb-1 text-text-main">Buscar Servicio *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Buscar servicio..."
            value={servicioBusqueda}
            onChange={e => setServicioBusqueda(e.target.value)}
          />
          {/* Resultados de búsqueda reales */}
          {servicioBusqueda && (
            <div className="bg-gray-50 border rounded mt-2 p-2 max-h-40 overflow-y-auto">
              {serviciosFiltrados.length === 0 && <div className="text-gray-400 text-sm">No se encontraron servicios.</div>}
              {serviciosFiltrados.map((s, idx) => (
                <div key={s.id} className="flex justify-between items-center py-1">
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-gray-500">{s.description}</div>
                    <div className="text-xs text-gray-500">{s.duration} min ${s.price}</div>
                  </div>
                  <button className="bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark" onClick={() => handleAgregarServicio(s)}>Agregar</button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Servicios seleccionados */}
        {serviciosSeleccionados.length > 0 && (
          <div className="mb-4">
            <div className="font-semibold mb-2 text-text-main">Servicios seleccionados ({serviciosSeleccionados.length})</div>
            <div className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
              {serviciosSeleccionados.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between mb-2 gap-2">
                  <div className="flex-1">
                    <div className="font-semibold">{s.nombre}</div>
                    <div className="text-xs text-gray-500">{s.duracion} min ${s.precio}</div>
                  </div>
                  <input type="text" className="border rounded px-2 py-1 text-sm w-32" placeholder="Profesional" value={s.profesional} onChange={e => {
                    const val = e.target.value;
                    setServiciosSeleccionados(prev => prev.map((item, i) => i === idx ? { ...item, profesional: val } : item));
                  }} />
                  <input type="time" className="border rounded px-2 py-1 text-sm w-24" value={s.inicio} onChange={e => {
                    const val = e.target.value;
                    setServiciosSeleccionados(prev => prev.map((item, i) => i === idx ? { ...item, inicio: val } : item));
                  }} />
                  <input type="time" className="border rounded px-2 py-1 text-sm w-24" value={s.fin} onChange={e => {
                    const val = e.target.value;
                    setServiciosSeleccionados(prev => prev.map((item, i) => i === idx ? { ...item, fin: val } : item));
                  }} />
                  <button className="text-red-500 hover:text-red-700 ml-2" onClick={() => handleEliminarServicio(idx)} title="Eliminar servicio">
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Datos del cliente y cita */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-semibold mb-1 text-text-main">Nombre del cliente *</label>
            <input type="text" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" value={cliente} onChange={e => setCliente(e.target.value)} />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-text-main">Teléfono</label>
            <input type="text" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" value={telefono} onChange={e => setTelefono(e.target.value)} />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-text-main">Fecha *</label>
            <input type="date" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" value={fecha} onChange={e => setFecha(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block font-semibold mb-1 text-text-main">Hora inicio *</label>
              <input type="time" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-1 text-text-main">Hora finalización *</label>
              <input type="time" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" value={horaFin} onChange={e => setHoraFin(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-text-main">Duración total</label>
            <input type="text" className="w-full border rounded px-3 py-2 bg-gray-100" value={duracionTotal + ' min'} readOnly />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-text-main">Estado de la cita</label>
            <select className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" value={estado} onChange={e => setEstado(e.target.value)}>
              <option value="Agendada">Agendada</option>
              <option value="Cancelada">Cancelada</option>
              <option value="Completada">Completada</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-text-main">Valor total</label>
            <input type="text" className="w-full border rounded px-3 py-2 bg-gray-100" value={'$' + valorTotal} readOnly />
          </div>
        </div>
        {/* Botones */}
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-6 py-2 bg-white border border-primary text-primary rounded shadow hover:bg-primary hover:text-white transition font-semibold" onClick={onClose}>Cancelar</button>
          <button className="px-6 py-2 bg-primary text-white rounded shadow hover:bg-primary-dark transition font-semibold" onClick={() => onSave && onSave()}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal; 