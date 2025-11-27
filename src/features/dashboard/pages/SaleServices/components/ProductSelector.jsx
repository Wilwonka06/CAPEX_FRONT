import React, { useState, useEffect } from "react";
import { apiRequest } from '../../../../../shared/config/apiConfig';
import { formatNumber } from '../../../../../shared/utils/formatters';

const ProductSelector = ({ selectedProducts, onProductsChange }) => {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProductForQuantity, setSelectedProductForQuantity] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

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

  // Cleanup del timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

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

  // Función para normalizar un producto del backend
  const normalizarProducto = (producto) => {
    return {
      id: producto.id_producto || producto.id,
      nombre: producto.nombre || producto.name || producto.producto_nombre || 'Producto sin nombre',
      precio: parseFloat(producto.costo || producto.precio || producto.price || 0),
      categoria: producto.categoria || producto.category || producto.tipo || 'Sin categoría'
    };
  };

  // Usar directamente los productos del backend (ya filtrados por la búsqueda)
  const filteredProducts = Array.isArray(availableProducts) 
    ? availableProducts.map(normalizarProducto) 
    : [];

  const handleProductSelect = (product) => {
    const isAlreadySelected = selectedProducts.some(p => p.id === product.id);
    if (!isAlreadySelected) {
      setSelectedProductForQuantity(product);
      setQuantity(1);
      setShowQuantityModal(true);
    }
    setSelectedProductId("");
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

  // Funciones simples para evitar problemas de hooks
  const handleSelectChange = (e) => {
    const val = e.target.value;
    setSelectedProductId(val);
    const producto = filteredProducts.find(p => String(p.id) === String(val));
    if (producto) {
      handleProductSelect(producto);
    }
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-black mb-1">Producto</label>
          <select
            value={selectedProductId}
            onChange={handleSelectChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            onFocus={cargarProductos}
          >
            <option value="">Seleccionar producto</option>
            {filteredProducts.map(product => (
              <option key={product.id} value={product.id}>
                {product.nombre} - ${product.precio}
              </option>
            ))}
          </select>
        </div>
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
                  <label className="block text-xs font-medium text-black mb-1">Producto</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
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
      {/* Overlay para cerrar dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default ProductSelector;