import React, { useState, useEffect } from "react";
import { apiRequest } from '../../../../../shared/config/apiConfig';
import { formatNumber, formatNumberInput, formatPrice, parseFormattedNumber } from '../../../../../shared/utils/formatters';

const ProductSelector = ({ selectedProducts, onProductsChange }) => {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState("");
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [errors, setErrors] = useState({});

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

  // Reset form when product changes
  useEffect(() => {
    if (selectedProductId) {
      setQuantity(1);
      setSelectedTime("");
      setErrors(prev => ({ ...prev, product: '', quantity: '', time: '' }));
    } else {
      setQuantity(1);
      setSelectedTime("");
    }
  }, [selectedProductId]);

  // Generar horarios disponibles para productos (horario comercial)
  const generateAvailableTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    const isToday = selectedDateObj.toDateString() === now.toDateString();

    // Horario comercial: 8:00 AM - 6:00 PM
    const startHour = 8;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

        // Si es hoy, no mostrar horas pasadas
        if (isToday) {
          const slotTime = new Date();
          slotTime.setHours(hour, minute, 0, 0);
          if (slotTime <= now) continue;
        }

        slots.push({
          time: timeString,
          display: timeString,
          available: true
        });
      }
    }

    return slots;
  };

  const availableTimeSlots = generateAvailableTimeSlots();

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

  const handleAddProduct = () => {
    let newErrors = {};

    if (!selectedProductId) {
      newErrors.product = "Seleccione un producto.";
    }
    if (!selectedTime) {
      newErrors.time = "Seleccione una hora.";
    }
    if (quantity <= 0) {
      newErrors.quantity = "La cantidad debe ser mayor a 0.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const selectedProduct = availableProducts.find(p => (p.id_producto || p.id) === parseInt(selectedProductId));

    if (!selectedProduct) {
      setErrors({ product: "Producto no encontrado." });
      return;
    }

    const productoNormalizado = normalizarProducto(selectedProduct);

    const productWithDetails = {
      ...productoNormalizado,
      name: productoNormalizado.nombre,
      price: productoNormalizado.precio,
      category: productoNormalizado.categoria,
      quantity: quantity,
      subtotal: productoNormalizado.precio * quantity,
      deliveryDate: selectedDate,
      deliveryTime: selectedTime,
      uniqueId: Date.now()
    };

    onProductsChange([...selectedProducts, productWithDetails]);

    // Reset form
    setSelectedProductId("");
    setQuantity(1);
    setSelectedTime("");
  };

  const removeProduct = (uniqueId) => {
    onProductsChange(selectedProducts.filter(p => p.uniqueId !== uniqueId));
  };

  const totalProducts = selectedProducts.reduce((total, product) => total + product.subtotal, 0);

  const handleQuantityChange = (e) => {
    const formatted = formatNumberInput(e.target.value, 0);
    const value = Math.max(1, Math.floor(parseFormattedNumber(formatted)) || 1);
    setQuantity(value);
    if (errors.quantity) {
      setErrors(prev => ({ ...prev, quantity: '' }));
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTime(""); // Reset time when date changes
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: '' }));
    }
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
    if (errors.time) {
      setErrors(prev => ({ ...prev, time: '' }));
    }
  };

  const handleProductChange = (e) => {
    setSelectedProductId(e.target.value);
    if (errors.product) {
      setErrors(prev => ({ ...prev, product: '' }));
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm flex items-center justify-between">
          <span className="text-red-700">{errorMsg}</span>
          <button onClick={cargarProductos} disabled={retrying} className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700 disabled:opacity-50">
            {retrying ? 'Reintentando...' : 'Reintentar'}
          </button>
        </div>
      )}
      {/* Sección para agregar productos */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">
          Agregar Productos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fecha de entrega <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                errors.date
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white`}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <i className="bi bi-exclamation-triangle"></i>
                {errors.date}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Producto <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                errors.product
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
              value={selectedProductId}
              onChange={handleProductChange}
              disabled={loading}
            >
              <option value="">
                {loading ? "Cargando..." : "Seleccionar producto"}
              </option>
              {availableProducts.map(product => {
                const normalized = normalizarProducto(product);
                return (
                  <option key={normalized.id} value={normalized.id}>
                    {normalized.nombre} - ${formatPrice(normalized.precio)}
                  </option>
                );
              })}
            </select>
            {errors.product && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <i className="bi bi-exclamation-triangle"></i>
                {errors.product}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Hora de entrega <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                errors.time
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
              value={selectedTime}
              onChange={handleTimeChange}
              disabled={!selectedProductId}
            >
              <option value="">
                {!selectedProductId ? "Seleccione producto primero" : "Seleccionar hora"}
              </option>
              {availableTimeSlots.map(slot => (
                <option key={slot.time} value={slot.time}>
                  {slot.display}
                </option>
              ))}
            </select>
            {errors.time && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <i className="bi bi-exclamation-triangle"></i>
                {errors.time}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Cantidad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formatNumber(quantity)}
              onChange={handleQuantityChange}
              className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                errors.quantity
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white disabled:bg-gray-100`}
              disabled={!selectedProductId}
              placeholder="1"
            />
            {errors.quantity && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <i className="bi bi-exclamation-triangle"></i>
                {errors.quantity}
              </p>
            )}
          </div>
        </div>

        {/* Mostrar detalles del producto seleccionado */}
        {selectedProductId && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Producto seleccionado</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm font-medium">
                  {availableProducts.find(p => (p.id_producto || p.id) === parseInt(selectedProductId))?.nombre || 'Producto no encontrado'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Precio unitario</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                  ${formatPrice(availableProducts.find(p => (p.id_producto || p.id) === parseInt(selectedProductId))?.precio || availableProducts.find(p => (p.id_producto || p.id) === parseInt(selectedProductId))?.costo || 0)}
                </div>
              </div>
            </div>
            <div className="mt-4 border-t pt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Subtotal</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-bold text-green-600">
                ${formatPrice((availableProducts.find(p => (p.id_producto || p.id) === parseInt(selectedProductId))?.precio || availableProducts.find(p => (p.id_producto || p.id) === parseInt(selectedProductId))?.costo || 0) * quantity)}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            className="px-4 py-2 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all font-semibold text-sm flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:text-white"
            onClick={handleAddProduct}
            disabled={!selectedProductId || loading}
          >
            <i className="bi bi-plus-circle"></i>
            Agregar a la Lista
          </button>
        </div>
      </div>


      {/* Lista de productos seleccionados - Solo visible cuando hay productos */}
      {selectedProducts.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-medium mb-2">Lista de Productos:</h4>
          <div className="border border-gray-300 rounded-md overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Producto</th>
                  <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Fecha entrega</th>
                  <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Hora entrega</th>
                  <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Cantidad</th>
                  <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Subtotal</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {selectedProducts.map((product) => (
                  <tr key={product.uniqueId} className="border-t hover:bg-gray-50">
                    <td className="px-2 py-2 border-r">{product.name}</td>
                    <td className="px-2 py-2 border-r">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        <i className="bi bi-calendar mr-1"></i>
                        {product.deliveryDate}
                      </span>
                    </td>
                    <td className="px-2 py-2 border-r">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        <i className="bi bi-clock mr-1"></i>
                        {product.deliveryTime}
                      </span>
                    </td>
                    <td className="px-2 py-2 border-r text-center">{formatNumber(product.quantity)}</td>
                    <td className="px-2 py-2 border-r">{formatPrice(product.subtotal || 0)}</td>
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
                ))}
              </tbody>
            </table>
          </div>
          {/* Total de productos */}
          <div className="mt-2 text-sm bg-green-50 p-2 rounded-md border border-green-100">
            <span className="font-medium">TOTAL DE PRODUCTOS: </span>
            <span className="font-bold text-green-600">
              {formatPrice(totalProducts)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSelector;