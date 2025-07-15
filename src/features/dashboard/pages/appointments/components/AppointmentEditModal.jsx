import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { addAppointment, updateAppointment, APPOINTMENT_STATES } from '../../../../../shared/services/AppointmentsDataService';
import { getProfessionals } from '../../../../../shared/services/ProfessionalsDataService';
import { getServices } from '../../../../../shared/services/ServicesDataService';

const AppointmentEditModal = ({ cita, fecha, onClose, onSave }) => {
  // Estados para el buscador
  const [serviceQuery, setServiceQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Formulario principal
  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '',
    fecha: fecha || '',
    servicios: [],
    estado: 'Agendada',
    notas: ''
  });

  // Cargar servicios y profesionales
  useEffect(() => {
    const loadData = async () => {
      const [servicesData, professionalsData] = await Promise.all([
        getServices(),
        getProfessionals()
      ]);
      setServices(servicesData.filter(s => s.active));
      setProfessionals(professionalsData.filter(p => p.active));
    };
    loadData();
  }, []);

  // Si es edición, cargar datos de la cita
  useEffect(() => {
    if (cita) {
      setFormData({
        ...cita,
        id: cita.id, // Asegura que el id esté presente
        fecha: cita.fecha || fecha || '',
        servicios: (cita.servicios || []).map(s => ({
          ...s,
          fin: calcularHoraFin(s.inicio, s.duracion)
        }))
      });
    }
  }, [cita, fecha]);

  // useEffect para actualizar la fecha cuando cambia la prop fecha y NO hay cita (modo creación)
  useEffect(() => {
    if (!cita && fecha) {
      setFormData(prev => ({
        ...prev,
        fecha
      }));
    }
  }, [fecha, cita]);

  // Buscador en tiempo real
  useEffect(() => {
    if (serviceQuery.trim() === '') {
      setFilteredServices([]);
    } else {
      setFilteredServices(
        services.filter(s =>
          s.name.toLowerCase().includes(serviceQuery.toLowerCase())
        )
      );
    }
  }, [serviceQuery, services]);

  // Agregar servicio desde el buscador (ahora al inicio)
  const handleAddService = (service) => {
    setFormData(prev => ({
      ...prev,
      servicios: [
        {
          id: Date.now() + Math.random(),
          servicioId: service.id,
          nombre: service.name,
          profesional: '',
          inicio: '08:00',
          fin: calcularHoraFin('08:00', service.duration),
          duracion: service.duration,
          precio: service.price,
          cantidad: 1
        },
        ...prev.servicios
      ]
    }));
    setServiceQuery('');
    setFilteredServices([]);
  };

  // Eliminar servicio de la lista
  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      servicios: prev.servicios.filter((_, i) => i !== index)
    }));
  };

  // Actualizar campos de un servicio seleccionado
  const updateService = (index, field, value) => {
    setFormData(prev => {
      const newServicios = [...prev.servicios];
      newServicios[index] = { ...newServicios[index], [field]: value };
      // Si cambia hora inicio o duración, recalcular hora fin
      if (field === 'inicio' || field === 'duracion') {
        const inicio = field === 'inicio' ? value : newServicios[index].inicio;
        const duracion = field === 'duracion' ? value : newServicios[index].duracion;
        newServicios[index].fin = calcularHoraFin(inicio, duracion);
      }
      return { ...prev, servicios: newServicios };
    });
  };

  // Calcular hora fin a partir de inicio y duración
  function calcularHoraFin(inicio, duracion) {
    const [h, m] = inicio.split(':').map(Number);
    const totalMin = h * 60 + m + Number(duracion);
    const newH = Math.floor(totalMin / 60);
    const newM = totalMin % 60;
    return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
  }

  // Validación de solapamiento de servicios para el mismo profesional
  function haySolapamientoServicios(servicios) {
    for (let i = 0; i < servicios.length; i++) {
      for (let j = i + 1; j < servicios.length; j++) {
        if (
          servicios[i].profesional &&
          servicios[i].profesional === servicios[j].profesional
        ) {
          // Convertir a minutos para comparar
          const inicioA = parseInt(servicios[i].inicio.split(':')[0]) * 60 + parseInt(servicios[i].inicio.split(':')[1]);
          const finA = parseInt(servicios[i].fin.split(':')[0]) * 60 + parseInt(servicios[i].fin.split(':')[1]);
          const inicioB = parseInt(servicios[j].inicio.split(':')[0]) * 60 + parseInt(servicios[j].inicio.split(':')[1]);
          const finB = parseInt(servicios[j].fin.split(':')[0]) * 60 + parseInt(servicios[j].fin.split(':')[1]);
          // Si se solapan
          if (inicioA < finB && inicioB < finA) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Generar opciones de hora disponibles para un servicio
  function getHorasDisponibles(idx, profesional, duracion) {
    if (!profesional) return [];
    const horas = [];
    for (let h = 6; h <= 20; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        // Verificar si esta hora se solapa con otro servicio del mismo profesional
        let disponible = true;
        const inicioA = h * 60 + m;
        const finA = inicioA + Number(duracion);
        for (let i = 0; i < formData.servicios.length; i++) {
          if (i === idx) continue;
          const s = formData.servicios[i];
          if (s.profesional === profesional) {
            const inicioB = parseInt(s.inicio.split(':')[0]) * 60 + parseInt(s.inicio.split(':')[1]);
            const finB = parseInt(s.fin.split(':')[0]) * 60 + parseInt(s.fin.split(':')[1]);
            if (inicioA < finB && inicioB < finA) {
              disponible = false;
              break;
            }
          }
        }
        horas.push({ hora, disponible });
      }
    }
    return horas;
  }

  // Validaciones
  const validateForm = () => {
    const newErrors = {};
    if (!formData.cliente.trim()) newErrors.cliente = 'El nombre del cliente es requerido';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.fecha) newErrors.fecha = 'La fecha es requerida';
    if (formData.servicios.length === 0) newErrors.servicios = 'Debe agregar al menos un servicio';
    if (haySolapamientoServicios(formData.servicios)) newErrors.servicios = 'No se puede asignar el mismo profesional a servicios que se solapan en el tiempo.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calcular duración total, hora inicio/fin global y valor total
  const calcularResumen = () => {
    if (formData.servicios.length === 0) return { duracion: 0, inicio: '', fin: '', total: 0 };
    const inicios = formData.servicios.map(s => s.inicio).sort();
    const fines = formData.servicios.map(s => s.fin).sort().reverse();
    const duracion = formData.servicios.reduce((acc, s) => acc + Number(s.duracion || 0), 0);
    const total = formData.servicios.reduce((acc, s) => acc + (Number(s.precio) * (Number(s.cantidad) || 1)), 0);
    return {
      duracion,
      inicio: inicios[0],
      fin: fines[0],
      total
    };
  };
  const resumen = calcularResumen();

  // Guardar cita
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (cita) {
        await updateAppointment({ ...formData, id: cita.id }); // Asegura que el id se envíe
      } else {
        await addAppointment({ ...formData });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error al guardar la cita:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 select-none">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[95vh] flex flex-col mt-8">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 rounded-t-2xl flex items-center justify-between px-8 py-5">
          <h2 className="text-2xl font-bold text-text-main m-0">{cita ? 'Editar' : 'Crear'} Cita</h2>
          <button className="text-gray-400 hover:text-primary text-2xl font-bold" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 flex-1">
          {/* Buscador de servicios */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar Servicio <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={serviceQuery}
              onChange={e => setServiceQuery(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Buscar por nombre de servicio..."
            />
            {filteredServices.length > 0 && (
              <div className="bg-white border rounded shadow mt-2 max-h-40 overflow-y-auto">
                {filteredServices.map(service => (
                  <div key={service.id} className="flex justify-between items-center px-4 py-2 hover:bg-gray-50">
                    <div>
                      <div className="font-semibold">{service.name}</div>
                      <div className="text-xs text-gray-500">{service.description}</div>
                      <div className="text-xs text-gray-500">{service.duration} min ${service.price}</div>
                    </div>
                    <button
                      type="button"
                      className="bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark text-sm"
                      onClick={() => handleAddService(service)}
                    >Agregar</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Servicios seleccionados */}
          <div className="mb-6">
            <div className="font-semibold mb-2">Servicios seleccionados ({formData.servicios.length})</div>
            {errors.servicios && <p className="text-red-500 text-xs mb-2">{errors.servicios}</p>}
            <div className="space-y-4">
              {formData.servicios.map((service, idx) => (
                <div key={service.id} className="border rounded-lg p-4 bg-gray-50 relative">
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-lg"
                    onClick={() => removeService(idx)}
                  >×</button>
                  <div className="font-semibold mb-1">{service.nombre}</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Profesional</label>
                      <select
                        value={service.profesional}
                        onChange={e => updateService(idx, 'profesional', e.target.value)}
                        className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="">Seleccionar profesional</option>
                        {professionals.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Hora inicio</label>
                      <select
                        value={service.inicio}
                        onChange={e => updateService(idx, 'inicio', e.target.value)}
                        className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {getHorasDisponibles(idx, service.profesional, service.duracion).map(opt => (
                          <option key={opt.hora} value={opt.hora} disabled={!opt.disponible} style={!opt.disponible ? {color:'#aaa'} : {}}>
                            {opt.hora} {!opt.disponible ? ' (hora no disponible)' : ''}
                          </option>
                        ))}
                      </select>
                      {(!getHorasDisponibles(idx, service.profesional, service.duracion).some(opt => opt.hora === service.inicio && opt.disponible)) && (
                        <span className="text-xs text-red-500">hora no disponible</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Hora finalización</label>
                      <input
                        type="time"
                        value={service.fin}
                        readOnly
                        className="w-full px-2 py-1 border rounded-md bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Duración</label>
                      <input
                        type="number"
                        value={service.duracion}
                        onChange={e => updateService(idx, 'duracion', e.target.value)}
                        className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        min="1"
                      />
                      <span className="text-xs text-gray-500">min</span>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad</label>
                      <input
                        type="number"
                        value={service.cantidad}
                        onChange={e => updateService(idx, 'cantidad', e.target.value)}
                        className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Precio</label>
                      <div className="font-semibold">${service.precio * (service.cantidad || 1)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Datos del cliente y resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del cliente <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.cliente}
                onChange={e => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.cliente ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Nombre completo"
              />
              {errors.cliente && <p className="text-red-500 text-xs mt-1">{errors.cliente}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-red-500">*</span></label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={e => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.telefono ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Número de teléfono"
              />
              {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={formData.fecha}
                onChange={e => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.fecha ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado de la cita</label>
              <select
                value={formData.estado}
                onChange={e => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {APPOINTMENT_STATES.map(estado => (
                  <option key={estado.nombre} value={estado.nombre}>{estado.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Hora inicio</label>
              <input type="text" value={resumen.inicio} readOnly className="w-full px-2 py-1 border rounded-md bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Hora finalización</label>
              <input type="text" value={resumen.fin} readOnly className="w-full px-2 py-1 border rounded-md bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Duración total</label>
              <input type="text" value={resumen.duracion + ' min'} readOnly className="w-full px-2 py-1 border rounded-md bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Valor total</label>
              <input type="text" value={`$${resumen.total}`} readOnly className="w-full px-2 py-1 border rounded-md bg-gray-100" />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (cita ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AppointmentEditModal.propTypes = {
  cita: PropTypes.object,
  fecha: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AppointmentEditModal; 