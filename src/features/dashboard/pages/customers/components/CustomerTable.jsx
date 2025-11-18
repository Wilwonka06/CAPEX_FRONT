import React from "react";
import PropTypes from "prop-types";
import ChangeCustomerStatus from "./ChangeCustomerStatus";
import TableSkeleton from "../../../../../shared/components/TableSkeleton";

const CustomerTable = ({
  customers,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  loading = false,
}) => {
  if (loading) {
    return (
      <TableSkeleton columns={7} rows={5} hasAvatar={false} hasActions={true} />
    );
  }

  if (!loading && (!customers || customers.length === 0)) {
    return (
      <div className="overflow-x-auto rounded-lg shadow font-inter">
        <div className="py-12 text-center">
          <i className="bi bi-people text-6xl text-gray-300"></i>
          <p className="mt-4 text-gray-500 text-sm">
            No hay clientes registrados.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Los clientes aparecerán aquí cuando se registren.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow font-inter">
      <table className="min-w-full text-xs">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">
              Foto
            </th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">
              N° Documento
            </th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">
              Nombre Completo
            </th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">
              Teléfono
            </th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">
              Estado
            </th>
            <th className="py-2 px-3 text-center font-semibold text-gray-700">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {customers.map((customer) => (
            <tr
              key={customer.id}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              <td className="py-2 px-3">
                <img
                  src={
                    customer.foto ||
                    "https://ui-avatars.com/api/?name=Cliente&background=eee&color=888&size=64"
                  }
                  alt={customer.nombre || "Cliente"}
                  className="w-10 h-10 rounded-full object-cover border"
                />
              </td>
              <td className="py-2 px-3">{customer.documentNumber}</td>
              <td className="py-2 px-3">
                {customer.nombre || customer.firstName || ""}
              </td>
              <td className="py-2 px-3">{customer.phone}</td>
              <td className="py-2 px-3">
                <ChangeCustomerStatus
                  status={customer.status}
                  onToggle={() => onToggleStatus(customer.id)}
                />
              </td>
              <td className="py-2 px-3 text-center">
                <div className="flex justify-center space-x-2">
                  <button
                    title="Ver"
                    onClick={() => onView(customer)}
                    className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 flex items-center justify-center"
                  >
                    <i className="bi bi-eye text-primary text-[18px]"></i>
                  </button>
                  <button
                    title="Editar"
                    onClick={() => onEdit(customer)}
                    className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 flex items-center justify-center"
                  >
                    <i className="bi bi-pencil-square text-amber-500 text-[18px]"></i>
                  </button>
                  <button
                    title="Eliminar"
                    onClick={() => onDelete(customer)}
                    className="h-8 w-8 p-0 rounded-md hover:bg-red-50 flex items-center justify-center"
                  >
                    <i className="bi bi-trash text-red-500 text-[18px]"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
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
