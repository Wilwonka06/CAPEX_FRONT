import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Swal from 'sweetalert2';

// Mock de servicios para demostración
const appointmentsService = {
  getEmployees: async () => ({ success: true, data: [{ id: 1, nombre: 'Ana Torres', estado: 'Activo' }] }),
  getServices: async () => ({ success: true, data: [{ id_servicio: 1, nombre: 'Corte de cabello', duracion: 30, precio: 25000, descripcion: 'Corte básico', estado: 'Activo' }] }),
  create: async (data) => ({ success: true, data }),
  update: async (id, data) => ({ success: true, data })
};

const usersService = {
  getAll: async () => ({ success: true, data: [] }),
  create: async (data) => ({ success: true, data: { id_usuario: 1 } })
};

const APPOINTMENT_STATES = [
  { nombre: 'Agendada', descripcion: 'La cita ha sido creada por el cliente.' },
  { nombre: 'Confirmada', descripcion: 'El establecimiento ha confirmado la disponibilidad.' },
];

function limpiarPrecio(valor) {
  return Number(String(valor).replace(/[^\d]/g, '')) || 0;
}

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const AppointmentEditModal = ({ cita, fecha, onClose, onSave }) => {
  const [serviceQuery, setServiceQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  
  // Estado para el teléfono (como en proveedores)
  const [numero, setNumero] = useState('');

  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '',
    correo: '',
    fecha: fecha || '',
    servicios: [],
    estado: 'Agendada',
    notas: ''
  });

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        const employeesResponse = await appointmentsService.getEmployees();
        if (employeesResponse.success && employeesResponse.data) {
          const employees = employeesResponse.data.map(emp => ({
            id: emp.id,
            name: emp.nombre,
            active: emp.estado === 'Activo'
          }));
          setProfessionals(employees);
        }

        const servicesResponse = await appointmentsService.getServices();
        if (servicesResponse.success && servicesResponse.data) {
          const services = servicesResponse.data.map(svc => ({
            id: svc.id_servicio,
            name: svc.nombre,
            duration: svc.duracion,
            price: svc.precio,
            description: svc.descripcion,
            active: svc.estado === 'Activo'
          }));
          setServices(services);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Función para parsear teléfono desde el backend (igual que en proveedores)
  const parsePhoneFromBackend = (telefono) => {
    if (!telefono) return '';
    // Remover el símbolo + y retornar solo números
    return telefono.replace(/[^0-9]/g, '');
  };

  // Cargar datos de edición
  useEffect(() => {
    if (cita) {
      const telefono = cita.usuario?.telefono || cita.cliente?.telefono || '';
      const phoneNumber = parsePhoneFromBackend(telefono);
      
      setNumero(phoneNumber); // IMPORTANTE: Establecer el número parseado
      
      setFormData({
        cliente: cita.usuario?.nombre || cita.cliente?.nombre || '',
        telefono: telefono,
        correo: cita.usuario?.correo || cita.cliente?.correo || '',
        fecha: cita.fecha_servicio || fecha || '',
        estado: cita.estado || 'Agendada',
        servicios: (cita.servicios || []).map(s => ({
          id: s.id_detalle_servicio || Date.now() + Math.random(),
          servicioId: s.id_servicio || s.servicio?.id_servicio,
          nombre: s.servicio?.nombre || s.nombre_servicio || 'Servicio',
          profesional: s.empleado?.nombre || s.nombre_empleado || '',
          inicio: s.hora_inicio ? s.hora_inicio.substring(0, 5) : '08:00',
          fin: s.hora_finalizacion ? s.hora_finalizacion.substring(0, 5) : calcularHoraFin(s.hora_inicio?.substring(0, 5) || '08:00', s.duracion || 30),
          duracion: s.duracion || s.servicio?.duracion || 30,
          precio: s.precio_unitario || s.precio || 0,
          cantidad: s.cantidad || 1,
          observaciones: s.observaciones || ''
        })),
        notas: cita.motivo || ''
      });

      setErrors({});
      setTouchedFields({});
    }
  }, [cita, fecha]);

  // Actualizar fecha cuando cambia (modo creación)
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
          duracion: parseInt(service.duration?.toString().replace(/[^\d]/g, '') || 0, 10),
          precio: parseInt(service.price?.toString().replace(/[^\d]/g, '') || 0, 10),
          cantidad: 1
        },
        ...prev.servicios
      ]
    }));
    setServiceQuery('');
    setFilteredServices([]);
    setTouchedFields(prev => ({ ...prev, servicios: true }));
    clearError('servicios');
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      servicios: prev.servicios.filter((_, i) => i !== index)
    }));
  };

  const handleFieldBlur = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateField = (field) => {
    let error = '';

    switch (field) {
      case 'cliente':
        error = !formData.cliente.trim() ? 'El nombre del cliente es requerido' : '';
        break;
      case 'telefono':
        error = validarTelefono();
        break;
      case 'correo':
        error = !formData.correo.trim() ? 'El correo es requerido' : (!isValidEmail(formData.correo) ? 'Formato de correo inválido' : '');
        break;
      case 'fecha':
        error = validarFecha(formData.fecha);
        break;
      case 'servicios':
        if (formData.servicios.length === 0) {
          error = 'Debe agregar al menos un servicio';
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // Validación de teléfono (igual que en proveedores)
  function validarTelefono() {
    if (!numero || numero.trim() === '' || numero.replace(/\D/g, '').length < 7) {
      return 'El teléfono es requerido y debe tener al menos 7 dígitos';
    }
    if (numero.replace(/\D/g, '').length > 15) {
      return 'El teléfono debe tener máximo 15 dígitos';
    }
    return '';
  }

  function validarFecha(fecha) {
    if (!fecha) return 'La fecha es requerida';
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const fechaCita = new Date(fecha);
    if (fechaCita < hoy) return 'No puedes agendar una cita en una fecha pasada';
    return '';
  }

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);
    if (touchedFields[field]) {
      setTimeout(() => {
        validateField(field);
      }, 300);
    }
  };

  const updateService = (index, field, value) => {
    setFormData(prev => {
      const newServicios = [...prev.servicios];
      newServicios[index] = { ...newServicios[index], [field]: value };
      if (['inicio', 'duracion', 'cantidad'].includes(field)) {
        const inicio = field === 'inicio' ? value : newServicios[index].inicio;
        const duracion = field === 'duracion' ? value : newServicios[index].duracion;
        const cantidad = field === 'cantidad' ? value : newServicios[index].cantidad;
        const duracionTotal = Number(duracion) * Number(cantidad || 1);
        newServicios[index].fin = calcularHoraFin(inicio, duracionTotal);
      }      
      return { ...prev, servicios: newServicios };
    });
  };

  function calcularHoraFin(inicio, duracion) {
    if (!inicio || !/^\d{2}:\d{2}$/.test(inicio)) return '';
    const [h, m] = inicio.split(':').map(Number);
    const totalMin = h * 60 + m + Number(duracion || 0);
    const newH = Math.floor(totalMin / 60);
    const newM = totalMin % 60;
    return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
  }

  function getHorasDisponibles() {
    const horas = [];
    for (let h = 6; h <= 20; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        horas.push({ hora, disponible: true });
      }
    }
    return horas;
  }

  const calcularResumen = () => {
    if (formData.servicios.length === 0) return { duracion: 0, inicio: '', fin: '', total: 0 };
    const inicios = formData.servicios.map(s => s.inicio).sort();
    const fines = formData.servicios.map(s => s.fin).sort().reverse();
    const duracion = formData.servicios.reduce((acc, s) => acc + Number(s.duracion || 0), 0);
    const total = formData.servicios.reduce((acc, s) => acc + (limpiarPrecio(s.precio) * (Number(s.cantidad) || 1)), 0);
    return {
      duracion,
      inicio: inicios[0],
      fin: fines[0],
      total
    };
  };
  const resumen = calcularResumen();

  // Manejo del cambio de teléfono (igual que en proveedores)
  const handlePhoneChange = (value) => {
    // PhoneInput incluye el código del país en 'value'
    setNumero(value);
    
    // Actualizar formData.telefono con el formato completo
    setFormData(prev => ({
      ...prev,
      telefono: '+' + value
    }));
    
    // Validar
    const error = validarTelefono();
    setErrors(prev => ({ ...prev, telefono: error }));
  };

  const findOrCreateClient = async (clientName, clientPhone, clientEmail) => {
    try {
      console.log('Buscando/Creando cliente:', clientName, clientPhone, clientEmail);
      
      const searchResponse = await usersService.getAll({
        nombre: clientName.trim(),
        telefono: clientPhone.replace(/\D/g, ''),
        correo: clientEmail.trim()
      });

      if (searchResponse.success && searchResponse.data && searchResponse.data.length > 0) {
        const existingUser = searchResponse.data.find(user => {
          const userNameMatch = user.nombre?.toLowerCase() === clientName.toLowerCase().trim();
          const userPhoneDigits = user.telefono?.replace(/\D/g, '') || '';
          const clientPhoneDigits = clientPhone.trim().replace(/\D/g, '');
          const userPhoneMatch = userPhoneDigits === clientPhoneDigits;
          const userEmailMatch = user.correo?.toLowerCase() === clientEmail.toLowerCase().trim();
          return userNameMatch && userPhoneMatch && userEmailMatch;
        });

        if (existingUser) {
          return existingUser.id_usuario || existingUser.id;
        }
      }

      // Crear nuevo usuario
      const timestamp = Date.now();
      const newUserData = {
        nombre: clientName.trim(),
        telefono: clientPhone.startsWith('+') ? clientPhone : `+${clientPhone}`,
        correo: clientEmail.trim(),
        contrasena: 'Temp1234@',
        tipo_documento: 'Cedula de ciudadania',
        documento: `TEMP${timestamp}`,
        roleId: 3,
        estado: 'Activo'
      };

      const createResponse = await usersService.create(newUserData);
      if (createResponse.success && createResponse.data) {
        return createResponse.data.id_usuario || createResponse.data.id;
      }

      return 1; // ID por defecto
    } catch (error) {
      console.error('Error en findOrCreateClient:', error);
      return 1;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let newErrors = {};
    newErrors.cliente = !formData.cliente.trim() ? 'El nombre del cliente es requerido' : '';
    newErrors.telefono = validarTelefono();
    newErrors.correo = !formData.correo.trim() ? 'El correo es requerido' : (!isValidEmail(formData.correo) ? 'Formato de correo inválido' : '');
    newErrors.fecha = validarFecha(formData.fecha);
    if (formData.servicios.length === 0) {
      newErrors.servicios = 'Debe agregar al menos un servicio';
    }

    setTouchedFields({
      cliente: true,
      telefono: true,
      correo: true,
      fecha: true,
      servicios: true
    });

    setErrors(newErrors);

    console.log('Errores detectados:', newErrors);
    console.log('FormData:', formData);
    console.log('Número de teléfono:', numero);

    if (Object.values(newErrors).some(Boolean)) {
      Swal.fire('Error', 'Por favor corrige los errores en el formulario antes de guardar.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Usar '+' + numero para el teléfono completo
      const fullPhone = '+' + numero;
      console.log('Teléfono completo a enviar:', fullPhone);
      
      const clientId = await findOrCreateClient(formData.cliente, fullPhone, formData.correo);
      
      const mapProfesionalToId = (nombreProfesional) => {
        if (!nombreProfesional) throw new Error('Debe seleccionar un profesional');
        const profesional = professionals.find(p => p.name === nombreProfesional);
        if (!profesional) throw new Error(`No se encontró el profesional: ${nombreProfesional}`);
        return profesional.id;
      };

      const appointmentData = {
        cita: {
          id_cliente: clientId,
          fecha_servicio: formData.fecha,
          hora_entrada: formData.servicios[0]?.inicio + ':00' || '08:00:00',
          estado: formData.estado,
          ...(formData.notas && { motivo: formData.notas.trim() })
        },
        servicios: formData.servicios.map(s => ({
          id_servicio: parseInt(s.servicioId),
          id_empleado: parseInt(mapProfesionalToId(s.profesional)),
          hora_inicio: s.inicio.includes(':') ? (s.inicio.length === 5 ? s.inicio + ':00' : s.inicio) : s.inicio,
          cantidad: parseInt(s.cantidad) || 1,
          ...(s.observaciones && { observaciones: s.observaciones.trim() })
        }))
      };

      console.log('Datos a enviar:', JSON.stringify(appointmentData, null, 2));

      if (cita) {
        appointmentData.cita.id_cliente = cita.id_cliente;
        await appointmentsService.update(cita.id_cita, appointmentData);
        Swal.fire('¡Cita editada!', 'La cita se editó correctamente.', 'success');
      } else {
        await appointmentsService.create(appointmentData);
        Swal.fire('¡Cita registrada!', 'La cita se registró correctamente.', 'success');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
      let errorMessage = 'Ocurrió un error al guardar la cita.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 font-inter">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[95vh] flex flex-col mt-8">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-2xl flex items-center justify-between px-8 py-5">
          <h2 className="text-2xl font-bold text-primary m-0">{cita ? 'Editar' : 'Crear'} Cita</h2>
          <button className="text-gray-400 hover:text-primary text-2xl font-bold" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 flex-1 space-y-4">
          {/* Buscador de servicios */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1">Buscar Servicio <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={serviceQuery}
              onChange={e => setServiceQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Buscar por nombre de servicio..."
            />
            {filteredServices.length > 0 && (
              <div className="bg-white border rounded shadow mt-2 max-h-40 overflow-y-auto">
                {filteredServices.map(service => (
                  <div key={service.id} className="flex justify-between items-center px-4 py-2 hover:bg-gray-50">
                    <div>
                      <div className="font-semibold">{service.name}</div>
                      <div className="text-xs text-gray-500">{service.duration} min ${service.price}</div>
                    </div>
                    <button
                      type="button"
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                      onClick={() => handleAddService(service)}
                    >Agregar</button>
                  </div>
                ))}
              </div>
            )}
            {touchedFields.servicios && errors.servicios && <span className="text-red-500 text-xs mt-1">{errors.servicios}</span>}
          </div>

          {/* Servicios seleccionados */}
          <div className="mb-6">
            <div className="font-semibold mb-2">Servicios ({formData.servicios.length})</div>
            {formData.servicios.map((service, idx) => (
              <div key={service.id} className="border rounded p-4 mb-2 bg-gray-50">
                <button
                  type="button"
                  className="float-right text-red-500"
                  onClick={() => removeService(idx)}
                >×</button>
                <div className="font-semibold mb-2">{service.nombre}</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs mb-1">Profesional</label>
                    <select
                      value={service.profesional}
                      onChange={e => updateService(idx, 'profesional', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                    >
                      <option value="">Seleccionar</option>
                      {professionals.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Hora inicio</label>
                    <select
                      value={service.inicio}
                      onChange={e => updateService(idx, 'inicio', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                    >
                      {getHorasDisponibles().map(opt => (
                        <option key={opt.hora} value={opt.hora}>{opt.hora}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Cantidad</label>
                    <input
                      type="number"
                      value={service.cantidad}
                      onChange={e => updateService(idx, 'cantidad', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Datos del cliente */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.cliente}
                onChange={e => handleFieldChange('cliente', e.target.value)}
                onBlur={() => handleFieldBlur('cliente')}
                className={`w-full px-3 py-2 border rounded-md ${touchedFields.cliente && errors.cliente ? 'border-red-500' : ''}`}
                placeholder="Nombre completo"
              />
              {touchedFields.cliente && errors.cliente && <p className="text-red-500 text-xs mt-1">{errors.cliente}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono <span className="text-red-500">*</span></label>
              <PhoneInput
                country={'co'}
                value={numero}
                onChange={handlePhoneChange}
                inputClass={`w-full px-3 py-2 border rounded-md ${touchedFields.telefono && errors.telefono ? 'border-red-500' : ''}`}
                containerClass="w-full"
                inputProps={{
                  name: 'telefono',
                  required: true,
                  placeholder: 'Ej: 3001234567'
                }}
                specialLabel=""
              />
              {touchedFields.telefono && errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
              {numero && !errors.telefono && (
                <p className="text-green-600 text-xs mt-1">✓ Teléfono: +{numero}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Correo <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={formData.correo}
                onChange={e => handleFieldChange('correo', e.target.value)}
                onBlur={() => handleFieldBlur('correo')}
                className={`w-full px-3 py-2 border rounded-md ${touchedFields.correo && errors.correo ? 'border-red-500' : ''}`}
                placeholder="correo@ejemplo.com"
              />
              {touchedFields.correo && errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={formData.fecha}
                onChange={e => handleFieldChange('fecha', e.target.value)}
                onBlur={() => handleFieldBlur('fecha')}
                className={`w-full px-3 py-2 border rounded-md ${touchedFields.fecha && errors.fecha ? 'border-red-500' : ''}`}
              />
              {touchedFields.fecha && errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
            </div>
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded">
            <div>
              <span className="text-xs text-gray-600">Hora inicio</span>
              <div className="font-semibold">{resumen.inicio || '--:--'}</div>
            </div>
            <div>
              <span className="text-xs text-gray-600">Hora fin</span>
              <div className="font-semibold">{resumen.fin || '--:--'}</div>
            </div>
            <div>
              <span className="text-xs text-gray-600">Duración</span>
              <div className="font-semibold">{resumen.duracion} min</div>
            </div>
            <div>
              <span className="text-xs text-gray-600">Valor total</span>
              <div className="font-semibold text-green-600">${resumen.total}</div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={onClose}>Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-semibold">{loading ? 'Guardando...' : (cita ? 'Guardar' : 'Crear')}</button>
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

// Demo component
export default function Demo() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-8">
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Abrir Modal de Cita
      </button>

      {showModal && (
        <AppointmentEditModal
          fecha="2025-11-10"
          onClose={() => setShowModal(false)}
          onSave={() => {
            alert('Cita guardada correctamente');
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
} 