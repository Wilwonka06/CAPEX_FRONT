import React, { useState } from 'react';
import Calendar from './Calendar';
import AddScheduling from './AddScheduling';

const initialForm = {
  nombre: '',
  apellidos: '',
  tipoDocumento: 'CC',
  documento: '',
  correo: '',
  contrasena: '',
  confirmarContrasena: '',
  estado: 'Activo',
};

const tiposDocumento = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PAS', label: 'Pasaporte' },
];

const horas = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

const diasSemana = [
  'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'
];

// Utilidad para expandir una programación a eventos diarios
function expandirProgramacion(prog) {
  const { fechaInicio, fechaFin, ...rest } = prog;
  const start = new Date(fechaInicio);
  const end = new Date(fechaFin || fechaInicio);
  const dias = [];
  let current = new Date(start);
  while (current <= end) {
    dias.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dias.map(date => ({
    ...rest,
    fechaInicio: date.toISOString().split('T')[0],
    fechaFin: date.toISOString().split('T')[0],
    id: Date.now() + Math.random(), // id único
  }));
}

const AddEmployee = ({ onCancel, onSave, schedulings, setSchedulings }) => {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(1); // 1: datos, 2: programación
  const [editingScheduling, setEditingScheduling] = useState(null);
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Ejemplo de evento',
      start: new Date(),
      end: new Date(new Date().getTime() + 60 * 60 * 1000),
    }
  ]);
  const [prog, setProg] = useState({
    fechaInicio: '',
    fechaFin: '',
    repeticion: 'No se repite',
    dias: [],
    horaInicio: '08:00',
    horaFin: '09:00',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!form.apellidos.trim()) newErrors.apellidos = 'Los apellidos son obligatorios';
    if (!form.tipoDocumento.trim()) newErrors.tipoDocumento = 'El tipo de documento es obligatorio';
    if (!form.documento.trim()) newErrors.documento = 'El documento es obligatorio';
    if (!form.correo.trim()) newErrors.correo = 'El correo es obligatorio';
    if (!form.contrasena.trim()) newErrors.contrasena = 'La contraseña es obligatoria';
    if (!form.confirmarContrasena.trim()) newErrors.confirmarContrasena = 'Confirma la contraseña';
    if (form.contrasena && form.confirmarContrasena && form.contrasena !== form.confirmarContrasena) newErrors.confirmarContrasena = 'Las contraseñas no coinciden';
    if (!form.estado.trim()) newErrors.estado = 'El estado es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProgChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setProg((prev) => ({
        ...prev,
        dias: checked
          ? [...prev.dias, value]
          : prev.dias.filter((d) => d !== value),
      }));
    } else {
      setProg((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!prog.fechaInicio || !prog.horaInicio || !prog.horaFin) return;
    const [hIni, mIni] = prog.horaInicio.split(':');
    const [hFin, mFin] = prog.horaFin.split(':');
    const start = new Date(prog.fechaInicio);
    start.setHours(Number(hIni), Number(mIni));
    const end = new Date(prog.fechaInicio);
    end.setHours(Number(hFin), Number(mFin));
    setEvents((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: 'Nuevo evento',
        start,
        end,
      }
    ]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (onSave) onSave(form);
  };

  const isFormValid = () => {
    return (
      form.nombre.trim() &&
      form.apellidos.trim() &&
      form.tipoDocumento.trim() &&
      form.documento.trim() &&
      form.correo.trim() &&
      form.contrasena.trim() &&
      form.confirmarContrasena.trim() &&
      form.estado.trim() &&
      form.contrasena === form.confirmarContrasena
    );
  };

  const handleAddScheduling = (prog) => {
    // Expandir la programación a eventos diarios
    const nuevosEventos = expandirProgramacion(prog);
    setSchedulings([...schedulings, ...nuevosEventos]);
    setEditingScheduling(null);
  };

  const handleEditScheduling = (prog) => {
    setEditingScheduling(prog);
  };

  const handleSaveEditScheduling = (updatedProg) => {
    const start = updatedProg.fechaInicio && updatedProg.horaInicio ? `${updatedProg.fechaInicio}T${updatedProg.horaInicio}` : '';
    const end = updatedProg.fechaFin && updatedProg.horaFin ? `${updatedProg.fechaFin}T${updatedProg.horaFin}` : '';
    const newProg = { ...updatedProg, start, end };
    setSchedulings(schedulings.map(s => s.id === updatedProg.id ? newProg : s));
    setEditingScheduling(null);
  };

  const handleDeleteScheduling = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta programación?')) {
      setSchedulings(schedulings.filter(s => s.id !== id));
    }
  };

  const handleCancelEditScheduling = () => {
    setEditingScheduling(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-main mb-4">Registro de Nuevo Empleado</h2>
      <div className="flex gap-2 mb-4">
        <button
          className={`text-lg font-semibold px-3 py-1 rounded-t transition-colors ${step === 1 ? 'bg-primary text-white' : 'bg-gray-100 text-text-main'}`}
          type="button"
          disabled
        >
          Nuevo Empleado
        </button>
        <button
          className={`text-lg font-semibold px-3 py-1 rounded-t transition-colors ${step === 2 ? 'bg-primary text-white' : 'bg-gray-100 text-text-main'} ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
          type="button"
          onClick={() => isFormValid() && setStep(2)}
          disabled={!isFormValid()}
        >
          Programación
        </button>
      </div>
      {step === 1 && (
        <form className="px-2 pb-2" onSubmit={e => { e.preventDefault(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-text-main mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                id="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                required
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </div>
            <div>
              <label htmlFor="apellidos" className="block text-sm font-medium text-text-main mb-1">Apellidos</label>
              <input
                type="text"
                name="apellidos"
                id="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                required
              />
              {errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos}</p>}
            </div>
            <div>
              <label htmlFor="tipoDocumento" className="block text-sm font-medium text-text-main mb-1">Tipo de Documento</label>
              <select
                name="tipoDocumento"
                id="tipoDocumento"
                value={form.tipoDocumento}
                onChange={handleChange}
                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                required
              >
                {tiposDocumento.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
              {errors.tipoDocumento && <p className="text-red-500 text-xs mt-1">{errors.tipoDocumento}</p>}
            </div>
            <div>
              <label htmlFor="documento" className="block text-sm font-medium text-text-main mb-1">Documento</label>
              <input
                type="text"
                name="documento"
                id="documento"
                value={form.documento}
                onChange={handleChange}
                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                required
              />
              {errors.documento && <p className="text-red-500 text-xs mt-1">{errors.documento}</p>}
            </div>
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-text-main mb-1">Correo</label>
              <input
                type="email"
                name="correo"
                id="correo"
                value={form.correo}
                onChange={handleChange}
                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                required
              />
              {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo}</p>}
            </div>
            <div>
              <label htmlFor="contrasena" className="block text-sm font-medium text-text-main mb-1">Contraseña</label>
              <input
                type="password"
                name="contrasena"
                id="contrasena"
                value={form.contrasena}
                onChange={handleChange}
                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                required
              />
              {errors.contrasena && <p className="text-red-500 text-xs mt-1">{errors.contrasena}</p>}
            </div>
            <div>
              <label htmlFor="confirmarContrasena" className="block text-sm font-medium text-text-main mb-1">Confirmar Contraseña</label>
              <input
                type="password"
                name="confirmarContrasena"
                id="confirmarContrasena"
                value={form.confirmarContrasena}
                onChange={handleChange}
                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                required
              />
              {errors.confirmarContrasena && <p className="text-red-500 text-xs mt-1">{errors.confirmarContrasena}</p>}
            </div>
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-text-main mb-1">Estado</label>
              <select
                name="estado"
                id="estado"
                value={form.estado}
                onChange={handleChange}
                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              {errors.estado && <p className="text-red-500 text-xs mt-1">{errors.estado}</p>}
            </div>
          </div>
          <div className="flex justify-end mt-8 gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="border border-gray-300 text-gray-600 px-6 py-2 rounded font-semibold bg-white hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              className="bg-primary-dark text-white px-6 py-2 rounded font-semibold hover:bg-primary transition"
              onClick={() => {
                if (isFormValid()) {
                  setStep(2);
                } else {
                  alert('Por favor completa todos los campos correctamente antes de continuar.');
                }
              }}
            >
              Continuar
            </button>
          </div>
        </form>
      )}
      {step === 2 && (
        <div className="mt-8">
          
          {editingScheduling ? (
            <AddScheduling
              onAdd={handleSaveEditScheduling}
              editing={editingScheduling}
              onCancelEdit={handleCancelEditScheduling}
            />
          ) : (
            <AddScheduling
              onAdd={handleAddScheduling}
            />
          )}
          <div className="flex justify-end mt-8 gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="border border-gray-300 text-gray-600 px-6 py-2 rounded font-semibold bg-white hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="border border-primary text-primary px-6 py-2 rounded font-semibold bg-white hover:bg-primary hover:text-white transition"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={() => { if (onSave) onSave({ ...form, schedulings }); }}
              className="bg-primary-dark text-white px-6 py-2 rounded font-semibold hover:bg-primary transition"
            >
              Guardar todo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEmployee;
