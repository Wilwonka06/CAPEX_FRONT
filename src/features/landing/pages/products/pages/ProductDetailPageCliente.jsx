import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import productsService from '../../../../dashboard/pages/products/API/productsService';
import ProductDetailCliente from '../components/ProductDetailCliente';

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

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-gray-500">
        <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
        <p>El producto que buscas no existe o ha sido eliminado.</p>
      </div>
    );
  }

  return <ProductDetailCliente product={product} recommended={recommended} />;
};

export default ProductDetailPageCliente; 