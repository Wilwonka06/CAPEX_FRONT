// AddEmployee.jsx actualizado para NO expandir programaciones, solo guardar los datos seleccionados
import React, { useState } from 'react';
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

const AddEmployee = ({ onCancel, onSave, schedulings, setSchedulings }) => {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [editingScheduling, setEditingScheduling] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(schedulings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageSchedulings = schedulings.slice(startIndex, startIndex + itemsPerPage);

  const isFormValid = () =>
    form.nombre.trim() &&
    form.apellidos.trim() &&
    form.tipoDocumento.trim() &&
    form.documento.trim() &&
    form.correo.trim() &&
    form.contrasena.trim() &&
    form.confirmarContrasena.trim() &&
    form.estado.trim() &&
    form.contrasena === form.confirmarContrasena;

  const validate = () => {
    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!form.apellidos.trim()) newErrors.apellidos = 'Los apellidos son obligatorios';
    if (!form.tipoDocumento.trim()) newErrors.tipoDocumento = 'El tipo de documento es obligatorio';
    if (!form.documento.trim()) newErrors.documento = 'El documento es obligatorio';
    if (!form.correo.trim()) newErrors.correo = 'El correo es obligatorio';
    if (!form.contrasena.trim()) newErrors.contrasena = 'La contraseña es obligatoria';
    if (!form.confirmarContrasena.trim()) newErrors.confirmarContrasena = 'Confirma la contraseña';
    if (form.contrasena !== form.confirmarContrasena) newErrors.confirmarContrasena = 'Las contraseñas no coinciden';
    if (!form.estado.trim()) newErrors.estado = 'El estado es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddScheduling = (prog) => {
    const idBase = Date.now().toString();
    const nuevaProg = { ...prog, idBase };
    setSchedulings([...schedulings, nuevaProg]);
    setEditingScheduling(null);
  };

  const handleEditScheduling = (prog) => {
    setEditingScheduling(prog);
  };

  const handleSaveEditScheduling = (updatedProg) => {
    const newProg = { ...updatedProg };
    setSchedulings(schedulings.map(s => s.id === newProg.id ? newProg : s));
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
          className={`text-lg font-semibold px-3 py-1 rounded-t ${step === 1 ? 'bg-primary text-white' : 'bg-gray-100 text-text-main'}`}
          type="button"
          disabled
        >
          Nuevo Empleado
        </button>
        <button
          className={`text-lg font-semibold px-3 py-1 rounded-t ${step === 2 ? 'bg-primary text-white' : 'bg-gray-100 text-text-main'} ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => isFormValid() && setStep(2)}
          disabled={!isFormValid()}
        >
          Programación
        </button>
      </div>

      {step === 1 && (
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4" onSubmit={e => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Nombre</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            {errors.nombre && <p className="text-red-500 text-xs">{errors.nombre}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Apellidos</label>
            <input type="text" name="apellidos" value={form.apellidos} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            {errors.apellidos && <p className="text-red-500 text-xs">{errors.apellidos}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Tipo de Documento</label>
            <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} className="w-full border rounded px-3 py-2">
              {tiposDocumento.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
            {errors.tipoDocumento && <p className="text-red-500 text-xs">{errors.tipoDocumento}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Documento</label>
            <input type="text" name="documento" value={form.documento} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            {errors.documento && <p className="text-red-500 text-xs">{errors.documento}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Correo</label>
            <input type="email" name="correo" value={form.correo} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            {errors.correo && <p className="text-red-500 text-xs">{errors.correo}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Contraseña</label>
            <input type="password" name="contrasena" value={form.contrasena} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            {errors.contrasena && <p className="text-red-500 text-xs">{errors.contrasena}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Confirmar Contraseña</label>
            <input type="password" name="confirmarContrasena" value={form.confirmarContrasena} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            {errors.confirmarContrasena && <p className="text-red-500 text-xs">{errors.confirmarContrasena}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
          <div className="col-span-2 flex justify-end mt-6 gap-2">
            <button type="button" onClick={onCancel} className="border px-6 py-2 rounded">Cancelar</button>
            <button type="button" onClick={() => validate() && setStep(2)} className="bg-primary-dark text-white px-6 py-2 rounded">Continuar</button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="mt-4">
          {editingScheduling ? (
            <AddScheduling editing={editingScheduling} onAdd={handleSaveEditScheduling} onCancelEdit={handleCancelEditScheduling} />
          ) : (
            <AddScheduling onAdd={handleAddScheduling} />
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onCancel} className="border px-6 py-2 rounded">Cancelar</button>
            <button onClick={() => setStep(1)} className="border border-primary text-primary px-6 py-2 rounded">Atrás</button>
            <button onClick={() => onSave({ ...form, schedulings })} className="bg-primary-dark text-white px-6 py-2 rounded">Guardar todo</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEmployee;
