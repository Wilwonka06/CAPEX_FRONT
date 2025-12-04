import PropTypes from "prop-types";

const ConfirmLogoutModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm select-none font-inter">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in">
        {/* Header */}
        <div className="flex-none bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-between px-6 py-4 shadow-lg rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-box-arrow-right text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">Cerrar Sesión</h2>
          </div>
          <button
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-200"
            onClick={onClose}
            aria-label="Cerrar"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            ¿Deseas cerrar sesión?
          </p>
          <p className="text-sm text-gray-500">
            Tendrás que volver a iniciar sesión para acceder nuevamente.
          </p>
        </div>

        {/* Footer */}
        <div className="flex-none bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
            onClick={onClose}
            disabled={loading}
          >
            <i className="bi bi-x-circle"></i>
            Cancelar
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow-sm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Cerrando sesión...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-right"></i>
                Sí, cerrar sesión
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmLogoutModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default ConfirmLogoutModal;


