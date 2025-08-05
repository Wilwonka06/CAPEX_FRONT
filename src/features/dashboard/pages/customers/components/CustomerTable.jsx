import React from 'react';
import PropTypes from 'prop-types';
import ChangeCustomerStatus from './ChangeCustomerStatus';

const CustomerTable = ({ customers, onView, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow font-inter">
      <table className="min-w-full text-xs">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">ID</th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Tipo Doc.</th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">N° Documento</th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Nombre</th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Apellido</th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Teléfono</th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Estado</th>
            <th className="py-2 px-3 text-center font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {customers.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center py-8 text-gray-400">No hay clientes</td>
            </tr>
          ) : (
            customers.map(customer => (
              <tr key={customer.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="py-2 px-3">{customer.id}</td>
                <td className="py-2 px-3">{customer.documentType}</td>
                <td className="py-2 px-3">{customer.documentNumber}</td>
                <td className="py-2 px-3">{customer.firstName}</td>
                <td className="py-2 px-3">{customer.lastName}</td>
                <td className="py-2 px-3">{customer.phone}</td>
                <td className="py-2 px-3">
                  <ChangeCustomerStatus status={customer.status} onToggle={() => onToggleStatus(customer.id)} />
                </td>
                <td className="py-2 px-3 text-center flex gap-2 justify-center">
                  <button title="Ver" onClick={() => onView(customer)} className="text-primary hover:text-primary-dark text-lg">
                    <i className="bi bi-eye"></i>
                  </button>
                  <button title="Editar" onClick={() => onEdit(customer)} className="text-yellow-600 hover:text-yellow-800 text-lg">
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button title="Eliminar" onClick={() => onDelete(customer)} className="text-red-600 hover:text-red-800 text-lg">
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

CustomerTable.propTypes = {
  customers: PropTypes.array.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
};

export default CustomerTable; 