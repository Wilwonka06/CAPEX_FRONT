import { useState } from "react";
import ConfirmStatusChangeModal from "../../../../../shared/components/ConfirmStatusChangeModal";

const ChangeSupplierStatus = ({ supplier, onStatusChange }) => {
  const [isChanging, setIsChanging] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleToggleClick = () => {
    setShowModal(true);
  };

  const handleConfirmChange = async () => {
    setIsChanging(true);
    try {
      if (onStatusChange) await onStatusChange(supplier.id);
      setShowModal(false);
    } catch (error) {
      console.error("Error al cambiar el estado del proveedor:", error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleCloseModal = () => {
    if (!isChanging) {
      setShowModal(false);
    }
  };

  return (
    <>
      <button
        onClick={handleToggleClick}
        disabled={isChanging}
        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
          supplier.isActive ? 'bg-text-main' : 'bg-gray-300'
        } ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
            supplier.isActive ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
        {isChanging && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </button>
      <ConfirmStatusChangeModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmChange}
        isActivating={!supplier.isActive}
        itemName={supplier.nombre}
        loading={isChanging}
      />
    </>
  );
};

export default ChangeSupplierStatus; 