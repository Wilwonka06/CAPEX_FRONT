import PropTypes from "prop-types";
import TableSkeleton from "../../../../../shared/components/TableSkeleton";
import { formatPrice } from "../../../../../shared/utils/formatters";

export default function SalesTable({ sales, customers = [], onView, onAnnul, onDownload, currentPage, totalPages, onPageChange, loading = false }) {
  const formatNumber = (num) => formatPrice(num).replace('$','');

  if (loading) {
    return <TableSkeleton columns={5} rows={5} hasAvatar={false} hasActions={true} />;
  }

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
      <table className="min-w-full text-xs">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Fecha</th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Orden</th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Cliente</th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Valor</th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Estado</th>
            <th className="py-2 px-3 text-center font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sales.length > 0 ? sales.map((sale) => {
            const cliente = customers && customers.length > 0 ? customers.find(c => c.id === sale.clienteId) : null;
            return (
              <tr key={sale.id}>
                <td className="py-2 px-3">{sale.fecha}</td>
                <td className="py-2 px-3">{sale.numeroVenta}</td>
                <td className="py-2 px-3">{cliente ? `${cliente.firstName} ${cliente.lastName}` : "-"}</td>
                <td className="py-2 px-3">{formatPrice(sale.valor)}</td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${sale.estado === 'Completado' ? ' text-green-800' : ' text-red-500'}`}>{sale.estado}</span>
                </td>
                <td className="py-4 px-4 text-sm font-medium text-center">
                  <div className="py-2 px-3 text-center">
                    <button className="text-primary hover:text-blue-700 mr-2 text-lg" title="Ver detalle" onClick={() => onView(sale)}>
                      <i className="bi bi-eye"></i>
                    </button>
                    {sale.estado !== 'Cancelada' && (
                      <button className="text-red-600 hover:text-red-800 mr-2 text-lg" title="Cancelar" onClick={() => onAnnul(sale.id)}>
                        <i className="bi bi-x-octagon"></i>
                      </button>
                    )}
                    <button className="text-red-500 hover:text-red-700 text-lg" title="Descargar factura" onClick={() => onDownload(sale)}>
                      <i className="bi bi-file-earmark-pdf"></i>
                    </button>
                  </div>
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan="6" className="text-center py-4 text-gray-500">No hay ventas para mostrar.</td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Paginador */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded-l disabled:opacity-50">Anterior</button>
          <span className="px-4 py-1 border-t border-b">Página {currentPage} de {totalPages}</span>
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-r disabled:opacity-50">Siguiente</button>
        </div>
      )}
    </div>
  );
}

SalesTable.propTypes = {
  sales: PropTypes.array.isRequired,
  customers: PropTypes.array,
  onView: PropTypes.func.isRequired,
  onAnnul: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};
