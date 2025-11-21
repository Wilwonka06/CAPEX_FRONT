import { useState, useEffect } from "react";
import ProductsTable from "./components/ProductsTable";
import SearchProduct from '../../../../shared/Search';
import Paginator from '../../../../shared/Paginator';
import CreateProduct from "./components/CreateProduct";
import CharacteristicsManager from "./components/CharacteristicsManager";
import productsService from "./API/productsService";
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';

const ProductsPage = () => {
  // Estados para productos
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isCharacteristicsManagerOpen, setIsCharacteristicsManagerOpen] = useState(false);
  const { setTitle } = useOutletContext();

  // Función para cargar productos
  const loadProducts = async (params = queryParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productsService.getAll(params);

      if (response.success) {
        setProducts(response.data || []);
        setPagination({
          currentPage: response.pagination?.currentPage || 1,
          totalPages: response.pagination?.totalPages || 1,
          totalItems: response.pagination?.totalItems || 0,
          itemsPerPage: response.pagination?.itemsPerPage || 10,
        });
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
  }, []);

  useEffect(() => {
    setTitle('Gestión de Productos');
    return () => setTitle('');
  }, [setTitle]);

  // Función para buscar productos
  const searchProducts = async (searchTerm, filters = {}) => {
    const searchParams = {
      ...queryParams,
      search: searchTerm,
      page: 1, // Resetear a primera página
      ...filters,
    };

    setQueryParams(searchParams);
    await loadProducts(searchParams);
  };

  // Función para limpiar filtros
  const clearFilters = async () => {
    const newParams = { page: 1, limit: queryParams.limit };
    setQueryParams(newParams);
    await loadProducts(newParams);
  };

  // En products.jsx, reemplaza las funciones createProduct, updateProduct (líneas 83-129)

  // Función para crear producto - CORREGIDA
  const createProduct = async (productData) => {
    setLoading(true);
    setError(null);

    const productPromise = (async () => {
      console.log('ProductsPage: Creating product with data:', productData);
      const response = await productsService.create(productData);

      if (response.success) {
        // Resetear a primera página y limpiar búsqueda para que el nuevo producto sea visible
        // Si hay filtros activos, el nuevo producto podría no aparecer
        const refreshParams = {
          page: 1,
          limit: queryParams.limit || 10,
          // No incluir 'search' para mostrar todos los productos y que el nuevo sea visible
        };
        setQueryParams(refreshParams);
        await loadProducts(refreshParams);
        return response.data;
      } else {
        throw new Error(response.message || 'Error al crear producto');
      }
    })();

    // Descartar cualquier toast duplicado antes de mostrar el nuevo
    toast.dismiss('create-product');
    
    // Crear toast de loading con ID único
    const loadingToastId = toast.loading('Creando producto...', { id: 'create-product' });
    
    productPromise
      .then(() => {
        toast.dismiss(loadingToastId);
        toast.success('Producto creado exitosamente', { id: 'create-product' });
      })
      .catch((err) => {
        toast.dismiss(loadingToastId);
        // Manejar errores de validación del backend
        const errorMessage = err.response?.data?.message || err.message || 'Error al crear el producto';
        const validationErrors = err.response?.data?.errors;

        setError(errorMessage);
        console.error('Error creating product:', err);
        console.error('Validation errors:', validationErrors);

        // Mostrar mensaje de error apropiado
        let finalErrorMessage = errorMessage;
        if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
          finalErrorMessage = validationErrors[0].message || validationErrors[0] || errorMessage;
        }
        toast.error(finalErrorMessage, { id: 'create-product' });
      });

    try {
      return await productPromise;
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar producto - CORREGIDA
  const updateProduct = async (id, productData) => {
    setLoading(true);
    setError(null);

    const productPromise = (async () => {
      console.log('ProductsPage: Updating product', id, 'with data:', productData);
      const response = await productsService.update(id, productData);

      if (response.success) {
        // Recargar la lista ANTES de mostrar el toast para asegurar que los datos estén actualizados
        await loadProducts(queryParams);
        return response.data;
      } else {
        throw new Error(response.message || 'Error al actualizar producto');
      }
    })();

    const updateToastId = `update-product-${id}`;
    toast.dismiss(updateToastId);
    
    const loadingToastId = toast.loading('Actualizando producto...', { id: updateToastId });
    
    productPromise
      .then(() => {
        toast.dismiss(loadingToastId);
        toast.success('Producto actualizado exitosamente', { id: updateToastId });
      })
      .catch((err) => {
        toast.dismiss(loadingToastId);
        const errorMessage = err.response?.data?.message || err.message || 'Error al actualizar el producto';
        const validationErrors = err.response?.data?.errors;

        setError(errorMessage);
        console.error('Error updating product:', err);
        console.error('Validation errors:', validationErrors);

        let finalErrorMessage = errorMessage;
        if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
          finalErrorMessage = validationErrors[0].message || validationErrors[0] || errorMessage;
        }
        toast.error(finalErrorMessage, { id: updateToastId });
      });

    try {
      return await productPromise;
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar producto
  const deleteProduct = async (id) => {
    setLoading(true);
    setError(null);

    const productPromise = (async () => {
      const response = await productsService.delete(id);

      if (response.success) {
        await loadProducts(); // Recargar lista
        return true;
      } else {
        throw new Error(response.message || 'Error al eliminar producto');
      }
    })();

    const deleteToastId = `delete-product-${id}`;
    toast.dismiss(deleteToastId);
    
    const loadingToastId = toast.loading('Eliminando producto...', { id: deleteToastId });
    
    productPromise
      .then(() => {
        toast.dismiss(loadingToastId);
        toast.success('Producto eliminado exitosamente', { id: deleteToastId });
      })
      .catch((err) => {
        toast.dismiss(loadingToastId);
        const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar producto';
        setError(errorMessage);
        toast.error(errorMessage, { id: deleteToastId });
      });

    try {
      return await productPromise;
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar página
  const changePage = async (page) => {
    const newParams = { ...queryParams, page };
    setQueryParams(newParams);
    await loadProducts(newParams);
  };

  // Función para manejar la búsqueda
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim()) {
      searchProducts(term.trim());
    } else {
      clearFilters();
    }
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

  // Función para eliminar un producto con confirmación
  const handleDeleteProduct = async (productId) => {
    const product = products.find(p => p.id === productId);
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar el producto "${product?.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        // El error ya se maneja en la función
        console.error('Error deleting product:', error);
      }
    }
  };

  // Función para cambiar página
  const handlePageChange = (page) => {
    changePage(page);
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
                  products={products}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  loading={isInitialLoading}
                />
              )}
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <Paginator
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}

          </div>
        </div>
      </div>
      <CharacteristicsManager 
        isOpen={isCharacteristicsManagerOpen} 
        onClose={() => setIsCharacteristicsManagerOpen(false)} 
      />
    </div>
  );
};

export default ProductsPage;
