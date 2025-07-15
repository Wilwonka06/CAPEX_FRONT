import { useState } from "react";
import ProductsTable from "./components/ProductsTable";
import SearchProduct from '../../../../shared/Search';
import Paginator from '../../../../shared/Paginator';
import CreateProduct from "./components/CreateProduct";
import { useProducts } from "./hooks/useProducts";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

const ProductsPage = () => {
  const { products, addProduct, editProduct, deleteProduct } = useProducts();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Función para manejar el cambio de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Función para manejar la búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  // Filtrar productos según término de búsqueda
  const filteredProducts = products.filter(
    (product) =>
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.cantidad.toString().includes(searchTerm) ||
      product.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.precio.toString().includes(searchTerm) ||
      product.fechaRegistro.includes(searchTerm)
  );

  // Función para crear un nuevo producto
  const handleCreateProduct = (newProduct) => {
    try {
    addProduct(newProduct);
      toast.success('Producto creado exitosamente', { position: 'top-right' });
    } catch (error) {
      toast.error('Error al crear el producto', { position: 'top-right' });
    }
  };

  // Función para editar un producto con confirmación
  const handleEditProduct = async (updatedProduct) => {
    const result = await Swal.fire({
      title: '¿Confirmar edición?',
      text: `¿Estás seguro de que deseas editar el producto "${updatedProduct.nombre}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
    editProduct(updatedProduct);
        toast.success('Producto actualizado exitosamente', { position: 'top-right' });
      } catch (error) {
        toast.error('Error al actualizar el producto', { position: 'top-right' });
      }
    }
  };

  // Función para eliminar un producto con confirmación
  const handleDeleteProduct = async (productId) => {
    const product = products.find(p => p.id === productId);
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar el producto "${product?.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
    deleteProduct(productId);
        toast.success('Producto eliminado exitosamente', { position: 'top-right' });
      } catch (error) {
        toast.error('Error al eliminar el producto', { position: 'top-right' });
      }
    }
  };

  // Paginación simple
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Header con gradiente */}
          <div className="p-6">
            <h1 className="text-2xl font-bold">Gestión de Productos</h1>
          </div>
          
          <div className="p-6">
            {/* Barra de búsqueda y botón de crear */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchProduct searchTerm={searchTerm} handleSearch={handleSearch} />
              <CreateProduct onCreate={handleCreateProduct} products={products} />
            </div>

            {/* Tabla de productos */}
            <ProductsTable 
              products={paginatedProducts}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />

            {/* Paginación */}
            {totalPages > 1 && (
              <Paginator 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            )}

            {/* Mostrar información de paginación */}
            <div className="mt-4 text-center">
              {/* <p className="text-sm text-gray-600">
                Mostrando {Math.min(filteredProducts.length, startIndex + 1)} a {Math.min(filteredProducts.length, startIndex + itemsPerPage)} de {filteredProducts.length} productos.
              </p> */}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ProductsPage;
