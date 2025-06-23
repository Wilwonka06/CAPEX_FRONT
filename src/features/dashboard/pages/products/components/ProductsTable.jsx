import PropTypes from "prop-types";

export default function ProductsTable({ products }) {
    return (
        <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 hover:bg-gray-100">
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">FOTO</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">NOMBRE</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">DESCRIPCIÓN</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">TIPO</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">COLOR</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">STOCK</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">CATEGORÍA</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">PRECIO</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">FECHA REGISTRO</th>
                <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">
                    <img src={product.foto} alt={product.nombre} className="w-12 h-12 object-cover rounded" />
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{product.nombre}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{product.descripcion}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{product.tipoProducto}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{product.color}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{product.cantidad}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{product.categoria}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">${product.precio.toFixed(2)}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{product.fechaRegistro}</td>
                  <td className="py-4 px-4 text-sm font-medium text-right">
                    <div className="flex justify-end space-x-2">
                      <button className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50 hover:border-amber-300 rounded-md flex items-center justify-center transition-colors">
                        <i className="bi bi-eye text-amber-500 text-sm"></i>
                      </button>
                      <button className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50 hover:border-amber-300 rounded-md flex items-center justify-center transition-colors">
                        <i className="bi bi-pencil-square text-amber-500 text-sm"></i>
                      </button>
                      <button className="h-8 w-8 p-0 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-md flex items-center justify-center transition-colors">
                        <i className="bi bi-trash text-red-500 text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
}

ProductsTable.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      nombre: PropTypes.string.isRequired,
      descripcion: PropTypes.string.isRequired,
      tipoProducto: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      cantidad: PropTypes.number.isRequired,
      categoria: PropTypes.string.isRequired,
      precio: PropTypes.number.isRequired,
      fechaRegistro: PropTypes.string.isRequired,
      foto: PropTypes.string.isRequired,
    })
  ).isRequired,
};
