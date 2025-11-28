import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import productsService from '../../../../dashboard/pages/products/API/productsService';
import ProductDetailCliente from '../components/ProductDetailCliente';
import LoadingSpinner from '../../../components/LoadingSpinner';

const ProductDetailPageCliente = () => {
  const { id } = useParams();

  // Estados para producto individual
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para productos recomendados
  const [recommended, setRecommended] = useState([]);

  // Cargar producto individual
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await productsService.getById(id);
        if (response.success) {
          setProduct(response.data);
        } else {
          setError('Producto no encontrado');
        }
      } catch (err) {
        setError('Error al cargar el producto');
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Cargar productos recomendados
  useEffect(() => {
    const loadRecommended = async () => {
      try {
        const response = await productsService.getAll({ limit: 5 });
        if (response.success) {
          const filtered = response.data.filter(p => String(p.id) !== String(id)).slice(0, 4);
          setRecommended(filtered);
        }
      } catch (err) {
        console.error('Error loading recommended products:', err);
      }
    };

    if (id) {
      loadRecommended();
    }
  }, [id]);

  // Mostrar estado de carga mientras se carga el producto
  if (loading) {
    return <LoadingSpinner message="Cargando producto..." subMessage="Estamos preparando los detalles para ti" />;
  }

  // Mostrar error solo si no está cargando y no hay producto
  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-gray-500">
        <div className="mb-6">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-[#1E1E1E]">Producto no encontrado</h2>
        <p className="text-gray-600 mb-6">El producto que buscas no existe o ha sido eliminado.</p>
        <button
          onClick={() => window.location.href = '/landing/catalogo'}
          className="bg-[#FACC15] text-[#1E1E1E] px-6 py-3 rounded-full font-bold hover:bg-yellow-400 transition"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  return <ProductDetailCliente product={product} recommended={recommended} />;
};

export default ProductDetailPageCliente; 