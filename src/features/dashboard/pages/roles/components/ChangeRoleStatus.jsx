import Swal from 'sweetalert2';

const ChangeRoleStatus = ({ status = 'Activo', onToggle }) => {
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
    <div className="flex items-center space-x-3">
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none  ${
          isActive ? 'bg-text-main' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
            isActive ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive ? ' text-gray-800' : ' text-gray-600 '
        }`}
      >
        {isActive ? 'Activo' : 'Inactivo'}
      </span>
    </div>
  );
};

export default ChangeRoleStatus; 