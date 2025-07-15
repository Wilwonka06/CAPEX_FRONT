import { useState, createContext, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

const defaultPhoto = "https://placehold.co/80x80/EEE/31343C?text=Producto";
const initialProducts = [
  {
    id: 1,
    nombre: "Extensión Lacia Natural",
    descripcion: "Extensión de cabello natural, textura lisa, color castaño oscuro.",
    precio: 350.00,
    cantidad: 1,
    categoria: "Extensiones",
    tipoProducto: "Extensiones",
    piezaUnica: true,
    foto: defaultPhoto,
    fechaRegistro: "2024-06-01",
    especificaciones: [
      { concepto: "Textura", valor: "Liso" },
      { concepto: "Largo", valor: "18 cm" },
      { concepto: "Origen", valor: "Natural" },
      { concepto: "Color", valor: "Castaño Oscuro" }
    ]
  },
  {
    id: 2,
    nombre: "Shampoo Nutritivo",
    descripcion: "Shampoo para cabello seco, nutre y fortalece desde la raíz.",
    precio: 120.00,
    cantidad: 40,
    categoria: "Shampoo",
    tipoProducto: "Cuidado Capilar",
    foto: defaultPhoto,
    fechaRegistro: "2024-06-01",
    especificaciones: [
      { concepto: "Volumen", valor: "520 ml" },
      { concepto: "Tipo de Cabello Ideal", valor: "Seco" },
      { concepto: "Fragancia", valor: "Frutal" }
    ]
  },
  {
    id: 3,
    nombre: "Acondicionador Suavizante",
    descripcion: "Acondicionador que deja el cabello suave y manejable.",
    precio: 95.00,
    cantidad: 35,
    categoria: "Acondicionador",
    tipoProducto: "Cuidado Capilar",
    foto: defaultPhoto,
    fechaRegistro: "2024-05-20",
    especificaciones: [
      { concepto: "Volumen", valor: "380 ml" },
      { concepto: "Tipo de Cabello Ideal", valor: "Normal" },
      { concepto: "Fragancia", valor: "Floral" }
    ]
  },
  {
    id: 4,
    nombre: "Mascarilla Reparadora",
    descripcion: "Mascarilla intensiva para reparar puntas abiertas y daño químico.",
    precio: 150.00,
    cantidad: 20,
    categoria: "Mascarilla",
    tipoProducto: "Cuidado Capilar",
    foto: defaultPhoto,
    fechaRegistro: "2024-04-15",
    especificaciones: [
      { concepto: "Volumen", valor: "250 ml" },
      { concepto: "Textura", valor: "Cremosa" }
    ]
  },
  {
    id: 5,
    nombre: "Gel Fijador Extra Fuerte",
    descripcion: "Gel para peinar con fijación extrema y sin residuos.",
    precio: 60.00,
    cantidad: 60,
    categoria: "Gel y Estilizado",
    tipoProducto: "Cuidado Capilar",
    foto: defaultPhoto,
    fechaRegistro: "2024-03-10",
    especificaciones: [
      { concepto: "Volumen", valor: "210 ml" },
      { concepto: "Fijación", valor: "Extra Fuerte" }
    ]
  },
  {
    id: 6,
    nombre: "Aceite de Argán",
    descripcion: "Aceite natural para dar brillo y suavidad al cabello.",
    precio: 180.00,
    cantidad: 15,
    categoria: "Aceites y Sueros",
    tipoProducto: "Cuidado Capilar",
    foto: defaultPhoto,
    fechaRegistro: "2024-02-05",
    especificaciones: [
      { concepto: "Volumen", valor: "150 ml" },
      { concepto: "Origen", valor: "Natural" }
    ]
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