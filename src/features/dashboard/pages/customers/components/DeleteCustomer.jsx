import { useState } from "react";
 

const DeleteCustomer = ({ isOpen, onClose, onDelete, customer }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDelete) await onDelete(customer.id);
      onClose();
    } catch (error) {
      console.error("Error al eliminar el cliente:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in max-h-[95vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="bi bi-trash text-lg"></i></div><h2 className="text-xl font-bold m-0">Eliminar Cliente</h2></div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-exclamation-triangle text-white text-2xl"></i>
          </div>
          <p className="text-sm text-gray-600">¿Estás seguro de que quieres eliminar este cliente?</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex items-start space-x-3">
            <i className="bi bi-info-circle text-red-500 mt-0.5"></i>
            <div>
              <h3 className="font-medium text-red-800 mb-1">{customer.firstName} {customer.lastName}</h3>
              <p className="text-sm text-red-700">{customer.documentType} {customer.documentNumber}</p>
              <p className="text-sm text-red-700">{customer.email}</p>
            </div>
          </div>
        </div>
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-xs hover:bg-gray-50 transition-all duration-200 flex items-center gap-2" onClick={onClose} disabled={isDeleting}><i className="bi bi-x-circle"></i>Cancelar</button>
          <button className="px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition flex items-center gap-2 ml-2" onClick={handleDelete} disabled={isDeleting}>{isDeleting ? (<><i className="bi bi-arrow-clockwise animate-spin"></i>Eliminando...</>) : (<><i className="bi bi-trash"></i>Eliminar</>)}</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCustomer;