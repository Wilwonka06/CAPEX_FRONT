import { useState, useEffect } from 'react';
import PrivilegesTable from './PrivilegesTable';
import { validateRole } from '../../../../../shared/validations';

const isDev = import.meta.env.DEV;

const EditProductCard = ({ children, title, onClose }) => (
  <div className="bg-white rounded-2xl shadow-2xl w-full relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
    <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <i className="bi bi-pencil-square text-lg"></i>
        </div>
        <h2 className="text-xl font-bold m-0">{title}</h2>
      </div>
      <button
        className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-200"
        onClick={onClose}
        aria-label="Cerrar"
      >×</button>
    </div>
    <div
      className="overflow-y-auto overflow-x-hidden p-6 flex-1 bg-gray-50"
      style={{ maxHeight: 'calc(95vh - 120px)' }}
    >
      {children}
    </div>
    <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-xs hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
      >
        <i className="bi bi-x-circle"></i>Cancelar
      </button>
      <button
        type="submit"
        form="edit-role-form"
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 ml-2"
      >
        <i className="bi bi-check-circle"></i>Guardar Cambios
      </button>
    </div>
  </div>
);

const EditRole = ({ isOpen, onClose, role, onEdit, loading, roles = [] }) => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [privileges, setPrivileges] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (role && isOpen) {
      setFormData({
        name: role.name ?? role.nombre ?? '',
        description: role.description ?? role.descripcion ?? '',
      });
      if (role.privileges) setPrivileges(role.privileges);
    }
  }, [role, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: '', description: '' });
      setPrivileges({});
      setErrors({});
      setTouched({});
    }
  }, [isOpen]);

  useEffect(() => {
    const otherRoles = roles.filter(r => r.id !== role?.id);
    const validationResult = validateRole(
      { nombre: formData.name, descripcion: formData.description },
      privileges,
      otherRoles
    );
    setErrors(validationResult.errors || {});
  }, [formData, privileges, roles, role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handlePrivilegeChange = (modulo, accion, checked) => {
    setPrivileges(prev => {
      const currentModulePrivileges = prev[modulo] || {};
      const newModulePrivileges = { ...currentModulePrivileges, [accion]: checked };

      if (!checked && accion === 'Visualizar') {
        Object.keys(newModulePrivileges).forEach(key => {
          if (key !== accion) delete newModulePrivileges[key];
        });
        newModulePrivileges['Visualizar'] = false;
      }

      return { ...prev, [modulo]: newModulePrivileges };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(errors).length === 0 && onEdit) {
      const cleanedPrivileges = {};
      Object.keys(privileges).forEach(modulo => {
        const modulePrivileges = privileges[modulo];
        const cleanedModulePrivileges = {};
        Object.keys(modulePrivileges).forEach(accion => {
          if (modulePrivileges[accion] === true) {
            cleanedModulePrivileges[accion] = true;
          }
        });
        if (Object.keys(cleanedModulePrivileges).length > 0) {
          cleanedPrivileges[modulo] = cleanedModulePrivileges;
        }
      });

      const roleToUpdate = {
        id: role.id,
        name: formData.name,
        description: formData.description,
        estado: role.estado,
        privileges: cleanedPrivileges,
        permisos: role.permisos || [],
        privilegios: role.privilegios || [],
      };

      if (isDev) {
        console.log('[EditRole] roleToUpdate:', roleToUpdate);
      }

      await onEdit(roleToUpdate);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-hidden">
      <div className="w-full max-w-3xl mx-4">
        <EditProductCard title="Editar rol" onClose={onClose}>
          <form onSubmit={handleSubmit} id="edit-role-form" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-xs bg-white"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={16}
                />
                {touched.name && errors.nombre && (
                  <p className="text-red-600 text-xs mt-1">{errors.nombre}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Descripción (opcional)</label>
                <input
                  type="text"
                  name="description"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-xs bg-white"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={100}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-2">Privilegios</label>
              <PrivilegesTable value={privileges} onChange={handlePrivilegeChange} />
              {touched.privilegios && errors.privilegios && (
                <p className="text-red-600 text-xs mt-1">{errors.privilegios}</p>
              )}
            </div>
          </form>
        </EditProductCard>
      </div>
    </div>
  );
};

export default EditRole;
