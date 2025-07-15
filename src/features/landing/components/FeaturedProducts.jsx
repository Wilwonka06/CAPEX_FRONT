import React from 'react';
import { Link } from 'react-router-dom';

const productos = [
  {
    id: 1,
    nombre: "Extensión Lacia Natural",
    descripcion: "Extensión de cabello natural, textura lisa, color castaño oscuro.",
    precio: 350.00,
    categoria: "Extensiones",
    foto: "https://placehold.co/80x80/EEE/31343C?text=Producto",
  },
  {
    id: 2,
    nombre: "Shampoo Nutritivo",
    descripcion: "Shampoo para cabello seco, nutre y fortalece desde la raíz.",
    precio: 120.00,
    categoria: "Shampoo",
    foto: "https://placehold.co/80x80/EEE/31343C?text=Producto",
  },
  {
    id: 3,
    nombre: "Acondicionador Suavizante",
    descripcion: "Acondicionador que deja el cabello suave y manejable.",
    precio: 95.00,
    categoria: "Acondicionador",
    foto: "https://placehold.co/80x80/EEE/31343C?text=Producto",
  },
  {
    id: 4,
    nombre: "Mascarilla Reparadora",
    descripcion: "Mascarilla intensiva para reparar puntas abiertas y daño químico.",
    precio: 150.00,
    categoria: "Mascarilla",
    foto: "https://placehold.co/80x80/EEE/31343C?text=Producto",
  },
];

const FeaturedProducts = () => (
  <section className="py-16 bg-[#1E1E1E]">
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-white">
        Productos <span className="text-[#FACC15]">destacados</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {productos.map((prod) => (
          <div
            key={prod.id}
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-[#FACC15] hover:shadow-2xl transition-all"
          >
            <img
              src={prod.foto}
              alt={prod.nombre}
              className="w-24 h-24 object-cover rounded-full border-4 border-[#FACC15] mb-4 bg-white"
            />
            <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">{prod.nombre}</h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{prod.descripcion}</p>
            <span className="text-xl font-bold text-[#FACC15] mb-2 block">${prod.precio.toLocaleString('es-MX', {minimumFractionDigits:2})}</span>
            <span className="text-xs text-gray-500 mb-4">{prod.categoria}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-10">
        <Link to="/catalogo">
          <button className="bg-[#FACC15] text-[#1E1E1E] font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-yellow-400 transition-all text-lg">
            Ver más productos
          </button>
        </Link>
      </div>
      </div>
    </section>
  );

export default FeaturedProducts; 