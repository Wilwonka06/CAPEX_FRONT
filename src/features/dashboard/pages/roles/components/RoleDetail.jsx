import PrivilegesTable from './PrivilegesTable';
 

const RolesCard = ({ children, title, onClose }) => (
  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
    <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
      <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="bi bi-eye text-lg"></i></div><h2 className="text-xl font-bold m-0">{title}</h2></div>
      <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-200" onClick={onClose} aria-label="Cerrar">×</button>
    </div>
    <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>{children}</div>
    <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200"><button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2" onClick={onClose}><i className="bi bi-check-circle"></i>Cerrar</button></div>
  </div>
);

const RolesDetail = ({ isOpen, onClose, role }) => {
  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <RolesCard title="Detalle del rol" onClose={onClose}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium mb-1">Nombre</label>
            <div className="w-full px-3 py-2 border rounded-md bg-white text-black text-xs">{role.name || role.nombre}</div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Descripción</label>
            <div className="w-full px-3 py-2 border rounded-md bg-white text-black text-xs">{role.description || role.descripcion}</div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Estado</label>
            <div className="w-full px-3 py-2 border rounded-md bg-white text-black text-xs">
              {role.estado || role.status || 'Activo'}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold mb-2">Privilegios</label>
          <PrivilegesTable value={role.privileges || {}} disabled={true} />
        </div>
      </RolesCard>
    </div>
  );
};

export default RolesDetail;