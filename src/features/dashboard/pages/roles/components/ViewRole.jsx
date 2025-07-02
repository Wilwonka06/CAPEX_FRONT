import PrivilegesTable from './PrivilegesTable';

const ViewProductCard = ({ children, title, onClose }) => (
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

const ViewRole = ({ isOpen, onClose, role }) => {
  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <ViewProductCard title="Detalle del rol" onClose={onClose}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Nombre</label>
            <div className="w-full px-3 py-2 border border-accent rounded-md bg-background text-text-main">{role.name || role.nombre}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Descripción</label>
            <div className="w-full px-3 py-2 border border-accent rounded-md bg-background text-text-main">{role.description || role.descripcion}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Estado</label>
            <div className="w-full px-3 py-2 border border-accent rounded-md bg-background text-text-main">
              {role.estado || role.status || 'Activo'}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-text-main text-sm font-bold mb-2">Privilegios</label>
          <PrivilegesTable value={role.privileges || {}} onChange={() => {}} disabled />
        </div>
        <div className="flex justify-end pt-6">
          <button
            type="button"
            onClick={onClose}
            className="border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Cerrar
          </button>
        </div>
      </ViewProductCard>
    </div>
  );
};

export default ViewRole; 