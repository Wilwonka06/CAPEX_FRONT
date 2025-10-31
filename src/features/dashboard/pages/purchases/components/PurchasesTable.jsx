import PropTypes from "prop-types";
import { formatNumber } from "../../../../../shared/utils/formatters";

export default function PurchasesTable({ purchases, onView, onAnnul, currentPage, totalPages, onPageChange }) {
  // Función para formatear números usando el estándar del proyecto
  const formatPrice = (num) => {
    if (num === null || num === undefined) return '$0';
    return '$' + formatNumber(num);
  };

  return (
    <>
      <table className="min-w-full text-xs">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">ID</th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Fecha Registro</th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Fecha Compra</th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Proveedor</th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Total</th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Estado</th>
            <th className="py-2 px-3 text-center font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {purchases.length > 0 ? purchases.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="py-4 px-4 text-xs font-medium text-gray-900">{p.id || 'N/A'}</td>
              <td className="py-4 px-4 text-xs text-gray-600">{p.fechaRegistro || 'N/A'}</td>
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
              <td className="py-4 px-4 text-sm font-medium text-center">
                <div className="flex justify-center space-x-2">
                  <button className="h-8 w-8 p-0 hover:bg-gray-50 hover:border-blue-300 rounded-md flex items-center justify-center transition-colors" title="Ver detalles" onClick={() => onView(p)}>
                    <i className="bi bi-eye text-primary text-lg"></i>
                  </button>
                  {p.estado !== 'Anulada' && p.estado !== 'Cancelada' && (
                    <button className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300 rounded-md flex items-center justify-center transition-colors" title="Anular" onClick={() => onAnnul(p.id)}>
                      <i className="bi bi-x-octagon text-red-500 text-lg"></i>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="7" className="text-center py-12">
                <i className="bi bi-receipt text-6xl text-gray-300"></i>
                <p className="mt-4 text-gray-500 text-sm">No hay compras registradas.</p>
                <p className="text-xs text-gray-400 mt-1">Las compras aparecerán aquí cuando se registren.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Paginador */}
      {totalPages > 1 && purchases.length > 0 && (
        <div className="flex justify-center mt-4">
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded-l disabled:opacity-50">Anterior</button>
          <span className="px-4 py-1 border-t border-b">Página {currentPage} de {totalPages}</span>
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-r disabled:opacity-50">Siguiente</button>
        </div>
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