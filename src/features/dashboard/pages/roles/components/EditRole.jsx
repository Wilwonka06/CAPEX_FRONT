import { useState, useEffect } from 'react';
import PrivilegesTable from './PrivilegesTable';
import { validateRole } from '../../../../../shared/validations';

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
  const [touched, setTouched] = useState({});

  // Cargar datos del rol cuando se abre el modal
  useEffect(() => {
    if (role && isOpen) {
      setFormData({
        name: role.name ?? role.nombre ?? '',
        description: role.description ?? role.descripcion ?? ''
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
      setTouched({});
    }
  }, [isOpen]);

  useEffect(() => {
    // Excluye el rol actual de la validación de nombre único
    const otherRoles = roles.filter(r => r.id !== role?.id);
    const validationResult = validateRole(
      { nombre: formData.name, descripcion: formData.description },
      privileges,
      otherRoles
    );
    console.log('🔍 Resultado de validación:', validationResult);
    console.log('📋 Datos del formulario:', { formData, privileges, otherRoles });
    setErrors(validationResult.errors || {});
  }, [formData, privileges, roles, role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setTouched(prev => ({ ...prev, [name]: true }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(errors).length === 0 && onEdit) {
      const roleToUpdate = {
        id: role.id,
        name: formData.name,
        description: formData.description,
        estado: role.estado, // Mantener el estado original del rol
        privileges: privileges,
        permisos: role.permisos || [],
        privilegios: role.privilegios || []
      };

      console.log('🔄 Enviando rol a actualizar:', roleToUpdate);
      console.log('📊 Privilegios actuales:', privileges);
      console.log('📊 Privilegios originales:', role.privileges);

      await onEdit(roleToUpdate);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <EditProductCard title="Editar rol" onClose={handleClose}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                name="name"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.name && errors.nombre && <p className="text-red-600 text-xs mt-1">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
              <input
                type="text"
                name="description"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Privilegios</label>
            <PrivilegesTable value={privileges} onChange={handlePrivilegeChange} />
            {touched.privilegios && errors.privilegios && <p className="text-red-600 text-xs mt-1">{errors.privilegios}</p>}
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md font-semibold transition flex items-center bg-black text-white hover:bg-gray-800"
              disabled={Object.keys(errors).length > 0}
            >
              <i className="bi bi-check-circle mr-2"></i>
              Guardar Cambios
            </button>
          </div>
        </form>
      </EditProductCard>
    </div>
  );
};

export default EditRole;