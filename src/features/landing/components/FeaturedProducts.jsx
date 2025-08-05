import React from 'react';
import { Link } from 'react-router-dom';
import cartIcon from '../../../shared/images/cart.png';
import { useCartToast } from '../components/CartToastContext';
import { useCart } from '../components/CartContext';

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

const FeaturedProducts = () => {
  const { showCartToast } = useCartToast();
  const { addToCart } = useCart();

  return (
  <section className="py-16 bg-[#1E1E1E]">
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-white font-montserrat">
        Productos <span className="text-[#FACC15]">destacados</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {productos.map((prod) => (
          <div
            key={prod.id}
              className="flex flex-col cursor-pointer group transition-all"
          >
              <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
            <img
              src={prod.foto}
              alt={prod.nombre}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
              </div>
              <div className="p-5 flex flex-col gap-2 flex-1 justify-between">
                <h3 className="font-semibold text-lg text-[#1E1E1E] mb-1 truncate group-hover:text-[#FACC15] transition-colors">{prod.nombre}</h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2 font-lato">{prod.descripcion}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-[#FACC15]">${prod.precio.toLocaleString('es-MX', {minimumFractionDigits:2})}</span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      addToCart(prod, 1);
                      showCartToast(prod);
                    }}
                    className="ml-2 bg-[#FACC15] rounded-full p-2 shadow hover:bg-yellow-400 transition flex items-center justify-center"
                    title="Agregar al carrito"
                  >
                    <img src={cartIcon} alt="Carrito" className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-xs text-gray-500 mb-1 font-lato">{prod.categoria}</span>
              </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-10">
        <Link to="/landing/catalogo">
          <button className="bg-[#FACC15] text-[#1E1E1E] font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-yellow-400 transition-all text-lg font-poppins">
            Ver más productos
          </button>
        </Link>
      </div>
      </div>
    </section>
  );
};

export default FeaturedProducts; 