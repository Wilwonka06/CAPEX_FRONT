import PropTypes from "prop-types";
import TruncatedText from "../../../../../shared/components/TruncatedText";
import TableSkeleton from "../../../../../shared/components/TableSkeleton";
import { formatNumber } from "../../../../../shared/utils/formatters";

const ServicesTable = ({ 
  services, 
  onToggleStatus, 
  onView, 
  onEdit, 
  onDelete, 
  loading = false,
  togglingId = null 
}) => {
  if (loading) {
    return <TableSkeleton columns={6} rows={5} hasAvatar={false} hasActions={true} />;
  }

  if (!loading && (!services || services.length === 0)) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white font-inter">
        <div className="py-12 text-center">
          <i className="bi bi-scissors text-6xl text-gray-300"></i>
          <p className="mt-4 text-gray-500 text-sm">No hay servicios registrados.</p>
          <p className="text-xs text-gray-400 mt-1">Los servicios aparecerán aquí cuando se registren.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white font-inter">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="bg-gray-50 hover:bg-gray-100">
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Nombre</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Categoría</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Duración</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Precio</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Estado</th>
            <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {services.map((service) => {
            const isActive = service.estado === "Activo";
            const isToggling = togglingId === service.id;
            
            return (
              <tr key={service.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="py-4 px-4 text-xs font-medium text-gray-900">
                  <TruncatedText
                    text={service.nombre}
                    maxLength={25}
                    maxWidth="max-w-[180px]"
                  />
                </td>
                <td className="py-4 px-4 text-xs text-gray-600">
                  <TruncatedText
                    text={service.categoria?.nombre || service.categoria || 'Sin categoría'}
                    maxLength={20}
                    maxWidth="max-w-[120px]"
                  />
                </td>
                <td className="py-4 px-4 text-xs text-gray-600">{service.duracion} min</td>
                <td className="py-4 px-4 text-xs text-gray-600 font-semibold">
                  ${formatNumber(service.precio || 0)}
                </td>
                <td className="py-4 px-4 text-xs">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onToggleStatus(service.id)}
                      disabled={isToggling}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                        isActive ? 'bg-text-main' : 'bg-gray-300'
                      } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-xs font-semibold rounded-full px-2 py-1
                      ${service.estado === 'Activo' ? 'bg-green-100 text-green-800' : ''}
                      ${service.estado === 'Inactivo' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {isToggling ? 'Cambiando...' : service.estado}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-xs font-medium text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 flex items-center justify-center"
                      onClick={() => onView(service)}
                      title="Ver detalles"
                    >
                      <i className="bi bi-eye text-primary text-[18px]"></i>
                    </button>
                    <button
                      className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 flex items-center justify-center"
                      onClick={() => onEdit(service)}
                      title="Editar"
                    >
                      <i className="bi bi-pencil-square text-amber-500 text-[18px]"></i>
                    </button>
                    <button
                      className="h-8 w-8 p-0 rounded-md hover:bg-red-50 flex items-center justify-center"
                      onClick={() => onDelete(service.id)}
                      title="Eliminar"
                    >
                      <i className="bi bi-trash text-red-500 text-[18px]"></i>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

ServicesTable.propTypes = {
  services: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      nombre: PropTypes.string.isRequired,
      categoria: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      duracion: PropTypes.number,
      precio: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      estado: PropTypes.string,
      foto: PropTypes.string,
    })
  ).isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  togglingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ServicesTable;