import PropTypes from "prop-types";
import ProductDetail from "./ProductDetail";
import EditProduct from "./EditProduct";
/* import DeleteProduct from "./DeleteProduct"; */
import { useState } from "react";
import TruncatedText from "../../../../../shared/components/TruncatedText";
import { formatNumber } from "../../../../../shared/utils/formatters";
import TableSkeleton from "../../../../../shared/components/TableSkeleton";

// Imagen por defecto para productos sin imagen (similar a usuarios)
const getDefaultProductImage = (productName = "Product") => {
  const name = encodeURIComponent(productName || "Product");
  return `https://ui-avatars.com/api/?name=${name}&background=9C5B2B&color=fff&size=128&bold=true`;
};

export default function ProductsTable({ products, onEdit, onDelete, loading = false }) {
  if (loading) {
    return <TableSkeleton columns={6} rows={5} hasAvatar={false} hasActions={true} />;
  }
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

  const handleSaveEdit = async (id, productData) => {
    if (onEdit) {
      try {
        await onEdit(id, productData);
        // El modal se cierra automáticamente en EditProduct después de una actualización exitosa
        // mediante handleClose() que llama a externalOnClose()
      } catch (error) {
        // El error ya se maneja en handleEditProduct y EditProduct
        // El modal permanecerá abierto para mostrar el error
        console.error('Error in handleSaveEdit:', error);
        throw error; // Re-lanzar para que EditProduct lo maneje
      }
    }
  };

  // Función para formatear precio usando el estándar del proyecto
  const formatPrice = (price) => {
    return formatNumber(price);
  };

  /* const handleConfirmDelete = async (productId) => {
    if (onDelete) {
      await onDelete(productId);
    }
    setDeleteOpen(false);
    setSelectedProduct(null);
  }; */

  if (!loading && (!products || products.length === 0)) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white font-inter">
        <div className="py-12 text-center">
          <i className="bi bi-box-seam text-6xl text-gray-300"></i>
          <p className="mt-4 text-gray-500 text-sm">No hay productos registrados.</p>
          <p className="text-xs text-gray-400 mt-1">Los productos aparecerán aquí cuando se registren.</p>
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
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Foto</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Nombre</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Categoría</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Stock</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Precio</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Margen</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product, index) => (
              <tr
                key={product.id_producto || product.id || `product-${index}`}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <img
                      src={
                        (product.fotos && product.fotos.length > 0 && product.fotos[0])
                          ? product.fotos[0]
                          : (product.foto || getDefaultProductImage(product.nombre))
                      }
                      alt={product.nombre}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = getDefaultProductImage(product.nombre);
                      }}
                    />
                  </div>
                </td>
                <td className="py-4 px-4 text-xs font-medium text-gray-900">
                  <TruncatedText
                    text={product.nombre}
                    maxLength={25}
                    maxWidth="max-w-[180px]"
                  />
                </td>
                <td className="py-4 px-4 text-xs text-gray-600">
                  <TruncatedText
                    text={product.categoria || "Sin categoría"}
                    maxLength={20}
                    maxWidth="max-w-[120px]"
                  />
                </td>
                <td className="py-4 px-4 text-xs text-gray-600">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (product.stock || product.cantidad || 0) > 10
                        ? " text-green-800"
                        : (product.stock || product.cantidad || 0) > 0
                        ? " text-yellow-800"
                        : " text-red-800"
                    }`}
                  >
                    {formatNumber(product.stock || product.cantidad || 0)}
                  </span>
                </td>
                <td className="py-4 px-4 text-xs text-gray-600 font-semibold">
                  ${formatPrice(product.precio_venta || product.precio || 0)}
                </td>
                <td className="py-4 px-4 text-xs text-gray-600">
                  {(() => {
                    const costo = parseFloat(product.costo || 0);
                    const precio = parseFloat(product.precio_venta || product.precio || 0);
                    const margen = precio - costo;
                    const pct = costo > 0 ? ((margen / costo) * 100).toFixed(2) : '0.00';
                    return (
                      <span className={`inline-block px-2 py-1 rounded-full ${margen >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        ${formatPrice(margen)} ({pct}%)
                      </span>
                    );
                  })()}
                </td>
                <td className="py-4 px-4 text-xs font-medium text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md flex items-center justify-center transition-colors"
                      onClick={() => handleViewDetail(product)}
                      title="Ver detalles"
                    >
                      <i className="bi bi-eye text-primary text-[18px]"></i>
                    </button>
                        <button
                          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md flex items-center justify-center transition-colors"
                          onClick={() => handleEdit(product)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil-square text-amber-500 text-[18px]"></i>
                        </button>
                        <button
                          className="h-8 w-8 p-0 hover:bg-red-50 rounded-md flex items-center justify-center transition-colors"
                          onClick={() =>
                            onDelete(product.id_producto || product.id)
                          }
                          title="Eliminar"
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
        onUpdate={handleSaveEdit}
        products={products}
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
      id_producto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      nombre: PropTypes.string,
      descripcion: PropTypes.string,
      cantidad: PropTypes.number,
      stock: PropTypes.number,
      categoria: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      precio: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      precio_venta: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      fechaRegistro: PropTypes.string,
      fecha_registro: PropTypes.string,
      foto: PropTypes.string,
      fotos: PropTypes.array,
      url_foto: PropTypes.string,
      caracteristicas: PropTypes.array,
    })
  ).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};
