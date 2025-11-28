import PropTypes from 'prop-types';

const CategoryDetail = ({ category, isOpen, onClose }) => {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="bi bi-tag text-lg"></i></div><h2 className="text-xl font-bold m-0">Detalles de Categoría</h2></div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          <div className="flex flex-col gap-6">
            <div className="text-lg font-bold text-gray-800 text-center mb-2">{category.nombre || category.name}</div>
            <div>
              <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Descripción</span>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm min-h-[60px]">
                {category.descripcion || category.description || 'Sin descripción'}
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200"><button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2" onClick={onClose}><i className="bi bi-check-circle"></i>Cerrar</button></div>
      </div>
    </div>
  );
};

CategoryDetail.propTypes = {
  category: PropTypes.shape({
    nombre: PropTypes.string,
    name: PropTypes.string,
    descripcion: PropTypes.string,
    description: PropTypes.string,
    estado: PropTypes.string,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CategoryDetail;