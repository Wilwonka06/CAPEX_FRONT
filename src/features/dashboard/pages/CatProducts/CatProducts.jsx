import { useState } from "react";
import CategoryTable from "./components/CategoryTable";
import SearchProduct from '../../../../shared/Search';
import Paginator from '../../../../shared/Paginator';
import CreateCategory from "./components/CreateCategory";

export const initialCategories = [
  {
    id: 1,
    name: "Shampoo",
    description: "Productos para limpiar y nutrir el cabello.",
    isActive: true,
  },
  {
    id: 2,
    name: "Acondicionador",
    description: "Productos para suavizar y desenredar el cabello.",
    isActive: false,
  },
  {
    id: 3,
    name: "Mascarilla",
    description: "Tratamientos intensivos para reparar y fortalecer el cabello.",
    isActive: true,
  },
  {
    id: 4,
    name: "Gel y Estilizado",
    description: "Productos para peinar y dar forma al cabello.",
    isActive: true,
  },
  {
    id: 5,
    name: "Aceites y Sueros",
    description: "Aceites y sueros para dar brillo y suavidad al cabello.",
    isActive: true,
  },
];

const CatProductsPage = () => {
  const [categories, setCategories] = useState(initialCategories);
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
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (category.isActive ? 'activo' : 'inactivo').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para cambiar el estado de una categoría
  const toggleCategoryStatus = (id) => {
    setCategories(
      categories.map((category) =>
        category.id === id ? { ...category, isActive: !category.isActive } : category
      )
    );
  };

  // Función para editar una categoría
  const handleEditCategory = (updatedCategory) => {
    setCategories(
      categories.map((category) =>
        category.id === updatedCategory.id ? updatedCategory : category
      )
    );
  };

  // Función para eliminar una categoría
  const handleDeleteCategory = (categoryId) => {
    setCategories(categories.filter((category) => category.id !== categoryId));
  };

  // Paginación simple
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Header con gradiente */}
          <div className=" p-6">
            <h1 className="text-2xl font-bold">Gestión de Categorías de Productos</h1>
          </div>
          
          <div className="p-6">
            {/* Barra de búsqueda y botón de crear */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchProduct searchTerm={searchTerm} handleSearch={handleSearch} placeholder="Buscar categorías..." />
              <CreateCategory 
                categories={categories}
                onCreate={(newCat) => {
                setCategories([
                  ...categories,
                  {
                    id: categories.length ? Math.max(...categories.map(c => c.id)) + 1 : 1,
                    name: newCat.name,
                    description: newCat.description,
                    isActive: true
                  }
                ]);
                }} 
              />
            </div>

            {/* Tabla de categorías */}
            <CategoryTable 
              categories={paginatedCategories} 
              onToggleStatus={toggleCategoryStatus}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
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
                Mostrando {Math.min(filteredCategories.length, startIndex + 1)} a {Math.min(filteredCategories.length, startIndex + itemsPerPage)} de {filteredCategories.length} categorías
              </p> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatProductsPage;
