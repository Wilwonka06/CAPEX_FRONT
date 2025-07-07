import React, { useState, useEffect } from 'react';
import EditScheduling from './EditScheduling';

const tiposDocumento = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PAS', label: 'Pasaporte' },
];

const EditEmployee = ({ employee, onCancel, onSave }) => {
  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    tipoDocumento: 'CC',
    documento: '',
    correo: '',
    estado: 'Activo',
  });
  const [activeTab, setActiveTab] = useState('empleado');
  const [schedulings, setSchedulings] = useState(employee?.schedulings || []);
  const [editingScheduling, setEditingScheduling] = useState(null);

  useEffect(() => {
    if (employee) {
      setForm({
        nombre: employee.nombre || '',
        apellidos: employee.apellido || '',
        tipoDocumento: employee.tipoDocumento || 'CC',
        documento: employee.documento || '',
        correo: employee.correo || '',
        estado: employee.estado ? 'Activo' : 'Inactivo',
      });
      setSchedulings(employee.schedulings || []);
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(form);
  };

  const handleEditScheduling = (prog) => {
    setEditingScheduling(prog);
  };

  const handleSaveScheduling = (updatedProg) => {
    setSchedulings(schedulings.map(s => s.id === updatedProg.id ? updatedProg : s));
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
      <div className="flex gap-2 mb-4">
        <button
          className={`text-lg font-semibold px-3 py-1 rounded-t transition-colors ${activeTab === 'empleado' ? 'bg-primary text-white' : 'bg-gray-100 text-text-main'}`}
          onClick={() => setActiveTab('empleado')}
          type="button"
        >
          Editar Empleado
        </button>
        <button
          className={`text-lg font-semibold px-3 py-1 rounded-t transition-colors ${activeTab === 'programacion' ? 'bg-primary text-white' : 'bg-gray-100 text-text-main'}`}
          onClick={() => setActiveTab('programacion')}
          type="button"
        >
          Programación
        </button>
      </div>
      {activeTab === 'empleado' && (
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
      )}
      {activeTab === 'programacion' && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2 text-text-main">Programaciones</h3>
          {editingScheduling ? (
            <EditScheduling
              editing={editingScheduling}
              onEdit={handleSaveScheduling}
              onCancelEdit={handleCancelEditScheduling}
              schedulings={schedulings}
            />
          ) : schedulings.length > 0 ? (
            <ul className="list-disc pl-6">
              {schedulings.map((s, idx) => (
                <li key={s.id || idx} className="mb-2 flex items-center gap-4">
                  <span>
                    {s.fechaInicio} - {s.fechaFin} | {s.horaInicio} - {s.horaFin} | {s.repeticion} | Días: {(s.dias && s.dias.length > 0) ? s.dias.join(', ') : '-'}
                  </span>
                  <button onClick={() => handleEditScheduling(s)} className="bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600 transition text-xs">Editar</button>
                  <button onClick={() => handleDeleteScheduling(s.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-xs">Eliminar</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-main/60">No hay programaciones registradas.</p>
          )}
        </div>
      )}
      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-100 text-gray-600 px-6 py-2 rounded font-semibold hover:bg-gray-200 transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default EditEmployee;
