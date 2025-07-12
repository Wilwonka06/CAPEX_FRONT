import { useState, createContext, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

const initialProducts = [
  {
    id: 1,
    nombre: "Extensión Lacia Natural",
    descripcion: "Extensión de cabello natural, textura lisa, color castaño oscuro.",
    precio: 350.00,
    cantidad: 1,
    categoria: "Extensiones",
    color: "Castaño Oscuro",
    tamanio: 18,
    textura: "Liso",
    origen: "Natural",
    tipoProducto: "Extensiones",
    piezaUnica: true,
    foto: "https://via.placeholder.com/80x80.png?text=Extensión",
    fechaRegistro: "2024-06-01",
  },
  {
    id: 2,
    nombre: "Shampoo Nutritivo",
    descripcion: "Shampoo para cabello seco, nutre y fortalece desde la raíz.",
    precio: 120.00,
    cantidad: 40,
    categoria: "Shampoo",
    color: "Transparente",
    volumen: 520,
    tipoCabelloIdeal: "Seco",
    tipoProducto: "Cuidado Capilar",
    foto: "https://via.placeholder.com/80x80.png?text=Shampoo",
    fechaRegistro: "2024-06-01",
  },
  {
    id: 3,
    nombre: "Acondicionador Suavizante",
    descripcion: "Acondicionador que deja el cabello suave y manejable.",
    precio: 95.00,
    cantidad: 35,
    categoria: "Acondicionador",
    color: "Blanco",
    volumen: 380,
    tipoCabelloIdeal: "Normal",
    tipoProducto: "Cuidado Capilar",
    foto: "https://via.placeholder.com/80x80.png?text=Acondicionador",
    fechaRegistro: "2024-05-20",
  },
  {
    id: 4,
    nombre: "Mascarilla Reparadora",
    descripcion: "Mascarilla intensiva para reparar puntas abiertas y daño químico.",
    precio: 150.00,
    cantidad: 20,
    categoria: "Mascarilla",
    color: "Crema",
    tamanio: 7.5,
    fechaRegistro: "2024-04-15",
    foto: "https://via.placeholder.com/80x80.png?text=Mascarilla",
  },
  {
    id: 5,
    nombre: "Gel Fijador Extra Fuerte",
    descripcion: "Gel para peinar con fijación extrema y sin residuos.",
    precio: 60.00,
    cantidad: 60,
    categoria: "Gel y Estilizado",
    color: "Transparente",
    tamanio: 2.1,
    fechaRegistro: "2024-03-10",
    foto: "https://via.placeholder.com/80x80.png?text=Gel",
  },
  {
    id: 6,
    nombre: "Aceite de Argán",
    descripcion: "Aceite natural para dar brillo y suavidad al cabello.",
    precio: 180.00,
    cantidad: 15,
    categoria: "Aceites y Sueros",
    color: "Ámbar",
    tamanio: 1.5,
    fechaRegistro: "2024-02-05",
    foto: "https://via.placeholder.com/80x80.png?text=Aceite",
  },
];

const ProductsContext = createContext();

// Función para obtener productos del localStorage
const getStoredProducts = () => {
  try {
    const stored = localStorage.getItem('products');
    return stored ? JSON.parse(stored) : initialProducts;
  } catch (error) {
    console.error('Error al cargar productos del localStorage:', error);
    return initialProducts;
  }
};

// Función para guardar productos en localStorage
const saveProductsToStorage = (products) => {
  try {
    localStorage.setItem('products', JSON.stringify(products));
  } catch (error) {
    console.error('Error al guardar productos en localStorage:', error);
  }
};

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(getStoredProducts);

  // Guardar productos en localStorage cada vez que cambien
  useEffect(() => {
    saveProductsToStorage(products);
  }, [products]);

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