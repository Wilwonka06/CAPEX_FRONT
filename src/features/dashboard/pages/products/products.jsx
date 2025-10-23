import { useState, useEffect } from "react";
import ProductsTable from "./components/ProductsTable";
import SearchProduct from '../../../../shared/Search';
import Paginator from '../../../../shared/Paginator';
import CreateProduct from "./components/CreateProduct";
import productsService from "./API/productsService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

    try {
      console.log('ProductsPage: Creating product with data:', productData);
      const response = await productsService.create(productData);

      if (response.success) {
        toast.success('Producto creado exitosamente');
        await loadProducts(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message || 'Error al crear producto');
      }
    } catch (err) {
      // Manejar errores de validación del backend
      const errorMessage = err.response?.data?.message || err.message;
      const validationErrors = err.response?.data?.errors;

      if (validationErrors && Array.isArray(validationErrors)) {
        // Mostrar cada error de validación
        validationErrors.forEach(error => {
          toast.error(error.message || error);
        });
      } else {
        toast.error(errorMessage);
      }

      setError(errorMessage);
      console.error('Error creating product:', err);
      console.error('Validation errors:', validationErrors);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar producto - CORREGIDA
  const updateProduct = async (id, productData) => {
    setLoading(true);
    setError(null);

    try {
      console.log('ProductsPage: Updating product', id, 'with data:', productData);
      const response = await productsService.update(id, productData);

      if (response.success) {
        toast.success('Producto actualizado exitosamente');
        await loadProducts(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message || 'Error al actualizar producto');
      }
    } catch (err) {
      // Manejar errores de validación del backend
      const errorMessage = err.response?.data?.message || err.message;
      const validationErrors = err.response?.data?.errors;

      if (validationErrors && Array.isArray(validationErrors)) {
        // Mostrar cada error de validación
        validationErrors.forEach(error => {
          toast.error(error.message || error);
        });
      } else {
        toast.error(errorMessage);
      }

      setError(errorMessage);
      console.error('Error updating product:', err);
      console.error('Validation errors:', validationErrors);
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
      const response = await productsService.delete(id);

      if (response.success) {
        toast.success('Producto eliminado exitosamente');
        await loadProducts(); // Recargar lista
        return true;
      } else {
        throw new Error(response.message || 'Error al eliminar producto');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
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
    } catch (error) {
      // El error ya se maneja en la función
      console.error('Error creating product:', error);
    }
  };

  // Función para editar un producto con confirmación
  const handleEditProduct = async (updatedProduct) => {
    const result = await Swal.fire({
      title: '¿Confirmar edición?',
      text: `¿Estás seguro de que deseas editar el producto "${updatedProduct.nombre}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await updateProduct(updatedProduct.id, updatedProduct);
      } catch (error) {
        // El error ya se maneja en la función
        console.error('Error updating product:', error);
      }
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

  // Renderizar estado de carga
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen font-inter">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando productos...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar error
  if (error && products.length === 0) {
    return (
      <div className="min-h-screen font-inter">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="bi bi-exclamation-triangle text-red-400"></i>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error al cargar productos</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Header con gradiente */}
          {/* El título ahora se muestra en el navbar */}
          <div className="p-6">
            {/* Barra de búsqueda y botón de crear */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchProduct searchTerm={searchTerm} handleSearch={handleSearch} />
              <CreateProduct onCreate={handleCreateProduct} products={products} />
            </div>

            {/* Tabla de productos */}
            <ProductsTable
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <Paginator
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}

            {/* Mostrar información de paginación */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} a{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de{' '}
                {pagination.totalItems} productos.
              </p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />

      {/* Indicador de carga durante operaciones */}
      {loading && products.length > 0 && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Procesando...</span>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
