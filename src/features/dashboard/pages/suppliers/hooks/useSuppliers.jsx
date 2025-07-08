import { useState, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

const initialSuppliers = [
  {
    id: 1,
    nombre: "Distribuidora Capilar S.A.",
    contacto: "María López",
    direccion: "Av. Reforma 123, CDMX",
    telefono: "555-123-4567",
    correo: "contacto@capilarsa.com",
    isActive: true,
  },
  {
    id: 2,
    nombre: "Proveedora Belleza MX",
    contacto: "Juan Pérez",
    direccion: "Calle 5 de Mayo 456, Puebla",
    telefono: "222-987-6543",
    correo: "ventas@bellezamx.com",
    isActive: true,
  },
  {
    id: 3,
    nombre: "Suministros Estética",
    contacto: "Ana Torres",
    direccion: "Blvd. Estética 789, GDL",
    telefono: "333-555-7890",
    correo: "info@suministrosestetica.com",
    isActive: false,
  },
  {
    id: 4,
    nombre: "Cabello Natural Importaciones",
    contacto: "Luis Ramírez",
    direccion: "Calle Comercio 100, Monterrey",
    telefono: "818-123-4567",
    correo: "ventas@cabellonatural.com",
    isActive: true,
  },
];

const SuppliersContext = createContext();

export function SuppliersProvider({ children }) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);

  const addSupplier = (supplier) => {
    const newSupplier = {
      ...supplier,
      id: Date.now(),
      isActive: true
    };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  const editSupplier = (updatedSupplier) => {
    setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
  };

  const deleteSupplier = (id) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const toggleSupplierStatus = (id) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  return (
    <SuppliersContext.Provider value={{
      suppliers,
      addSupplier,
      editSupplier,
      deleteSupplier,
      toggleSupplierStatus,
      setSuppliers
    }}>
      {children}
    </SuppliersContext.Provider>
  );
}

SuppliersProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useSuppliers() {
  const context = useContext(SuppliersContext);
  if (!context) throw new Error('useSuppliers debe usarse dentro de SuppliersProvider');
  return context;
} 