import Swal from 'sweetalert2';

const ChangeCustomerStatus = ({ status = 'Activo', onToggle }) => {
  const isActive = status === 'Activo';

  const handleToggle = async () => {
    const result = await Swal.fire({
      title: '¿Cambiar estado?',
      text: `¿Estás seguro de que quieres cambiar el estado a ${isActive ? 'Inactivo' : 'Activo'}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed && onToggle) {
      await onToggle();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          isActive ? 'bg-text-main' : 'bg-gray-300'
        } cursor-pointer`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
            isActive ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-xs`}>{isActive ? 'Activo' : 'Inactivo'}</span>
    </div>
  );
};

export default ChangeCustomerStatus;
