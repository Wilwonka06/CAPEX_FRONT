import { Link, useNavigate } from 'react-router-dom';
import cartIcon from '../../../shared/images/cart.png';
import { useCartToast } from '../components/CartToastContext';
import { useCart } from '../components/CartContext';
import productsService from '../../dashboard/pages/products/API/productsService';
import { useState, useEffect } from 'react';

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
        const response = await productsService.getAll({ limit: 8 }); // Obtener 8 productos destacados
        if (response.success) {
          setProductos(response.data || []);
        } else {
          setError('Error al cargar productos destacados');
        }
      } catch (err) {
        setError('Error al cargar productos destacados');
        console.error('Error loading featured products:', err);
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
    <section className="py-16 bg-[#1E1E1E]">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-white font-montserrat">
          Productos <span className="text-[#FACC15]">destacados</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {productos.map((prod) => (
            <div
              key={prod.id}
              className="flex flex-col cursor-pointer group transition-all bg-white rounded-sm shadow-lg overflow-hidden"
              onClick={() => navigate(`/landing/productos/${prod.id}`)}
            >
              <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={prod.fotos && prod.fotos.length > 0 ? prod.fotos[0] : (prod.foto || prod.imagen)}
                  alt={prod.nombre}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
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