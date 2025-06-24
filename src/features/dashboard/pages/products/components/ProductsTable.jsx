import PropTypes from "prop-types";
import ProductDetail from "./ProductDetail";
import EditProduct from "./EditProduct";
/* import DeleteProduct from "./DeleteProduct"; */
import { useState } from "react";

export default function ProductsTable({ products, onEdit, onDelete, categories = [] }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  /* const [deleteOpen, setDeleteOpen] = useState(false); */

  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditOpen(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    /* setDeleteOpen(true); */
  };

  const handleSaveEdit = (updatedProduct) => {
    if (onEdit) {
      onEdit(updatedProduct);
    }
    setEditOpen(false);
    setSelectedProduct(null);
  };

  /* const handleConfirmDelete = async (productId) => {
    if (onDelete) {
      await onDelete(productId);
    }
    setDeleteOpen(false);
    setSelectedProduct(null);
  }; */

  return (
    <>
      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 hover:bg-gray-100">
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">NOMBRE</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">COLOR</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">STOCK</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">CATEGORÍA</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">PRECIO</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">FECHA</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="py-4 px-4 text-sm font-medium text-gray-900">
                  {product.id}
                </td>
                <td className="py-4 px-4 text-sm font-medium text-gray-900">{product.nombre}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{product.color}</td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.cantidad > 10 
                      ? 'bg-green-100 text-green-800' 
                      : product.cantidad > 0 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {product.cantidad}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">{product.categoria}</td>
                <td className="py-4 px-4 text-sm text-gray-600 font-semibold">${product.precio.toFixed(2)}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{product.fechaRegistro}</td>
                <td className="py-4 px-4 text-sm font-medium text-right">
                  <div className="flex justify-end space-x-2">
                    <button 
                      className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50 hover:border-blue-300 rounded-md flex items-center justify-center transition-colors"
                      onClick={() => handleViewDetail(product)}
                      title="Ver detalles"
                    >
                      <i className="bi bi-eye text-blue-500 text-sm"></i>
                    </button>
                    <button 
                      className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50 hover:border-amber-300 rounded-md flex items-center justify-center transition-colors"
                      onClick={() => handleEdit(product)}
                      title="Editar"
                    >
                      <i className="bi bi-pencil-square text-amber-500 text-sm"></i>
                    </button>
                    <button 
                      className="h-8 w-8 p-0 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-md flex items-center justify-center transition-colors"
                      onClick={() => onDelete(product.id)}
                      title="Eliminar"
                    >
                      <i className="bi bi-trash text-red-500 text-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalles */}
      <ProductDetail
        product={selectedProduct}
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedProduct(null);
        }}
      />

      {/* Modal de Edición */}
      <EditProduct
        product={selectedProduct}
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveEdit}
        categories={categories}
      />

      {/* Modal de Eliminación */}
      {/* <DeleteProduct
        product={selectedProduct}
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedProduct(null);
        }}
        onDelete={handleConfirmDelete}
      /> */}
    </>
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
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  categories: PropTypes.array,
};
