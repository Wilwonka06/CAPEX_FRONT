import { Link, useNavigate } from "react-router-dom";
import cartIcon from "../../../shared/images/cart.png";
import { useCartToast } from "../components/CartToastContext";
import { useCart } from "../components/CartContext";
import productsService from "../../dashboard/pages/products/API/productsService";
import { useState, useEffect } from "react";
import { formatNumber } from "../../../shared/utils/formatters";

const FeaturedProducts = () => {
  const { showCartToast } = useCartToast();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Estados para productos
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar productos destacados
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await productsService.getAll({ limit: 4 }); // Obtener máximo 4 productos destacados
        if (response.success) {
          setProductos(response.data || []);
        } else {
          setError("Error al cargar productos destacados");
        }
      } catch (err) {
        setError("Error al cargar productos destacados");
        console.error("Error loading featured products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  // Estados de carga y error
  if (loading) {
    return (
      <section className="py-16 bg-[#1E1E1E]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-white font-montserrat">
            Productos <span className="text-[#FACC15]">destacados</span>
          </h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FACC15]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-[#1E1E1E]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-white font-montserrat">
            Productos <span className="text-[#FACC15]">destacados</span>
          </h2>
          <div className="text-center text-white">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-20 right-20 w-40 h-40 bg-[#FACC15]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-32 h-32 bg-[#FACC15]/10 rounded-full blur-2xl"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white font-montserrat mb-6">
            Productos <span className="text-[#FACC15]">destacados</span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto font-lato">
            Descubre nuestra selección exclusiva de productos de alta calidad,
            diseñados para realzar tu belleza natural.
          </p>
        </div>

        {/* Grid responsivo de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {productos.slice(0, 4).map((prod, idx) => (
            <div
              key={prod.id}
              className="group relative bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden cursor-pointer w-full"
              onClick={() => navigate(`/landing/productos/${prod.id}`)}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Badge de oferta (opcional) */}
              {prod.precio < 100000 && (
                <div className="absolute top-4 left-4 z-10 bg-[#FACC15] text-[#1E1E1E] px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  ¡Oferta!
                </div>
              )}

              {/* Imagen con overlay */}
              <div className="relative w-full aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={
                    prod.fotos && prod.fotos.length > 0
                      ? prod.fotos[0]
                      : prod.foto || prod.imagen
                  }
                  alt={prod.nombre}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Overlay al hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Botón de agregar al carrito */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(prod, 1);
                    showCartToast(prod);
                  }}
                  className="absolute bottom-4 right-4 bg-[#FACC15] text-[#1E1E1E] rounded-full p-3 shadow-lg hover:bg-yellow-400 transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                  title="Agregar al carrito"
                >
                  <img src={cartIcon} alt="Carrito" className="w-5 h-5" />
                </button>
              </div>

              {/* Info del producto */}
              <div className="p-6 flex flex-col gap-3">
                <h3 className="font-bold text-lg text-[#1E1E1E] group-hover:text-[#FACC15] transition-colors duration-300 line-clamp-2 font-nunito leading-tight">
                  {prod.nombre}
                </h3>

                {prod.descripcion && (
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {prod.descripcion}
                  </p>
                )}

                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-bold text-[#FACC15] font-montserrat">
                    ${formatNumber(prod.precio)}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {prod.categoria || "General"}
                  </span>
                </div>
              </div>

              {/* Elemento decorativo */}
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-[#FACC15]/10 rounded-full blur-lg group-hover:bg-[#FACC15]/20 transition-colors duration-500"></div>
            </div>
          ))}
        </div>

        {/* Botón ver todos los productos - responsivo */}
        <div className="flex justify-center mt-8 sm:mt-12 md:mt-16 px-4">
          <Link to="/landing/catalogo" className="w-full sm:w-auto">
            <button className="group relative px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-transparent border-2 border-[#FACC15] text-[#FACC15] font-bold rounded-full shadow-lg hover:shadow-[#FACC15]/50 transition-all duration-300 transform hover:scale-105 font-poppins overflow-hidden w-full sm:w-auto text-sm sm:text-base">
              <span className="relative">Ver todos los productos</span>
              <div className="absolute inset-0 bg-[#FACC15] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-[#FACC15] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-[#1E1E1E] font-bold">
                  Explorar Catálogo
                </span>
              </div>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
