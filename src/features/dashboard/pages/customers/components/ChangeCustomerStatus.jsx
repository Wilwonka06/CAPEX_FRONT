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
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isActive ? 'bg-text-main' : 'bg-gray-300'
        } cursor-pointer`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isActive ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-sm font-semibold ${isActive ? 'text-green-600' : 'text-gray-500'}`}>{isActive ? 'Activo' : 'Inactivo'}</span>
    </div>
  );
};

export default ChangeCustomerStatus;
