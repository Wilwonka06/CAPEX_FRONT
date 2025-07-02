import { useState, useEffect } from 'react';
import PrivilegesTable from './PrivilegesTable';
import { validateRole } from '../services/ValidateRoleService';

const EditProductCard = ({ children, title, onClose }) => (
  <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl p-4 md:p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto border border-gray-200">
    <button
      className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold"
      onClick={onClose}
      aria-label="Cerrar"
    >
      ×
    </button>
    <h2 className="text-xl font-bold mb-4 text-primary">{title}</h2>
    {children}
  </div>
);

const EditRole = ({ isOpen, onClose, role, onEdit, loading, roles = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [privileges, setPrivileges] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description
      });
      if (role.privileges) setPrivileges(role.privileges);
    }
  }, [role]);

  useEffect(() => {
    // Excluye el rol actual de la validación de nombre único
    const otherRoles = roles.filter(r => r.id !== role?.id);
    setErrors(validateRole({ nombre: formData.name }, privileges, otherRoles));
  }, [formData, privileges, roles, role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handlePrivilegeChange = (modulo, accion, checked) => {
    setPrivileges(prev => ({
      ...prev,
      [modulo]: {
        ...prev[modulo],
        [accion]: checked
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(errors).length === 0 && onEdit) onEdit(formData, privileges);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <EditProductCard title="Editar rol" onClose={onClose}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Nombre</label>
              <input
                type="text"
                name="name"
                className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.nombre && <p className="text-red-600 text-xs mt-1">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Descripción (opcional)</label>
              <input
                type="text"
                name="description"
                className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label className="block text-text-main text-sm font-bold mb-2">Privilegios</label>
            <PrivilegesTable value={privileges} onChange={handlePrivilegeChange} />
            {errors.privilegios && <p className="text-red-600 text-xs mt-1">{errors.privilegios}</p>}
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded shadow-md"
              disabled={loading || Object.keys(errors).length > 0}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </EditProductCard>
    </div>
  );
};

export default EditRole;