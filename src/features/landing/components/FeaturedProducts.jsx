import { FaCartPlus } from 'react-icons/fa';
import { useProducts } from '../../dashboard/pages/products/hooks/useProducts';
import { Link } from 'react-router-dom';

const FeaturedProducts = () => {
  const { products } = useProducts();
  const destacados = products.slice(0, 4);

  return (
    <section className="py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-8 text-primary">Productos Destacados</h2>
      <div className="flex flex-wrap justify-center gap-6 mb-8">
        {destacados.map((prod) => (
          <div
            key={prod.id}
            className="bg-primary-dark rounded-2xl shadow-2xl p-6 w-70 flex flex-col items-center transition-transform hover:-translate-y-1 hover:shadow-lg border-2 border-primary"
          >
            <img
              src={prod.fotos && prod.fotos.length > 0 ? prod.fotos[0] : prod.foto}
              alt={prod.nombre}
              className="w-40 h-40 object-cover rounded-xl mb-4 border-4 border-primary shadow-lg"
            />
            <h3 className="font-semibold text-xl text-accent mb-2 text-center">{prod.nombre}</h3>
            <span className="text-primary font-bold text-2xl mb-4 ">${prod.precio.toFixed(2)}</span>
            <button
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-full shadow transition mt-auto border border-primary-dark"
              title="Agregar al carrito"
            >
              <FaCartPlus />
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <Link
          to="/landing/catalogo"
          className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-8 rounded-full text-lg shadow transition border border-primary-dark"
        >
          Ver Catálogo Completo
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProducts; 