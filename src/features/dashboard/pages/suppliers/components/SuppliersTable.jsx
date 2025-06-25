import PropTypes from "prop-types";
import { useState } from "react";
import EditSupplier from "./EditSupplier";
import SupplierDetail from "./SupplierDetail";
/* import DeleteSupplier from "./DeleteSupplier"; */
import ChangeSupplierStatus from "./ChangeSupplierStatus";

export default function SuppliersTable({ suppliers, onEdit, onDelete, onStatusChange }) {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
/*   const [deleteOpen, setDeleteOpen] = useState(false); */

  const handleViewDetail = (supplier) => {
    setSelectedSupplier(supplier);
    setDetailOpen(true);
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setEditOpen(true);
  };

/*   const handleDelete = (supplier) => {
    setSelectedSupplier(supplier);
    setDeleteOpen(true);
  }; */

  const handleSaveEdit = (updatedSupplier) => {
    if (onEdit) onEdit(updatedSupplier);
    setEditOpen(false);
    setSelectedSupplier(null);
  };

/*   const handleConfirmDelete = (supplierId) => {
    if (onDelete) onDelete(supplierId);
    setDeleteOpen(false);
    setSelectedSupplier(null);
  };
 */
  return (
    <>
      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 hover:bg-gray-100">
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">NOMBRE</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">CONTACTO</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">DIRECCIÓN</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">TELÉFONO</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ESTADO</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="py-4 px-4 text-sm font-medium text-gray-900">{supplier.id}</td>
                <td className="py-4 px-4 text-sm font-medium text-gray-900">{supplier.nombre}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{supplier.contacto}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{supplier.direccion}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{supplier.telefono}</td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <ChangeSupplierStatus supplier={supplier} onStatusChange={onStatusChange} />
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      supplier.isActive
                        ? 'text-gray-600'
                        : 'text-gray-600 '
                    }`}>
                      {supplier.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm font-medium text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50 hover:border-blue-300 rounded-md flex items-center justify-center transition-colors"
                      onClick={() => handleViewDetail(supplier)}
                      title="Ver detalles"
                    >
                      <i className="bi bi-eye text-primary text-sm"></i>
                    </button>
                    <button
                      className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50 hover:border-amber-300 rounded-md flex items-center justify-center transition-colors"
                      onClick={() => handleEdit(supplier)}
                      title="Editar"
                    >
                      <i className="bi bi-pencil-square text-amber-500 text-sm"></i>
                    </button>
                    <button
                      className="h-8 w-8 p-0 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-md flex items-center justify-center transition-colors"
                      onClick={() => onDelete(supplier.id)}
                      title="Eliminar"
                    >
                      <i className="bi bi-trash text-red-500 text-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SupplierDetail
        supplier={selectedSupplier}
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedSupplier(null);
        }}
      />
      <EditSupplier
        supplier={selectedSupplier}
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedSupplier(null);
        }}
        onSave={handleSaveEdit}
      />
      {/* <DeleteSupplier
        supplier={selectedSupplier}
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedSupplier(null);
        }}
        onDelete={handleConfirmDelete}
      /> */}
    </>
  );
}

SuppliersTable.propTypes = {
  suppliers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      nombre: PropTypes.string.isRequired,
      contacto: PropTypes.string.isRequired,
      direccion: PropTypes.string.isRequired,
      telefono: PropTypes.string.isRequired,
      correo: PropTypes.string.isRequired,
      isActive: PropTypes.bool.isRequired,
    })
  ).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
}; 