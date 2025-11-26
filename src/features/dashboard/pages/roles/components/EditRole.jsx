import { useState, useEffect } from 'react';
import PrivilegesTable from './PrivilegesTable';
import { validateRole } from '../../../../../shared/validations';
 

const EditProductCard = ({ children, title, onClose }) => (
  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[95vh] flex flex-col overflow-hidden">
    <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
      <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="bi bi-pencil-square text-lg"></i></div><h2 className="text-xl font-bold m-0">{title}</h2></div>
      <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-200" onClick={onClose} aria-label="Cerrar">×</button>
    </div>
    <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>{children}</div>
    <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200"><button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-xs hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"><i className="bi bi-x-circle"></i>Cancelar</button><button type="submit" form="edit-role-form" className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 ml-2"><i className="bi bi-check-circle"></i>Guardar Cambios</button></div>
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
    console.log(`🔄 handlePrivilegeChange: ${modulo} -> ${accion} = ${checked}`);
    
    setPrivileges(prev => {
      // Obtener el estado actual del módulo, o un objeto vacío si no existe
      const currentModulePrivileges = prev[modulo] || {};
      
      // Crear el nuevo estado del módulo SOLO con los privilegios que se están modificando
      const newModulePrivileges = {
        ...currentModulePrivileges,
        [accion]: checked
      };

      // Si se deselecciona "Visualizar", deseleccionar todos los demás privilegios
      if (!checked && accion === 'Visualizar') {
        // Limpiar todos los privilegios del módulo
        Object.keys(newModulePrivileges).forEach(key => {
          if (key !== accion) {
            delete newModulePrivileges[key];
          }
        });
        newModulePrivileges['Visualizar'] = false;
        console.log(`🗑️ Deseleccionando todos los privilegios de ${modulo} porque se deseleccionó Visualizar`);
      }

      // Crear el nuevo estado completo, asegurando que solo incluimos privilegios que están en true
      // o que fueron explícitamente deseleccionados (false)
      const newPrivileges = {
        ...prev,
        [modulo]: newModulePrivileges
      };

      console.log(`📊 Nuevo estado de privilegios para ${modulo}:`, newModulePrivileges);
      
      return newPrivileges;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(errors).length === 0 && onEdit) {
      // Limpiar privilegios: solo mantener los que están explícitamente en true
      const cleanedPrivileges = {};
      Object.keys(privileges).forEach(modulo => {
        const modulePrivileges = privileges[modulo];
        const cleanedModulePrivileges = {};
        
        Object.keys(modulePrivileges).forEach(accion => {
          // Solo incluir privilegios que están explícitamente en true
          if (modulePrivileges[accion] === true) {
            cleanedModulePrivileges[accion] = true;
          }
        });
        
        // Solo agregar el módulo si tiene al menos un privilegio activo
        if (Object.keys(cleanedModulePrivileges).length > 0) {
          cleanedPrivileges[modulo] = cleanedModulePrivileges;
        }
      });

      console.log('🔄 Privilegios antes de limpiar:', privileges);
      console.log('🧹 Privilegios después de limpiar:', cleanedPrivileges);

      const roleToUpdate = {
        id: role.id,
        name: formData.name,
        description: formData.description,
        estado: role.estado, // Mantener el estado original del rol
        privileges: cleanedPrivileges, // Usar privilegios limpiados
        permisos: role.permisos || [],
        privilegios: role.privilegios || []
      };

      console.log('🔄 Enviando rol a actualizar:', roleToUpdate);
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
              {touched.name && errors.nombre && <p className="text-red-600 text-xs mt-1">{errors.nombre}</p>}
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
            {touched.privilegios && errors.privilegios && <p className="text-red-600 text-xs mt-1">{errors.privilegios}</p>}
          </div>
        </form>
      </EditProductCard>
    </div>
  );
};

export default EditRole;
