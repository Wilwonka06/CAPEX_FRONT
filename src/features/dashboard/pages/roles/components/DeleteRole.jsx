const DeleteRole = ({ isOpen, onClose, onDelete, role }) => {
  if (!isOpen || !role) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative animate-fade-in border border-gray-200">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-primary">Eliminar Rol</h2>
        <p className="mb-6 text-text-main">¿Estás seguro que deseas eliminar el rol <span className="font-semibold">{role.name}</span>? Esta acción no se puede deshacer.</p>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onDelete(role.id)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-md"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteRole; 