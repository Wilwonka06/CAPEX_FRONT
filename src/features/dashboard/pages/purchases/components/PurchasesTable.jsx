import PropTypes from "prop-types";
import { formatNumber } from "../../../../../shared/utils/formatters";
import TableSkeleton from "../../../../../shared/components/TableSkeleton";
import Paginator from "../../../../../shared/Paginator";

export default function PurchasesTable({ purchases, onView, onAnnul, currentPage, totalPages, onPageChange, loading = false }) {
  if (loading) {
    return <TableSkeleton columns={5} rows={5} hasAvatar={false} hasActions={true} />;
  }
  // Función para formatear números usando el estándar del proyecto
  const formatPrice = (num) => {
    if (num === null || num === undefined) return '$0';
    return '$' + formatNumber(num);
  };

  if (!loading && (!purchases || purchases.length === 0)) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white font-inter">
        <div className="py-12 text-center">
          <i className="bi bi-receipt text-6xl text-gray-300"></i>
          <p className="mt-4 text-gray-500 text-sm">No hay compras registradas.</p>
          <p className="text-xs text-gray-400 mt-1">Las compras aparecerán aquí cuando se registren.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white font-inter">
        <table className="min-w-full text-xs">
        <thead>
          <tr className="bg-gray-50 hover:bg-gray-100">
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Fecha Compra</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Proveedor</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Total</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Estado</th>
            <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {purchases.length > 0 ? purchases.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="py-4 px-4 text-xs text-gray-600">{p.fechaCompra || 'N/A'}</td>
              <td className="py-4 px-4 text-xs text-gray-600">{p.proveedor || 'N/A'}</td>
              <td className="py-4 px-4 text-xs text-gray-600 font-semibold">{formatPrice(p.total)}</td>
              <td className="py-4 px-4 text-xs text-gray-600">
                <span className={`text-xs font-semibold rounded-full px-2 py-1
                  ${p.estado === 'Completada' ? 'bg-green-100 text-green-800' : ''}
                  ${p.estado === 'Cancelada' ? 'bg-red-100 text-red-800' : ''}
                `}>
                  {p.estado === 'Completada' ? "Completada" : p.estado === 'Cancelada' ? "Cancelada" : p.estado || 'N/A'}
                </span>
              </td>
              <td className="py-4 px-4 text-xs font-medium text-right">
                <div className="flex justify-end space-x-2">
                  <button className="h-8 w-8 p-0 hover:bg-gray-50 hover:border-blue-300 rounded-md flex items-center justify-center transition-colors" title="Ver detalles" onClick={() => onView(p)}>
                    <i className="bi bi-eye text-primary text-[18px]"></i>
                  </button>
                  {p.estado !== 'Anulada' && p.estado !== 'Cancelada' && (
                    <button className="h-8 w-8 p-0 hover:bg-red-50 rounded-md flex items-center justify-center transition-colors" title="Anular" onClick={() => onAnnul(p.id)}>
                      <i className="bi bi-x-octagon text-red-500 text-[18px]"></i>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          )) : null}
        </tbody>
      </table>
      </div>
      {/* Paginador */}
      {totalPages > 1 && purchases.length > 0 && (
        <Paginator
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}

PurchasesTable.propTypes = {
  purchases: PropTypes.array.isRequired,
  onView: PropTypes.func.isRequired,
  onAnnul: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};