import { useState } from "react";
import ProductsTable from "./components/ProductsTable";
import SearchProduct from '../../../../shared/Search';
import Paginator from '../../../../shared/Paginator';
import CreateProduct from "./components/CreateProduct";
import { initialCategories as categories } from "../CatProducts/CatProducts";

const initialProducts = [
  {
    id: 1,
    nombre: "Shampoo Nutritivo",
    descripcion: "Shampoo para cabello seco, nutre y fortalece desde la raíz.",
    precio: 120.00,
    cantidad: 40,
    categoria: "Shampoo",
    color: "Transparente",
    fechaRegistro: "2024-06-01",
    foto: "https://via.placeholder.com/80x80.png?text=Shampoo",
  },
  {
    id: 2,
    nombre: "Acondicionador Suavizante",
    descripcion: "Acondicionador que deja el cabello suave y manejable.",
    precio: 95.00,
    cantidad: 35,
    categoria: "Acondicionador",
    color: "Blanco",
    fechaRegistro: "2024-05-20",
    foto: "https://via.placeholder.com/80x80.png?text=Acondicionador",
  },
  {
    id: 3,
    nombre: "Mascarilla Reparadora",
    descripcion: "Mascarilla intensiva para reparar puntas abiertas y daño químico.",
    precio: 150.00,
    cantidad: 20,
    categoria: "Mascarilla",
    color: "Crema",
    fechaRegistro: "2024-04-15",
    foto: "https://via.placeholder.com/80x80.png?text=Mascarilla",
  },
  {
    id: 4,
    nombre: "Gel Fijador Extra Fuerte",
    descripcion: "Gel para peinar con fijación extrema y sin residuos.",
    precio: 60.00,
    cantidad: 60,
    categoria: "Gel y Estilizado",
    color: "Transparente",
    fechaRegistro: "2024-03-10",
    foto: "https://via.placeholder.com/80x80.png?text=Gel",
  },
  {
    id: 5,
    nombre: "Aceite de Argán",
    descripcion: "Aceite natural para dar brillo y suavidad al cabello.",
    precio: 180.00,
    cantidad: 15,
    categoria: "Aceites y Sueros",
    color: "Ámbar",
    fechaRegistro: "2024-02-05",
    foto: "https://via.placeholder.com/80x80.png?text=Aceite",
  },
];

const ProductsPage = () => {
  const [products, setProducts] = useState(initialProducts);
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
    setProducts(prev => [newProduct, ...prev]);
  };

  // Función para editar un producto
  const handleEditProduct = (updatedProduct) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  // Función para eliminar un producto
  const handleDeleteProduct = (productId) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
  };

  // Paginación simple
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen p-6 font-inter">
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
              <CreateProduct onCreate={handleCreateProduct} categories={categories} />
            </div>

            {/* Tabla de productos */}
            <ProductsTable 
              products={paginatedProducts}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              categories={categories}
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
