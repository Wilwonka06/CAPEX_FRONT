import React, { useState } from "react";
import CategoryTable from "./components/CategoryTable";
import SearchCategory from "./components/SearchCategory";
import Paginator from "./components/Paginator";
import CreateCategory from "./components/CreateCategory";

const categories = [
  {
    id: 1,
    name: "Electrónicos",
    description: "Dispositivos electrónicos y gadgets tecnológicos",
    status: "active",
  },
  {
    id: 2,
    name: "Ropa y Accesorios",
    description: "Prendas de vestir y complementos de moda",
    status: "active",
  },
  {
    id: 3,
    name: "Hogar y Jardín",
    description: "Artículos para el hogar y jardinería",
    status: "inactive",
  },
  {
    id: 4,
    name: "Deportes",
    description: "Equipamiento deportivo y actividades físicas",
    status: "active",
  },
  {
    id: 5,
    name: "Libros",
    description: "Literatura, educación y material de lectura",
    status: "inactive",
  },
];

const CatProductsPage = () => {
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

  // Filtrar categorías según término de búsqueda
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación simple
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestión de Categorías
        </h1>
        
      </div>
      
      <p className="text-gray-600 mb-6">Administra las categorías de productos de tu tienda</p>
      
      {/* Barra de búsqueda y botón de crear */}
      <div className="flex justify-between items-center mb-6">
        <SearchCategory searchTerm={searchTerm} handleSearch={handleSearch} />
        <CreateCategory />
      </div>
     
     
      
      {/* Tabla de categorías */}
      <CategoryTable categories={paginatedCategories} />
      
      {/* Paginación */}
      {totalPages > 1 && (
        <Paginator 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
        />
      )}
      
      {/* Mostrar información de paginación */}
      <div className="text-sm text-gray-500 mt-4 text-center">
        Mostrando {Math.min(filteredCategories.length, startIndex + 1)} a {Math.min(filteredCategories.length, startIndex + itemsPerPage)} de {filteredCategories.length} categorías
      </div>
    </div>
  );
};

export default CatProductsPage;
