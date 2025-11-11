import { useState, useEffect } from 'react';
import PrivilegesTable from './PrivilegesTable';
import { validateRole } from '../../../../../shared/validations';

const CreateRolesCard = ({ children, title, onClose }) => (
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

      // Si se selecciona cualquier privilegio que NO sea "Visualizar", 
      // automáticamente activar "Visualizar" también
      if (checked && accion !== 'Visualizar') {
        newModulePrivileges['Visualizar'] = true;
        console.log(`✅ Activando Visualizar automáticamente para ${modulo}`);
      }

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
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <CreateRolesCard title="Crear nuevo rol" onClose={handleClose}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {(touched.nombre || showErrors) && errors.nombre && <p className="text-red-600 text-xs mt-1">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
              <input
                type="text"
                name="descripcion"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                value={formData.descripcion}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
          </div>
          <div>
            <label className="block text-text-main text-sm font-bold mb-2">Privilegios</label>
            <PrivilegesTable value={privileges} onChange={handlePrivilegeChange} />
            {showErrors && errors.privilegios && <p className="text-red-600 text-xs mt-1">{errors.privilegios}</p>}
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
              className="px-4 py-2 rounded-md bg-text-main text-white font-semibold hover:bg-primary-dark transition flex items-center"
            >
              <i className="bi bi-plus-circle mr-2"></i>
              Crear Rol
            </button>
          </div>
        </form>
      </CreateRolesCard>
    </div>
  );
};

export default CreateRoles;