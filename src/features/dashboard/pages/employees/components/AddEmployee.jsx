import React, { useState } from 'react';
import Calendar from './Calendar';

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

const AddEmployee = ({ onCancel, onSave }) => {
  const [form, setForm] = useState(initialForm);
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
    if (onSave) onSave(form);
  };

  return (
    <div>
      <form className="px-2 pb-2" onSubmit={handleSubmit}>
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
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-100 text-gray-600 px-6 py-2 rounded font-semibold hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-primary-dark text-white px-6 py-2 rounded font-semibold hover:bg-primary transition"
          >
            Guardar
          </button>
        </div>
      </form>
      {/* Formulario de programación funcional */}
      <div className="mt-8 p-6 bg-gray-50 border border-accent-light rounded-lg">
        <form onSubmit={handleAddEvent}>
          <div className="flex flex-wrap gap-6 items-end">
            {/* Fechas */}
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Fecha inicio</label>
              <div className="flex items-center gap-2">
                <input type="date" name="fechaInicio" value={prog.fechaInicio} onChange={handleProgChange} className="border rounded px-3 py-2 w-32" />
                <i className="bi bi-calendar text-xl text-primary-dark"></i>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Fecha fin</label>
              <div className="flex items-center gap-2">
                <input type="date" name="fechaFin" value={prog.fechaFin} onChange={handleProgChange} className="border rounded px-3 py-2 w-32" />
                <i className="bi bi-calendar text-xl text-primary-dark"></i>
              </div>
            </div>
            {/* Selector de repetición */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-text-main mb-1">Repetición</label>
              <select name="repeticion" value={prog.repeticion} onChange={handleProgChange} className="border rounded px-3 py-2 w-full">
                <option>No se repite</option>
                <option>Semanal</option>
                <option>Mensual</option>
              </select>
            </div>
          </div>
          {/* Días de la semana */}
          <div className="flex flex-wrap gap-4 mt-6 mb-4">
            {diasSemana.map(dia => (
              <label key={dia} className="flex items-center gap-1 text-text-main text-sm">
                <input
                  type="checkbox"
                  value={dia}
                  checked={prog.dias.includes(dia)}
                  onChange={handleProgChange}
                  className="accent-primary"
                /> {dia}
              </label>
            ))}
          </div>
          {/* Horario y botón */}
          <div className="flex flex-wrap items-end gap-4 mt-2">
            <div className="flex items-center gap-2">
              <select name="horaInicio" value={prog.horaInicio} onChange={handleProgChange} className="border rounded px-3 py-2">
                {horas.map(h => <option key={h}>{h}</option>)}
              </select>
              <span className="mx-1">-</span>
              <select name="horaFin" value={prog.horaFin} onChange={handleProgChange} className="border rounded px-3 py-2">
                {horas.map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div className="flex-1 flex justify-end">
              <button type="submit" className="bg-primary-dark text-white px-8 py-2 rounded font-semibold hover:bg-primary transition shadow">Agregar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
