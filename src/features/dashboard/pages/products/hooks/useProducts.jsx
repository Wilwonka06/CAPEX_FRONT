import { useState, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

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

const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      fechaRegistro: new Date().toISOString().split("T")[0],
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const editProduct = (updatedProduct) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ProductsContext.Provider value={{
      products,
      addProduct,
      editProduct,
      deleteProduct,
      setProducts
    }}>
      {children}
    </ProductsContext.Provider>
  );
}

ProductsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error('useProducts debe usarse dentro de ProductsProvider');
  return context;
} 