import { useState } from 'react';
import ConfirmStatusChangeModal from '../../../../../shared/components/ConfirmStatusChangeModal';

const ChangeCustomerStatus = ({ status = 'Activo', onToggle, customerName = '' }) => {
  const [showModal, setShowModal] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const isActive = status === 'Activo';

  const handleToggle = () => {
    setShowModal(true);
  };

  const handleConfirmChange = async () => {
    setIsChanging(true);
    try {
      if (onToggle) {
        await onToggle();
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error al cambiar el estado del cliente:", error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleToggle}
          disabled={isChanging}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            isActive ? 'bg-text-main' : 'bg-gray-300'
          } ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              isActive ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-xs`}>{isActive ? 'Activo' : 'Inactivo'}</span>
      </div>
      <ConfirmStatusChangeModal
        isOpen={showModal}
        onClose={() => {
          if (!isChanging) {
            setShowModal(false);
          }
        }}
        onConfirm={handleConfirmChange}
        isActivating={!isActive}
        itemName={customerName || 'este cliente'}
        loading={isChanging}
      />
    </>
  );
};

export default ChangeCustomerStatus;