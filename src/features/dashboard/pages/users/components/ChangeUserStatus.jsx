import { useState } from "react";
import { useAuth } from "../../../../../shared/contexts/AuthContext";

const ChangeUserStatus = ({ user, onStatusChange }) => {
  const [isChanging, setIsChanging] = useState(false);
  const { hasPrivilege } = useAuth();

  // Solo mostrar el switch si el usuario tiene permisos de edición
  const canModifyStatus = hasPrivilege('Gestión de Usuarios', 'Editar');

  const handleStatusChange = async () => {
    if (!canModifyStatus) return;

    setIsChanging(true);
    try {
      // Para usuarios, el estado es un string, no un booleano como en proveedores
      // Si está activo, cambiar a inactivo y viceversa
      const newStatus = user.estado === 'Activo' ? 'Inactivo' : 'Activo';
      const conceptoEstado = newStatus === 'Inactivo' ? 'Otro' : null; // Concepto por defecto

      if (onStatusChange) await onStatusChange(user.id_usuario || user.id, newStatus, conceptoEstado);
    } catch (error) {
      console.error("Error al cambiar el estado del usuario:", error);
    } finally {
      setIsChanging(false);
    }
  };

  if (!canModifyStatus) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        user.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {user.estado === 'Activo' ? "Activo" : "Inactivo"}
      </span>
    );
  }

  return (
    <button
      onClick={handleStatusChange}
      disabled={isChanging}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
        user.estado === 'Activo' ? 'bg-text-main' : 'bg-gray-300'
      } ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={`Cambiar a ${user.estado === 'Activo' ? 'Inactivo' : 'Activo'}`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          user.estado === 'Activo' ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
      {isChanging && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
};

export default ChangeUserStatus;