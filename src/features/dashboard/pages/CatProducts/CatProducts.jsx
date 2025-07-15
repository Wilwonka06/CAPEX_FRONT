import { useState, useEffect } from "react";
import CategoryTable from "./components/CategoryTable";
import SearchProduct from '../../../../shared/Search';
import Paginator from '../../../../shared/Paginator';
import CreateCategory from "./components/CreateCategory";
import { useCategories } from './hooks/useCategories';
import EditCategory from "./components/EditCategory";
import CategoryDetail from "./components/CategoryDetail";
import ChangeStatus from "./components/ChangeStatus";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

const LOCAL_STORAGE_KEY = 'categorias_productos';
const CATEGORIES_PER_PAGE = 5;

const initialCategories = [
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
  const { categories, setCategories } = useCategories();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar categorías al iniciar
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setCategories(JSON.parse(stored));
    } else {
      setCategories(initialCategories);
    }
    setIsLoaded(true);
  }, []);

  // Guardar categorías en localStorage cuando cambian
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categories));
    }
  }, [categories, isLoaded]);

  // Sincronizar filteredCategories con categories
  useEffect(() => {
    setFilteredCategories(categories);
  }, [categories]);

  // Filtrar categorías por término de búsqueda - BUSQUEDA COMPLETA COMO EN SUPPLIERS
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCategories(categories);
      return;
    }
    const lowerTerm = searchTerm.toLowerCase();
    setFilteredCategories(
      categories.filter(category =>
        (category.id?.toString() || '').toLowerCase().includes(lowerTerm) ||
        (category.name || '').toLowerCase().includes(lowerTerm) ||
        (category.description || '').toLowerCase().includes(lowerTerm) ||
        (category.isActive ? "activo" : "inactivo").includes(lowerTerm)
      )
    );
  }, [searchTerm, categories]);

  // Paginación
  const totalPages = Math.ceil(filteredCategories.length / CATEGORIES_PER_PAGE);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * CATEGORIES_PER_PAGE,
    currentPage * CATEGORIES_PER_PAGE
  );

  // Resetear página al cambiar el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categories]);

  // Acciones CRUD
  const handleCreateCategory = (newCategory) => {
    try {
      setCategories(prev => {
        const updated = [...prev, newCategory];
        toast.success('Categoría creada exitosamente', { position: 'top-right' });
        return updated;
      });
    } catch {
      toast.error('Error al crear la categoría', { position: 'top-right' });
    }
  };

  const handleEditCategory = async (updatedCategory) => {
    const result = await Swal.fire({
      title: '¿Confirmar edición?',
      text: `¿Estás seguro de que deseas editar la categoría "${updatedCategory.name}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
        setShowEditModal(false);
        setSelectedCategory(null);
        toast.success('Categoría actualizada exitosamente', { position: 'top-right' });
      } catch {
        toast.error('Error al actualizar la categoría', { position: 'top-right' });
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar la categoría "${category?.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setCategories(prev => prev.filter(c => c.id !== categoryId));
        toast.success('Categoría eliminada exitosamente', { position: 'top-right' });
      } catch {
        toast.error('Error al eliminar la categoría', { position: 'top-right' });
      }
    }
  };

  const handleToggleStatus = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    const newStatus = category.isActive ? 'Inactivo' : 'Activo';
    
    const result = await Swal.fire({
      title: '¿Confirmar cambio de estado?',
      text: `¿Estás seguro de que deseas cambiar el estado de "${category?.name}" a ${newStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setCategories(prev => prev.map(category =>
          category.id === categoryId
            ? { ...category, isActive: !category.isActive }
            : category
        ));
        toast.success(`Estado cambiado a ${newStatus}`, { position: 'top-right' });
      } catch {
        toast.error('Error al cambiar el estado', { position: 'top-right' });
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const closeModals = () => {
    setShowEditModal(false);
    setShowDetailModal(false);
    setShowStatusModal(false);
    setSelectedCategory(null);
  };

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
              <CreateCategory onCreate={handleCreateCategory} categories={categories} />
            </div>

            {/* Tabla de categorías */}
            <CategoryTable 
              categories={paginatedCategories} 
              onToggleStatus={handleToggleStatus}
              onEdit={(category) => {
                setSelectedCategory(category);
                setShowEditModal(true);
              }}
              onDelete={handleDeleteCategory}
              onView={(category) => {
                setSelectedCategory(category);
                setShowDetailModal(true);
              }}
            />

            {/* Paginación */}
            {totalPages > 1 && (
              <Paginator 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      {showEditModal && selectedCategory && (
        <EditCategory
          category={selectedCategory}
          isOpen={showEditModal}
          onClose={closeModals}
          onSave={handleEditCategory}
          categories={categories}
        />
      )}
      {showDetailModal && selectedCategory && (
        <CategoryDetail
          category={selectedCategory}
          isOpen={showDetailModal}
          onClose={closeModals}
        />
      )}
      {showStatusModal && selectedCategory && (
        <ChangeStatus
          category={selectedCategory}
          isOpen={showStatusModal}
          onClose={closeModals}
          onStatusChange={handleToggleStatus}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default CatProductsPage;
