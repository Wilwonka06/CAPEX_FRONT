import { useState, useEffect } from 'react';
import PrivilegesTable from './PrivilegesTable';
import { validateRole } from '../../../../../shared/validations';
 

const CreateRolesCard = ({ children, title, onClose }) => (
  <div className="w-full max-w-3xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
    <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="bi bi-plus-circle text-lg"></i></div>
        <h2 className="text-xl font-bold m-0">{title}</h2>
      </div>
      <button className="text-white/80 w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-200" onClick={onClose} aria-label="Cerrar">×</button>
    </div>
    <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>{children}</div>
    <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
      <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-xs hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"><i className="bi bi-x-circle"></i>Cancelar</button>
      <button type="submit" form="create-role-form" className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 ml-2"><i className="bi bi-plus-circle"></i>Crear Rol</button>
    </div>
  </div>
);

const CreateRoles = ({ isOpen, onClose, onCreate, loading, roles = [] }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [privileges, setPrivileges] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ nombre: '', descripcion: '' });
      setPrivileges({});
      setErrors({});
      setTouched({});
      setShowErrors(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setErrors(validateRole(formData, privileges, roles).errors);
  }, [formData, privileges, roles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
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

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowErrors(true);
    setTouched({ nombre: true, descripcion: true, privilegios: true });
    
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
    
    const validationErrors = validateRole(formData, cleanedPrivileges, roles).errors;
    setErrors(validationErrors);
    
    // === DEBUG CREATE ROLE ===
    console.log('=== DEBUG CREATE ROLE ===');
    console.log('1. formData:', formData);
    console.log('2. privileges (raw state):', privileges);
    console.log('2.1. privileges (JSON):', JSON.stringify(privileges, null, 2));
    
    // Contar privilegios seleccionados
    let totalSelected = 0;
    const selectedPrivileges = [];
    Object.keys(privileges).forEach(modulo => {
      Object.keys(privileges[modulo] || {}).forEach(accion => {
        if (privileges[modulo][accion] === true) {
          totalSelected++;
          selectedPrivileges.push(`${modulo} → ${accion}`);
          console.log(`   ✓ ${modulo} → ${accion}`);
        }
      });
    });
    console.log(`3. Total privilegios seleccionados: ${totalSelected}`);
    console.log('4. Lista de privilegios seleccionados:', selectedPrivileges);
    
    if (Object.keys(validationErrors).length === 0 && onCreate) {
      try {
        await onCreate(formData, cleanedPrivileges); // Usar privilegios limpiados
        // Cerrar el modal solo después de que la operación sea exitosa
        onClose();
      } catch (error) {
        // El error ya se maneja en el componente padre
        console.error('Error al crear rol:', error);
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <CreateRolesCard title="Crear nuevo rol" onClose={handleClose}>
        <form onSubmit={handleSubmit} id="create-role-form" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                  (touched.nombre || showErrors) && errors.nombre
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white`}
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={16}
              />
              {(touched.nombre || showErrors) && errors.nombre && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <i className="bi bi-exclamation-triangle"></i>
                  {errors.nombre}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Descripción (opcional)
              </label>
              <input
                type="text"
                name="descripcion"
                className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                  (touched.descripcion || showErrors) && errors.descripcion
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white`}
                value={formData.descripcion}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={100}
              />
              {(touched.descripcion || showErrors) && errors.descripcion && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <i className="bi bi-exclamation-triangle"></i>
                  {errors.descripcion}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Privilegios <span className="text-red-500">*</span>
            </label>
            <PrivilegesTable value={privileges} onChange={handlePrivilegeChange} />
            {showErrors && errors.privilegios && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <i className="bi bi-exclamation-triangle"></i>
                {errors.privilegios}
              </p>
            )}
          </div>
        </form>
      </CreateRolesCard>
    </div>
  );
};

export default CreateRoles;
