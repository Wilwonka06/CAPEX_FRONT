import PropTypes from "prop-types";
import { useState } from "react";
import EditSupplier from "./EditSupplier";
import SupplierDetail from "./SupplierDetail";
/* import DeleteSupplier from "./DeleteSupplier"; */
import ChangeSupplierStatus from "./ChangeSupplierStatus";
import TruncatedText from "../../../../../shared/components/TruncatedText";

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
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50 hover:bg-gray-100">
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">ID</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Nombre</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Contacto</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Correo</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Teléfono</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Estado</th>
            <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {suppliers.length > 0 ? suppliers.map((supplier) => (
            <tr key={supplier.id} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="py-4 px-4 text-xs font-medium text-gray-900">{supplier.id}</td>
              <td className="py-4 px-4 text-xs font-medium text-gray-900">
                <TruncatedText
                  text={supplier.nombre}
                  maxLength={20}
                  maxWidth="max-w-[150px]"
                />
              </td>
              <td className="py-4 px-4 text-xs text-gray-600">
                <TruncatedText
                  text={supplier.contacto}
                  maxLength={15}
                  maxWidth="max-w-[120px]"
                />
              </td>
              <td className="py-4 px-4 text-xs text-gray-600">
                <TruncatedText
                  text={supplier.correo}
                  maxLength={25}
                  maxWidth="max-w-[180px]"
                />
              </td>
              <td className="py-4 px-4 text-xs text-gray-600">
                <TruncatedText
                  text={supplier.telefono}
                  maxLength={15}
                  maxWidth="max-w-[120px]"
                />
              </td>
              <td className="py-4 px-4 text-xs text-gray-600">
                <div className="flex items-center space-x-3">
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
                    className="h-8 w-8 p-0  hover:bg-gray-50 hover:border-blue-300 rounded-md flex items-center justify-center transition-colors"
                    onClick={() => handleViewDetail(supplier)}
                    title="Ver detalles"
                  >
                    <i className="bi bi-eye text-primary text-lg"></i>
                  </button>
                  <button
                    className="h-8 w-8 p-0 hover:bg-gray-50 hover:border-amber-300 rounded-md flex items-center justify-center transition-colors"
                    onClick={() => handleEdit(supplier)}
                    title="Editar"
                  >
                    <i className="bi bi-pencil-square text-amber-500 text-lg"></i>
                  </button>
                  <button
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300 rounded-md flex items-center justify-center transition-colors"
                    onClick={() => onDelete(supplier.id)}
                    title="Eliminar"
                  >
                    <i className="bi bi-trash text-red-500 text-lg"></i>
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="7" className="text-center py-12">
                <i className="bi bi-building text-6xl text-gray-300"></i>
                <p className="mt-4 text-gray-500 text-sm">No hay proveedores registrados.</p>
                <p className="text-xs text-gray-400 mt-1">Los proveedores aparecerán aquí cuando se registren.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
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
        suppliers={suppliers}
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
      nit: PropTypes.string,
      nombre: PropTypes.string.isRequired,
      contacto: PropTypes.string.isRequired,
      direccion: PropTypes.string.isRequired,
      telefono: PropTypes.string.isRequired,
      correo: PropTypes.string.isRequired,
      tipo: PropTypes.string,
      isActive: PropTypes.bool.isRequired,
    })
  ).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
}; 