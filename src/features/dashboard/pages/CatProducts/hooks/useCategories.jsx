import { useState, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

const initialCategories = [
  { id: 1, name: "Shampoo", description: "Productos para limpiar y nutrir el cabello.", isActive: true },
  { id: 2, name: "Acondicionador", description: "Productos para suavizar y desenredar el cabello.", isActive: false },
  { id: 3, name: "Mascarilla", description: "Tratamientos intensivos para reparar y fortalecer el cabello.", isActive: true },
  { id: 4, name: "Gel y Estilizado", description: "Productos para peinar y dar forma al cabello.", isActive: true },
  { id: 5, name: "Aceites y Sueros", description: "Aceites y sueros para dar brillo y suavidad al cabello.", isActive: true },
];

const CategoriesContext = createContext();

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState(initialCategories);

  const addCategory = (category) => {
    const newCategory = {
      ...category,
      id: Date.now(), // Generar ID único
      isActive: true  // Por defecto activa
    };
    setCategories(prev => [...prev, newCategory]);
  };
  const editCategory = (updatedCategory) => setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  const deleteCategory = (id) => setCategories(prev => prev.filter(c => c.id !== id));
  const toggleCategoryStatus = (id) => setCategories(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));

  return (
    <CategoriesContext.Provider value={{
      categories,
      addCategory,
      editCategory,
      deleteCategory,
      toggleCategoryStatus,
      setCategories
    }}>
      {children}
    </CategoriesContext.Provider>
  );
}

CategoriesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) throw new Error('useCategories debe usarse dentro de CategoriesProvider');
  return context;
} 