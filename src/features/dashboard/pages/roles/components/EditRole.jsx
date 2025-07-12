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

  // Cargar datos del rol cuando se abre el modal
  useEffect(() => {
    if (role && isOpen) {
      setFormData({
        name: role.name,
        description: role.description
      });
      if (role.privileges) setPrivileges(role.privileges);
    }
  }, [role, isOpen]);

  // Resetear formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: '', description: '' });
      setPrivileges({});
      setErrors({});
    }
  }, [isOpen]);

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
    if (Object.keys(errors).length === 0 && onEdit) {
      onEdit({
        id: role.id,
        name: formData.name,
        description: formData.description,
        estado: role.estado,
        privileges: privileges
      });
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <EditProductCard title="Editar rol" onClose={handleClose}>
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-text-main text-sm font-bold mb-2">Privilegios</label>
            <PrivilegesTable value={privileges} onChange={handlePrivilegeChange} disabled={loading} />
            {errors.privilegios && <p className="text-red-600 text-xs mt-1">{errors.privilegios}</p>}
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary-dark transition flex items-center"
              disabled={loading || Object.keys(errors).length > 0}
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle mr-2"></i>
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </EditProductCard>
    </div>
  );
};

export default EditRole;