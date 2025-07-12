import { useState } from "react";
import ProductsTable from "./components/ProductsTable";
import SearchProduct from '../../../../shared/Search';
import Paginator from '../../../../shared/Paginator';
import CreateProduct from "./components/CreateProduct";
import { useProducts } from "./hooks/useProducts";

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
    addProduct(newProduct);
  };

  // Función para editar un producto
  const handleEditProduct = (updatedProduct) => {
    editProduct(updatedProduct);
  };

  // Función para eliminar un producto
  const handleDeleteProduct = (productId) => {
    deleteProduct(productId);
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
    </div>
  );
};

export default ProductsPage;
