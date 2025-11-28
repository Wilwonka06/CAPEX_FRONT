import PropTypes from "prop-types";
import TableSkeleton from "../../../../../shared/components/TableSkeleton";
import { formatPrice } from "../../../../../shared/utils/formatters";

export default function SalesTable({ sales, customers = [], onView, onAnnul, onDownload, currentPage, totalPages, onPageChange, loading = false }) {
  const formatNumber = (num) => formatPrice(num).replace('$','');

  if (loading) {
    return <TableSkeleton columns={5} rows={5} hasAvatar={false} hasActions={true} />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white font-inter">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="bg-gray-50 hover:bg-gray-100">
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Fecha</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Orden</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Cliente</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Valor</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Estado</th>
            <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sales.length > 0 ? sales.map((sale) => {
            const cliente = (customers && customers.length > 0 ? customers.find(c => c.id === sale.clienteId) : null) || sale.customer || null;
            return (
              <tr key={sale.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="py-4 px-4 text-xs text-gray-600">{sale.fecha}</td>
                <td className="py-4 px-4 text-xs text-gray-600">{sale.numeroVenta}</td>
                <td className="py-4 px-4 text-xs text-gray-600">{cliente ? (cliente.nombre || `${cliente.firstName || ''} ${cliente.lastName || ''}`.trim() || '-') : "-"}</td>
                <td className="py-4 px-4 text-xs text-gray-600 font-semibold">{formatPrice(sale.valor)}</td>
                <td className="py-4 px-4 text-xs text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${sale.estado === 'Completado' ? ' text-green-800' : ' text-red-500'}`}>{sale.estado}</span>
                </td>
                <td className="py-4 px-4 text-xs font-medium text-right">
                  <div className="flex justify-end space-x-2">
                    <button className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md flex items-center justify-center transition-colors" title="Ver detalle" onClick={() => onView(sale)}>
                      <i className="bi bi-eye text-primary text-[18px]"></i>
                    </button>
                    {sale.estado !== 'Cancelada' && (
                      <button className="h-8 w-8 p-0 hover:bg-red-50 rounded-md flex items-center justify-center transition-colors" title="Cancelar" onClick={() => onAnnul(sale.id)}>
                        <i className="bi bi-x-octagon text-red-500 text-[18px]"></i>
                      </button>
                    )}
                    <button className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md flex items-center justify-center transition-colors" title="Descargar factura" onClick={() => onDownload(sale)}>
                      <i className="bi bi-file-earmark-pdf text-red-500 text-[18px]"></i>
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
