import PropTypes from "prop-types";
import TruncatedText from "../../../../../shared/components/TruncatedText";

const CategoryTable = ({ categories, onToggleStatus, onEdit, onDelete, onView }) => {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white font-inter">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50 hover:bg-gray-100">
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">NOMBRE</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">DESCRIPCIÓN</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ESTADO</th>
            <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">ACCIONES</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {categories.map((category) => (
            <tr key={category.id_categoria_producto} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="py-4 px-4 text-xs font-medium text-gray-900">{category.id_categoria_producto}</td>
              <td className="py-4 px-4 text-xs font-medium text-gray-900">
                <TruncatedText
                  text={category.nombre}
                  maxLength={25}
                  maxWidth="max-w-[180px]"
                />
              </td>
              <td className="py-4 px-4 text-xs text-gray-600">
                <TruncatedText
                  text={category.descripcion}
                  maxLength={40}
                  maxWidth="max-w-[250px]"
                />
              </td>
              <td className="py-4 px-4 text-xs">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onToggleStatus(category.id_categoria_producto)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none  ${
                      category.estado === 'activo' ? 'bg-text-main' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        category.estado === 'activo' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category.estado === 'activo'
                        ? ' text-gray-800'
                        : ' text-gray-600 '
                    }`}
                  >
                    {category.estado === 'activo' ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </td>
              <td className="py-4 px-4 text-sm font-medium text-right">
                <div className="flex justify-end space-x-2">
                  <button 
                    className="h-8 w-8 p-0 flex items-center justify-center"
                    onClick={() => onView(category)}
                    title="Ver detalles"
                  >
                    <i className="bi bi-eye text-primary text-lg"></i>
                  </button>
                  <button 
                    className="h-8 w-8 p-0 flex items-center justify-center"
                    onClick={() => onEdit(category)}
                    title="Editar"
                  >
                    <i className="bi bi-pencil-square text-amber-500 text-lg"></i>
                  </button>
                  <button
                    className="h-8 w-8 p-0 flex items-center justify-center"
                    onClick={() => onDelete(category.id_categoria_producto)}
                    title="Eliminar"
                  >
                    <i className="bi bi-trash text-red-500 text-lg"></i>
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

CategoryTable.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id_categoria_producto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      nombre: PropTypes.string.isRequired,
      descripcion: PropTypes.string,
      estado: PropTypes.string.isRequired,
    })
  ).isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
};

export default CategoryTable;