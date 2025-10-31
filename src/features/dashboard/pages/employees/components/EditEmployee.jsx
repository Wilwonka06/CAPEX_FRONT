import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import EditScheduling from './EditScheduling';
import {
  validateEmployeeEditForm,
  validateEmployeeName,
  validateEmployeeDocument,
  validateEmployeeEmail
} from '../../../../../shared/validations';

const tiposDocumento = [
  { value: 'Cedula de ciudadania', label: 'Cédula de Ciudadanía' },
  { value: 'Tarjeta de identidad', label: 'Tarjeta de Identidad' },
  { value: 'Cedula de extranjeria', label: 'Cédula de Extranjería' },
  { value: 'Pasaporte', label: 'Pasaporte' },
];

const EditEmployee = ({ employee, onCancel, onSave, employees = [] }) => {
  const [form, setForm] = useState({
    nombre: '',
    tipoDocumento: 'Cedula de ciudadania',
    documento: '',
    telefono: '',
    correo: '',
    direccion: '',
    estado: 'Activo',
  });
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('empleado');
  const [schedulings, setSchedulings] = useState(employee?.schedulings || []);
  const [editingScheduling, setEditingScheduling] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const totalPages = Math.ceil(schedulings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageSchedulings = schedulings.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (employee) {
      // Remover el + del teléfono si viene con él para mostrarlo limpio
      let telefonoLimpio = employee.telefono || '';
      if (telefonoLimpio.startsWith('+')) {
        telefonoLimpio = telefonoLimpio.substring(1);
      }

      setForm({
        nombre: employee.nombre || '',
        tipoDocumento: employee.tipo_documento || employee.tipoDocumento || 'Cedula de ciudadania',
        documento: employee.documento || '',
        telefono: telefonoLimpio,
        correo: employee.correo || '',
        direccion: employee.direccion || '',
        estado: employee.estado || 'Activo',
      });
      setSchedulings(employee.schedulings || []);
      setErrors({});
    }
  }, [employee]);

  useEffect(() => {
    const newTotalPages = Math.ceil(schedulings.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  }, [schedulings, currentPage, itemsPerPage]);

  const validate = () => {
    const newErrors = validateEmployeeEditForm(form, employees, employee);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación para campos numéricos (documento y teléfono)
    if (name === 'documento' || name === 'telefono') {
      const numericValue = value.replace(/[^\d]/g, '');
      setForm((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = '';

    switch (name) {
      case 'nombre':
        const nombreErrors = validateEmployeeName(value);
        error = nombreErrors.nombre || '';
        break;
      case 'documento':
        if (!value.trim()) {
          error = 'El documento es obligatorio';
        } else if (value.length < 6 || value.length > 15) {
          error = 'El documento debe tener entre 6 y 15 dígitos';
        } else {
          const documentoErrors = validateEmployeeDocument(value, employees, employee);
          error = documentoErrors.documento || '';
        }
        break;
      case 'correo':
        const correoErrors = validateEmployeeEmail(value, employees, employee);
        error = correoErrors.correo || '';
        break;
      case 'telefono':
        if (!value.trim()) {
          error = 'El teléfono es obligatorio';
        } else if (value.length < 7 || value.length > 15) {
          error = 'El teléfono debe tener entre 7 y 15 dígitos';
        }
        break;
      default:
        break;
    }

    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Asegurar que el teléfono tenga el formato +XXXXXXXXXX
    let telefonoFormateado = form.telefono;
    if (telefonoFormateado && !telefonoFormateado.startsWith('+')) {
      telefonoFormateado = '+' + telefonoFormateado;
    }

    const updatedEmployee = {
      id: employee.id,
      nombre: form.nombre,
      tipo_documento: form.tipoDocumento,
      documento: form.documento,
      telefono: telefonoFormateado,
      correo: form.correo,
      direccion: form.direccion,
      estado: form.estado,
    };

    console.log("📤 DATOS A ACTUALIZAR:", updatedEmployee);

    if (onSave) {
      onSave(updatedEmployee);
    }
  };

  const handleEditScheduling = (prog) => {
    setEditingScheduling(prog);
  };

  const handleSaveScheduling = (updatedProg) => {
    const updatedSchedulings = schedulings.map(s =>
      String(s.id) === String(updatedProg.id) ? updatedProg : s
    );
    setSchedulings(updatedSchedulings);
    setEditingScheduling(null);
    toast.success('Programación actualizada');
  };

  const handleDeleteScheduling = (id) => {
    console.log('=== DEBUG ELIMINACIÓN ===');
    console.log('ID a eliminar:', id);
    console.log('Programaciones actuales:', schedulings);

    if (window.confirm('¿Seguro que deseas eliminar esta programación?')) {
      const updatedSchedulings = schedulings.filter(s => String(s.id) !== String(id));
      console.log('Programaciones después de eliminar:', updatedSchedulings.length);
      setSchedulings(updatedSchedulings);
      toast.success('Programación eliminada');
    }
  };

  const handleCancelEditScheduling = () => {
    setEditingScheduling(null);
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          className={`text-lg font-semibold px-3 py-1 rounded-t transition-colors ${
            activeTab === 'empleado' ? 'bg-primary text-white' : 'bg-gray-100 text-text-main'
          }`}
          onClick={() => setActiveTab('empleado')}
          type="button"
        >
          Editar Empleado
        </button>
        <button
          className={`text-lg font-semibold px-3 py-1 rounded-t transition-colors ${
            activeTab === 'programacion' ? 'bg-primary text-white' : 'bg-gray-100 text-text-main'
          }`}
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
              <label htmlFor="nombre" className="block text-sm font-medium text-text-main mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                id="nombre"
                value={form.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-background border rounded-md px-3 py-2 text-text-main font-medium focus:outline-none ${
                  errors.nombre ? 'border-red-500' : 'border-accent-light'
                }`}
                required
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <label htmlFor="tipoDocumento" className="block text-sm font-medium text-text-main mb-1">
                Tipo de Documento
              </label>
              <select
                name="tipoDocumento"
                id="tipoDocumento"
                value={form.tipoDocumento}
                onChange={handleChange}
                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                required
              >
                {tiposDocumento.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="documento" className="block text-sm font-medium text-text-main mb-1">
                Documento
              </label>
              <input
                type="text"
                name="documento"
                id="documento"
                value={form.documento}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Solo números"
                maxLength={15}
                className={`w-full bg-background border rounded-md px-3 py-2 text-text-main font-medium focus:outline-none ${
                  errors.documento ? 'border-red-500' : 'border-accent-light'
                }`}
                required
              />
              {errors.documento && <p className="text-red-500 text-xs mt-1">{errors.documento}</p>}
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-text-main mb-1">
                Teléfono
              </label>
              <input
                type="text"
                name="telefono"
                id="telefono"
                value={form.telefono}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Solo números"
                maxLength={15}
                className={`w-full bg-background border rounded-md px-3 py-2 text-text-main font-medium focus:outline-none ${
                  errors.telefono ? 'border-red-500' : 'border-accent-light'
                }`}
                required
              />
              {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
            </div>

            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-text-main mb-1">
                Correo
              </label>
              <input
                type="email"
                name="correo"
                id="correo"
                value={form.correo}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-background border rounded-md px-3 py-2 text-text-main font-medium focus:outline-none ${
                  errors.correo ? 'border-red-500' : 'border-accent-light'
                }`}
                required
              />
              {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo}</p>}
            </div>

            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-text-main mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                id="direccion"
                value={form.direccion}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-background border rounded-md px-3 py-2 text-text-main font-medium focus:outline-none ${
                  errors.direccion ? 'border-red-500' : 'border-accent-light'
                }`}
                required
              />
              {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>}
            </div>

            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-text-main mb-1">
                Estado
              </label>
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
              onSave={handleSaveScheduling}
              onCancelEdit={handleCancelEditScheduling}
            />
          ) : schedulings.length > 0 ? (
            <>
              <ul className="list-disc pl-6">
                {pageSchedulings.map((s, idx) => (
                  <li key={s.id || idx} className="mb-2 flex items-center gap-4">
                    <span>
                      {s.fechaInicio} - {s.fechaFin} | {s.horaInicio} - {s.horaFin} | {s.repeticion} |
                      Días: {s.dias && s.dias.length > 0 ? s.dias.join(', ') : '-'}
                    </span>
                    <button
                      onClick={() => handleEditScheduling(s)}
                      className="bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600 transition text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteScheduling(s.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-xs"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <span className="text-sm text-gray-600">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-text-main/60">No hay programaciones registradas.</p>
          )}

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-100 text-gray-600 px-6 py-2 rounded font-semibold hover:bg-gray-200 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditEmployee;