import PropTypes from 'prop-types';

const CategoryDetail = ({ category, isOpen, onClose }) => {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-info-circle text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">
              Detalles de Categoría
            </h2>
          </div>
          <button
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-200"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        
        {/* Contenido con scroll */}
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre de la categoría */}
            <div className="bg-white rounded-xl p-6md:col-span-2">
              <div className="flex items-center text-center gap-3 mb-3">
                <h3 className="text-xl font-bold text-gray-800">
                  {category.nombre}
                </h3>
              </div>
            </div>

            {/* Descripción - ocupa ambas columnas */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#FACC15] rounded-lg flex items-center justify-center">
                  <i className="bi bi-file-text text-white text-xl"></i>
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Descripción</span>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm min-h-[80px]">
                {category.descripcion || 'Sin descripción disponible'}
              </div>
            </div>

            {/* Información adicional */}
            {(category.createdAt || category.updatedAt) && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 md:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#FACC15] rounded-lg flex items-center justify-center">
                    <i className="bi bi-info-square text-white text-xl"></i>
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Información del Sistema
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {category.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Creada:</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(category.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                  {category.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actualizada:</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(category.updatedAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer fijo */}
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            onClick={onClose}
          >
            <i className="bi bi-check-circle"></i>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

CategoryDetail.propTypes = {
  category: PropTypes.shape({
    id_categoria_servicio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nombre: PropTypes.string.isRequired,
    descripcion: PropTypes.string,
    estado: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CategoryDetail;