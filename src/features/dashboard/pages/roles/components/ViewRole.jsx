import PrivilegesTable from './PrivilegesTable';

const ViewRolesCard = ({ children, title, onClose }) => (
  <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-4 md:p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto border border-gray-200">
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

const ViewRoles = ({ isOpen, onClose, role }) => {
  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <ViewRolesCard title="Detalle del rol" onClose={onClose}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <div className="w-full px-3 py-2 border rounded-md bg-white text-black text-sm">{role.name || role.nombre}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <div className="w-full px-3 py-2 border rounded-md bg-white text-black text-sm">{role.description || role.descripcion}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <div className="w-full px-3 py-2 border rounded-md bg-white text-black text-sm">
              {role.estado || role.status || 'Activo'}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">Privilegios</label>
          <PrivilegesTable value={role.privileges || {}} onChange={e => handleChange({ target: { name: 'cantidad', value: cleanNumber(e.target.value) } })} />
        </div>
        <div className="flex justify-end pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </ViewRolesCard>
    </div>
  );
};

export default ViewRoles;