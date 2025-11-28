import { useState } from "react";
import PropTypes from "prop-types";

const ChangeStatus = ({ category, isOpen, onClose, onStatusChange }) => {
  const [isChanging, setIsChanging] = useState(false);

  const handleStatusChange = async () => {
    setIsChanging(true);
    try {
      if (onStatusChange) await onStatusChange(category.id);
    } catch (error) {
      console.error("Error al cambiar el estado de la categoría:", error);
    } finally {
      setIsChanging(false);
    }
  };

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-in">
        <div className="p-6">
          <h2 className="text-xl font-bold text-primary mb-4">Cambiar Estado</h2>
          <p className="text-gray-600 mb-6">
            ¿Estás seguro de que deseas cambiar el estado de la categoría {category.name} a {category.isActive ? 'Inactivo' : 'Activo'}?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition"
              onClick={onClose}
              disabled={isChanging}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isChanging}
              className={`px-4 py-2 rounded-md font-semibold transition text-sm ${
                isChanging 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-text-main text-white hover:bg-primary-dark'
              }`}
              onClick={handleStatusChange}
            >
              {isChanging ? 'Cambiando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ChangeStatus.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    isActive: PropTypes.bool,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
};

export default ChangeStatus;