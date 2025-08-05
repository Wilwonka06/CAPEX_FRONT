import { useState, useEffect, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

const LOCAL_STORAGE_KEY = 'serviceCategories';

const initialServiceCategories = [
  { id: 1, name: "Peluquería", description: "Servicios relacionados con el cuidado y corte de cabello.", isActive: true },
  { id: 2, name: "Uñas", description: "Servicios de manicura, pedicura y decoración de uñas.", isActive: true },
  { id: 3, name: "Bienestar", description: "Masajes, terapias y tratamientos de relajación.", isActive: true },
  { id: 4, name: "Estética", description: "Depilación, tratamientos faciales y corporales.", isActive: true },
  { id: 5, name: "Cuidado Facial", description: "Limpieza, hidratación y tratamientos para el rostro.", isActive: true },
];

const ServiceCategoriesContext = createContext();

export function ServiceCategoriesProvider({ children }) {
  const [categories, setCategories] = useState(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialServiceCategories;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  const addCategory = (category) => {
    const newCategory = {
      ...category,
      id: Date.now(),
      isActive: true
    };
    setCategories(prev => [...prev, newCategory]);
  };
  const editCategory = (updatedCategory) => setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  const deleteCategory = (id) => setCategories(prev => prev.filter(c => c.id !== id));
  const toggleCategoryStatus = (id) => setCategories(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));

  return (
    <ServiceCategoriesContext.Provider value={{
      categories,
      addCategory,
      editCategory,
      deleteCategory,
      toggleCategoryStatus,
      setCategories
    }}>
      {children}
    </ServiceCategoriesContext.Provider>
  );
}

ServiceCategoriesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useServiceCategories() {
  const context = useContext(ServiceCategoriesContext);
  if (!context) throw new Error('useServiceCategories debe usarse dentro de ServiceCategoriesProvider');
  return context;
} 