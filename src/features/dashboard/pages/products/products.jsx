import { useState, useEffect } from "react";
import ProductsTable from "./components/ProductsTable";
import SearchProduct from '../../../../shared/Search';
import CreateProduct from "./components/CreateProduct";
import CharacteristicsManager from "./components/CharacteristicsManager";
import ConfirmDeleteModal from '../../../../shared/components/ConfirmDeleteModal';
import productsService from "./API/productsService";
import suppliersService from "../suppliers/API/suppliersService";
import { useOutletContext } from 'react-router-dom';
import { executeWithToast, showError } from '../../../../shared/utils/toastHelpers';

const ProductsPage = () => {
  // Estados para productos
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isCharacteristicsManagerOpen, setIsCharacteristicsManagerOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { setTitle } = useOutletContext();
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");

  // Función para cargar productos
  const loadProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      // Cargar todos los productos (sin parámetros de paginación)
      const response = await productsService.getAll();

      if (response.success) {
        setProducts(response.data || []);
      } else {
        throw new Error(response.message || 'Error al obtener productos');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos inicialmente
  useEffect(() => {
    loadProducts();
    (async () => {
      try {
        const resp = await suppliersService.getActive();
        if (resp.success) setSuppliers(resp.data || []);
      } catch (e) {
        try {
          const resp2 = await suppliersService.getAll({ limit: 100 });
          if (resp2.success) setSuppliers(resp2.data || []);
        } catch {}
      }
    })();
  }, []);

  useEffect(() => {
    setTitle('Módulo de Productos');
    return () => setTitle('');
  }, [setTitle]);

  // Filtrar productos localmente
  const filteredProducts = products.filter(product => {
    if (searchTerm && !product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !product.codigo?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedSupplier && product.id_proveedor !== selectedSupplier) {
      return false;
    }
    return true;
  });

  // Función para crear producto
  const createProduct = async (productData) => {
    setLoading(true);
    setError(null);

    try {
      await executeWithToast({
        promiseFn: async () => {
          console.log('ProductsPage: Creating product with data:', productData);
          const response = await productsService.create(productData);

          if (response.success) {
            // Resetear a primera página y limpiar búsqueda para que el nuevo producto sea visible
            await loadProducts();
            return response.data;
          } else {
            throw new Error(response.message || 'Error al crear producto');
          }
        },
        operation: 'create',
        entity: 'producto',
        loadingMessage: 'Creando producto...',
        successMessage: 'Producto creado exitosamente',
      });
    } catch (err) {
      setError(err.message || 'Error al crear producto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar producto
  const updateProduct = async (id, productData) => {
    setLoading(true);
    setError(null);

    try {
      await executeWithToast({
        promiseFn: async () => {
          console.log('ProductsPage: Updating product', id, 'with data:', productData);
          const response = await productsService.update(id, productData);

          if (response.success) {
            await loadProducts();
            return response.data;
          } else {
            throw new Error(response.message || 'Error al actualizar producto');
          }
        },
        operation: 'update',
        entity: 'producto',
        id,
        loadingMessage: 'Actualizando producto...',
        successMessage: 'Producto actualizado exitosamente',
      });
    } catch (err) {
      setError(err.message || 'Error al actualizar producto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar producto
  const deleteProduct = async (id) => {
    setLoading(true);
    setError(null);

    try {
      await executeWithToast({
        promiseFn: async () => {
          const response = await productsService.delete(id);

          if (response.success) {
            await loadProducts();
            return true;
          } else {
            throw new Error(response.message || 'Error al eliminar producto');
          }
        },
        operation: 'delete',
        entity: 'producto',
        id,
        loadingMessage: 'Eliminando producto...',
        successMessage: 'Producto eliminado exitosamente',
      });
    } catch (err) {
      setError(err.message || 'Error al eliminar producto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar página
  // Función para manejar la búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Función para crear un nuevo producto
  const handleCreateProduct = async (newProduct) => {
    try {
      await createProduct(newProduct);
      // La lista se recarga automáticamente en createProduct
    } catch (error) {
      // El error ya se maneja en la función createProduct
      console.error('Error creating product:', error);
      // Re-lanzar el error para que CreateProduct pueda manejarlo si es necesario
      throw error;
    }
  };

  // Función para editar un producto (sin confirmación, para usar desde EditProduct)
  const handleEditProduct = async (id, productData) => {
    try {
      await updateProduct(id, productData);
      // La lista se recarga automáticamente en updateProduct
    } catch (error) {
      // El error ya se maneja en la función updateProduct
      console.error('Error updating product:', error);
      // Re-lanzar el error para que EditProduct pueda manejarlo si es necesario
      throw error;
    }
  };

  // Handler para eliminar producto - muestra modal primero
  const handleDeleteProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setPendingDelete({ id: productId, product });
      setShowDeleteModal(true);
    }
  };

  // Handler para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    setDeletingId(pendingDelete.id);
    try {
      await deleteProduct(pendingDelete.id);
      setShowDeleteModal(false);
      setPendingDelete(null);
    } catch (error) {
      // El error ya se maneja en la función
      console.error('Error deleting product:', error);
    } finally {
      setDeletingId(null);
    }
  };


  // Estado de carga inicial
  const isInitialLoading = loading && products.length === 0;
  const hasError = error && products.length === 0;

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Header con gradiente */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchProduct searchTerm={searchTerm} handleSearch={handleSearch} />
              <div className="flex gap-2">
                <button
                  onClick={() => setIsCharacteristicsManagerOpen(true)}
                  className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center"
                  title="Gestionar características técnicas"
                >
                  <i className="bi bi-gear mr-2"></i>
                  Características
                </button>
                <CreateProduct onCreate={handleCreateProduct} products={products} />
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
              {hasError && !isInitialLoading ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="bi bi-exclamation-triangle text-red-400"></i>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error al cargar productos</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                      <button
                        onClick={() => loadProducts()}
                        className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                      >
                        Reintentar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <ProductsTable
                  products={filteredProducts}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  loading={isInitialLoading}
                />
              )}
            </div>

          </div>
        </div>
      </div>
      <CharacteristicsManager 
        isOpen={isCharacteristicsManagerOpen} 
        onClose={() => setIsCharacteristicsManagerOpen(false)} 
      />

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && pendingDelete && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            if (!deletingId) {
              setShowDeleteModal(false);
              setPendingDelete(null);
            }
          }}
          onConfirm={handleConfirmDelete}
          itemName={pendingDelete.product.nombre}
          entityType="producto"
          loading={deletingId === pendingDelete.id}
        />
      )}
    </div>
  );
};

export default ProductsPage;
