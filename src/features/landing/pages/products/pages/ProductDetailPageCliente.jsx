import { useParams } from 'react-router-dom';
import { useProducts } from '../../../../dashboard/pages/products/hooks/useProducts';
import ProductDetailCliente from '../components/ProductDetailCliente';

const ProductDetailPageCliente = () => {
  const { id } = useParams();
  const { products } = useProducts();
  const product = products.find(p => String(p.id) === String(id));
  const recommended = products.filter(p => String(p.id) !== String(id)).slice(0, 4);

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