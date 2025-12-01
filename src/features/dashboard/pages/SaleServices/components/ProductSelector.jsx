import React, { useState, useEffect, useRef } from "react";
import { apiRequest } from '../../../../../shared/config/apiConfig';
import { formatNumber } from '../../../../../shared/utils/formatters';

const ProductSelector = ({ selectedProducts, onProductsChange }) => {
  const [productQuery, setProductQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProductForQuantity, setSelectedProductForQuantity] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const productInputRef = useRef(null);

  // Cargar productos desde el backend
  useEffect(() => {
    let cancelled = false;
    const fetchWithRetry = async (fn, label, attempts = 3, delayMs = 1000) => {
      let lastErr;
      for (let i = 1; i <= attempts; i++) {
        try { return await fn(); } catch (err) { lastErr = err; if (i < attempts) await new Promise(r => setTimeout(r, delayMs * i)); }
      }
      throw lastErr;
    };
    const cargarProductos = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const productos = await fetchWithRetry(() => apiRequest.get('/productos', { skipGlobalErrorHandling: true }), 'productos');
        let productosArray = Array.isArray(productos) ? productos : (productos.data || productos.productos || productos.results || []);
        if (!Array.isArray(productosArray)) productosArray = [];
        if (!cancelled) setAvailableProducts(productosArray);
      } catch (error) {
        console.error('❌ Error al cargar productos:', error);
        if (!cancelled) setErrorMsg('No se pudieron cargar los productos. Verifica conexión y reintenta.');
        if (!cancelled) setAvailableProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    cargarProductos();
    return () => { cancelled = true; };
  }, []);

  // Función para normalizar un producto del backend
  const normalizarProducto = (producto) => {
    // Extraer nombre de categoría si es un objeto
    let categoriaNombre = 'Sin categoría';
    if (producto.categoria) {
      if (typeof producto.categoria === 'object' && producto.categoria.nombre) {
        categoriaNombre = producto.categoria.nombre;
      } else if (typeof producto.categoria === 'string') {
        categoriaNombre = producto.categoria;
      }
    } else if (producto.category) {
      if (typeof producto.category === 'object' && producto.category.nombre) {
        categoriaNombre = producto.category.nombre;
      } else if (typeof producto.category === 'string') {
        categoriaNombre = producto.category;
      }
    } else if (producto.tipo) {
      categoriaNombre = typeof producto.tipo === 'string' ? producto.tipo : 'Sin categoría';
    }
    
    return {
      id: producto.id_producto || producto.id,
      nombre: producto.nombre || producto.name || producto.producto_nombre || 'Producto sin nombre',
      precio: parseFloat(producto.costo || producto.precio || producto.price || 0),
      categoria: categoriaNombre
    };
  };

  // Buscador en tiempo real
  useEffect(() => {
    if (availableProducts.length > 0) {
      const normalized = availableProducts.map(normalizarProducto);
      if (productQuery.trim() === '') {
        setFilteredProducts(normalized);
      } else {
        setFilteredProducts(
          normalized.filter(p =>
            p.nombre.toLowerCase().includes(productQuery.toLowerCase()) ||
            (p.categoria && p.categoria.toLowerCase().includes(productQuery.toLowerCase()))
          )
        );
      }
    } else {
      setFilteredProducts([]);
    }
  }, [productQuery, availableProducts]);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (productInputRef.current && !productInputRef.current.contains(event.target)) {
        setIsProductDropdownOpen(false);
      }
    };

    if (isProductDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProductDropdownOpen]);

  const cargarProductos = async () => {
    setRetrying(true);
    try {
      const productos = await apiRequest.get('/productos', { skipGlobalErrorHandling: true });
      const productosArray = Array.isArray(productos) ? productos : (productos.data || productos.productos || []);
      setAvailableProducts(Array.isArray(productosArray) ? productosArray : []);
      setErrorMsg('');
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setErrorMsg('No se pudieron cargar los productos. Intenta nuevamente.');
    } finally {
      setRetrying(false);
    }
  };

  const handleProductSelect = (product) => {
    const isAlreadySelected = selectedProducts.some(p => p.id === product.id);
    if (!isAlreadySelected) {
      setSelectedProductForQuantity(product);
      setQuantity(1);
      setShowQuantityModal(true);
      setProductQuery('');
      setIsProductDropdownOpen(false);
    }
  };

  const confirmProductSelection = () => {
    if (selectedProductForQuantity && quantity > 0) {
      const productoNormalizado = normalizarProducto(selectedProductForQuantity);
      
      const productWithQuantity = { 
        ...productoNormalizado,
        name: productoNormalizado.nombre,
        price: productoNormalizado.precio,
        category: productoNormalizado.categoria,
        quantity,
        subtotal: productoNormalizado.precio * quantity,
        uniqueId: Date.now()
      };
      
      onProductsChange([...selectedProducts, productWithQuantity]);
      setShowQuantityModal(false);
      setSelectedProductForQuantity(null);
      setQuantity(1);
    }
  };

  const cancelProductSelection = () => {
    setShowQuantityModal(false);
    setSelectedProductForQuantity(null);
    setQuantity(1);
  };

  const removeProduct = (uniqueId) => {
    onProductsChange(selectedProducts.filter(p => p.uniqueId !== uniqueId));
  };

  const isFormValid = quantity > 0;
  const totalProducts = selectedProducts.reduce((total, product) => total + product.subtotal, 0);

  const handleQuantityChange = (e) => {
    setQuantity(Math.max(1, parseInt(e.target.value) || 1));
  };

  return (
    <div className="relative">
      {errorMsg && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm flex items-center justify-between">
          <span className="text-red-700">{errorMsg}</span>
          <button onClick={cargarProductos} disabled={retrying} className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700 disabled:opacity-50">
            {retrying ? 'Reintentando...' : 'Reintentar'}
          </button>
        </div>
      )}
      {/* Buscador de productos */}
      <div className="relative" ref={productInputRef}>
        <div className="relative">
          <input
            type="text"
            value={productQuery}
            onChange={e => {
              setProductQuery(e.target.value);
              setIsProductDropdownOpen(true);
            }}
            onFocus={() => {
              setIsProductDropdownOpen(true);
              cargarProductos();
            }}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Buscar por nombre de producto..."
          />
          <button
            type="button"
            onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <i className={`bi bi-chevron-${isProductDropdownOpen ? 'up' : 'down'}`}></i>
          </button>
        </div>
        {isProductDropdownOpen && (
          <>
            {loading && (
              <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 p-4 text-center text-gray-500 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Cargando productos...</span>
                </div>
              </div>
            )}
            {!loading && filteredProducts.length > 0 && (
              <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-80 overflow-y-auto">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleProductSelect(product)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">{product.nombre}</div>
                        {product.categoria && product.categoria !== 'Sin categoría' && (
                          <div className="text-xs text-gray-600 mb-2 line-clamp-2">{product.categoria}</div>
                        )}
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1 text-gray-700">
                            <i className="bi bi-currency-dollar"></i>
                            <span className="font-medium">${formatNumber(product.precio)}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-primary text-sm font-medium">Agregar</span>
                        <i className="bi bi-plus-circle ml-2 text-primary"></i>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {!loading && filteredProducts.length === 0 && productQuery.trim() !== '' && (
              <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 p-4 text-center text-gray-500 text-sm">
                No se encontraron productos
              </div>
            )}
            {!loading && filteredProducts.length === 0 && productQuery.trim() === '' && availableProducts.length === 0 && (
              <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 p-4 text-center text-gray-500 text-sm">
                No hay productos disponibles
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para cantidad y detalles del producto */}
      {showQuantityModal && selectedProductForQuantity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-in flex flex-col border border-gray-200">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
              <div>
                <h2 className="text-xl font-bold text-accent m-0">Detalles del Producto</h2>
              </div>
              <button
                onClick={cancelProductSelection}
                className="text-gray-400 hover:text-black text-xl font-bold"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            
            {/* Contenido */}
            <div className="p-8 bg-white">
              <div className="space-y-4">
                <div>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm font-medium">
                    {selectedProductForQuantity.nombre || selectedProductForQuantity.name}
                  </div>
                </div>
                
                
                
                <div>
                  <label className="block text-xs font-medium text-black mb-1">Precio unitario</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                    ${selectedProductForQuantity.precio || selectedProductForQuantity.price || 0}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-black mb-1">
                    Cantidad <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-16 text-center border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                      min="1"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <label className="block text-xs font-medium text-black mb-1">Subtotal</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-bold text-green-600">
                    ${formatNumber((selectedProductForQuantity.precio || selectedProductForQuantity.price || 0) * quantity)}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={cancelProductSelection}
                  className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmProductSelection}
                  disabled={!isFormValid}
                  className={`px-4 py-2 rounded-md text-white ${isFormValid ? 'bg-accent hover:bg-accent-dark' : 'bg-gray-300 cursor-not-allowed'} transition-colors`}
                >
                  Agregar Producto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de productos seleccionados - SIEMPRE VISIBLE */}
      <div className="mt-4">
        <h4 className="text-xs font-medium mb-2">Lista de Productos:</h4>
        <div className="border border-gray-300 rounded-md overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Producto</th>
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Cantidad</th>
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Subtotal</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {selectedProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-2 py-4 text-center text-gray-500">
                    No hay productos seleccionados
                  </td>
                </tr>
              ) : (
                selectedProducts.map((product) => (
                  <tr key={product.uniqueId} className="border-t hover:bg-gray-50">
                    <td className="px-2 py-2 border-r">{product.name}</td>
                    <td className="px-2 py-2 border-r text-center">{formatNumber(product.quantity)}</td>
                    <td className="px-2 py-2 border-r">${formatNumber(product.subtotal || 0)}</td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => removeProduct(product.uniqueId)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar producto"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Total de productos */}
        <div className="mt-2 text-sm bg-green-50 p-2 rounded-md border border-green-100">
          <span className="font-medium">TOTAL DE PRODUCTOS: </span>
          <span className="font-bold text-green-600">
            ${formatNumber(totalProducts)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductSelector;