import React, { useState } from 'react';

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

const AddEmployee = ({ onCancel, onSave }) => {
  const [form, setForm] = useState(initialForm);

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
    </div>
  );
};

export default AddEmployee;
