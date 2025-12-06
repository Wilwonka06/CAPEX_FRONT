import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import productsService from "../../products/API/productsService";
import suppliersService from "../../suppliers/API/suppliersService";
import CreateSupplier from "../../suppliers/components/CreateSupplier";
import CreateProduct from "../../products/components/CreateProduct";
import { formatNumber, formatNumberInput, formatPrice, formatPercentage, parseFormattedNumber } from "../../../../../shared/utils/formatters";

export default function CreatePurchaseModal({ isOpen, onClose, onCreate }) {
  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Estado para proveedores
  const [suppliersList, setSuppliersList] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  // Estado del formulario principal
  const [proveedorId, setProveedorId] = useState("");
  const [nit, setNit] = useState("");
  const [ivaGeneral, setIvaGeneral] = useState(0); // IVA general por defecto 19%
  const [fechaCompra, setFechaCompra] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // Estado para agregar productos
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [costo, setCosto] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");

  // Lista de productos en la compra
  const [itemsCompra, setItemsCompra] = useState([]);

  // Estado para los totales
  const [subtotal, setSubtotal] = useState(0);
  const [totalIva, setTotalIva] = useState(0);
  const [total, setTotal] = useState(0);

  // Estado para errores
  const [errores, setErrores] = useState({});

  // Estado para modales de creación rápida
  const [openSupplierModal, setOpenSupplierModal] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [localSuppliers, setLocalSuppliers] = useState([]);
  const [localProducts, setLocalProducts] = useState([]);

  // Cargar proveedores y productos al montar
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setLoadingSuppliers(true);
        let response;
        try {
          response = await suppliersService.getActive();
        } catch (error) {
          console.log("getActive no disponible, usando getAll");
          response = await suppliersService.getAll({ limit: 100 });
        }
        
        if (response.success) {
          const activeSuppliers = Array.isArray(response.data) 
            ? response.data.filter(s => s.estado === 'Activo' || s.isActive) 
            : [];
          setSuppliersList(activeSuppliers);
        }
      } catch (error) {
        console.error("Error loading suppliers:", error);
        setSuppliersList([]);
      } finally {
        setLoadingSuppliers(false);
      }
    };

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await productsService.getAll({ limit: 100 });
        if (response.success) {
          // Filtrar productos que NO sean de categoría "Extensión natural"
          const filteredProducts = (response.data || []).filter(product =>
            product.categoria !== 'Extensión natural'
          );
          setProductsList(filteredProducts);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (isOpen) {
      loadSuppliers();
      loadProducts();
    }
  }, [isOpen]);

  // Unificar listas para selects
  const suppliersSelect = localSuppliers.length > 0 ? localSuppliers : suppliersList;
  const productsSelect = localProducts.length > 0 ? localProducts : productsList;

  // Actualizar NIT cuando cambia el proveedor
  useEffect(() => {
    const proveedor = suppliersSelect.find((s) => s.id === Number(proveedorId));
    setNit(proveedor ? proveedor.nit : "");
  }, [proveedorId, suppliersSelect]);

  // ✅ Cargar costo y precio de venta del producto
  useEffect(() => {
    const producto = productsSelect.find((p) => p.id === Number(productoSeleccionado));
    if (producto) {
      setCosto(producto.costo?.toString() || "0");
      setPrecioVenta(producto.precio_venta?.toString() || producto.precio?.toString() || "0");
    } else {
      setCosto("");
      setPrecioVenta("");
    }
  }, [productoSeleccionado, productsSelect]);

  useEffect(() => {
    const c = parseFormattedNumber(costo);
    if (isFinite(c) && c > 0) {
      const precioCalculado = (c * 1.2);
      setPrecioVenta(formatNumber(precioCalculado, 2));
    } else {
      setPrecioVenta("");
    }
  }, [costo]);

  // ✅ Recalcular totales con IVA general aplicado a todos los productos
  useEffect(() => {
    if (itemsCompra.length === 0) {
      setSubtotal(0);
      setTotalIva(0);
      setTotal(0);
      return;
    }

    // Calcular subtotal (sin IVA)
    const newSubtotal = itemsCompra.reduce(
      (acc, item) => acc + ((item.costo || 0) * (Math.floor(parseFormattedNumber(item.cantidad)) || 0)),
      0
    );

    // Calcular IVA total usando el IVA general de la compra
    const ivaDecimal = ivaGeneral / 100; // Convertir 19 a 0.19
    const newTotalIva = newSubtotal * ivaDecimal;

    setSubtotal(newSubtotal);
    setTotalIva(newTotalIva);
    setTotal(newSubtotal + newTotalIva);
  }, [itemsCompra, ivaGeneral]);

  const handleNumberInput = (e, setter, decimals = 0) => {
    const value = e.target.value;
    const formatted = formatNumberInput(value, decimals);
    setter(formatted);
  };

  const handleAddProduct = () => {
    let nuevosErrores = {};

    if (!proveedorId) {
      toast.error("Debe seleccionar un proveedor antes de agregar productos.");
      return;
    }

    if (!productoSeleccionado) {
      nuevosErrores.producto = "Seleccione un producto.";
    }
    const cantidadNum = parseFormattedNumber(cantidad);
    const costoNum = parseFormattedNumber(costo);
    const precioVentaNum = parseFormattedNumber(precioVenta);
    
    if (!cantidad || cantidadNum <= 0) {
      nuevosErrores.cantidad = "La cantidad debe ser mayor a 0.";
    }
    if (costo === "" || costoNum < 0) {
      nuevosErrores.costo = "El costo no puede ser negativo.";
    }
    if (precioVenta === "" || precioVentaNum < 0) {
      nuevosErrores.precioVenta = "El precio de venta no puede ser negativo.";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setErrores({});

    const producto = productsSelect.find((p) => p.id === Number(productoSeleccionado));
    if (!producto) {
      toast.error("Producto no encontrado.");
      return;
    }

    // Reutilizar las variables ya declaradas arriba
    const cantidadNumFinal = Math.floor(cantidadNum);
    
    // Calcular subtotal sin IVA
    const subtotalItem = costoNum * cantidadNumFinal;
    
    // Calcular IVA del item usando el IVA general
    const ivaDecimal = ivaGeneral / 100;
    const montoIva = subtotalItem * ivaDecimal;
    
    // Precio con IVA (solo para mostrar)
    const precioConIva = costoNum * (1 + ivaDecimal);

    const newItem = {
      ...producto,
      codigo: `P${producto.id.toString().padStart(3, "0")}`,
      cantidad: cantidadNumFinal,
      costo: costoNum,
      precioVenta: precioVentaNum,
      iva: ivaGeneral,
      montoIva: montoIva,
      precioConIva: precioConIva,
      subtotalItem: subtotalItem
    };

    setItemsCompra((prev) => [...prev, newItem]);
    setProductoSeleccionado("");
    setCantidad("");
    setCosto("");
    setPrecioVenta("");
  };

  const handleUpdateCantidad = (index, nuevaCantidad) => {
    const cantidadNum = Math.floor(parseFormattedNumber(nuevaCantidad)) || 0;
    setItemsCompra((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const costoNum = parseFloat(item.costo) || 0;
          const ivaDecimal = ivaGeneral / 100;
          const subtotalItem = costoNum * cantidadNum;
          const montoIva = subtotalItem * ivaDecimal;
          const precioConIva = costoNum * (1 + ivaDecimal);
          
          return {
            ...item,
            cantidad: cantidadNum,
            montoIva,
            precioConIva,
            subtotalItem
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (index) => {
    setItemsCompra((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!proveedorId) {
      toast.error("Debe seleccionar un proveedor.");
      return;
    }
    
    if (itemsCompra.length === 0) {
      toast.error("Debe agregar al menos un producto.");
      return;
    }

    try {
      // IVA con formato numérico
      const ivaValue = parseFormattedNumber(ivaGeneral) || 0;
      const ivaRateDecimal = ivaValue > 1 ? (ivaValue / 100) : ivaValue;
      const ivaAmount = itemsCompra.reduce((acc, item) => {
        const precio = parseFormattedNumber(item.costo || 0);
        const cantidad = Math.floor(parseFormattedNumber(item.cantidad || 0));
        return acc + (precio * cantidad * ivaRateDecimal);
      }, 0);

      const purchaseData = {
        supplierId: Number(proveedorId),
        fechaCompra: fechaCompra,
        ivaGeneral: ivaGeneral,
        iva: ivaAmount,
        detalles: itemsCompra.map((item) => ({
          productId: item.id,
          cantidad: item.cantidad,
          precioUnitario: parseFormattedNumber(item.costo),
          precio_venta: parseFormattedNumber(item.precioVenta)
        })),
      };

      await onCreate(purchaseData);

      // Limpiar formulario
      setProveedorId("");
      setItemsCompra([]);
      setIvaGeneral(19);
      setFechaCompra(new Date().toISOString().slice(0, 10));
      setErrores({});
    } catch (error) {
      console.error("Error creating purchase:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Error al crear la compra";
      toast.error(errorMessage);
    }
  };

  if (openSupplierModal) {
    return (
      <CreateSupplier
        isOpen={true}
        onClose={() => setOpenSupplierModal(false)}
        onCreate={(nuevoProveedor) => {
          setLocalSuppliers((prev) => [nuevoProveedor, ...suppliersSelect]);
          setProveedorId(nuevoProveedor.id);
          setOpenSupplierModal(false);
        }}
        suppliers={suppliersSelect}
      />
    );
  }

  if (openProductModal) {
    return (
      <CreateProduct
        isOpen={true}
        onClose={() => setOpenProductModal(false)}
        onCreate={(nuevoProducto) => {
          setLocalProducts((prev) => [nuevoProducto, ...productsSelect]);
          setProductoSeleccionado(nuevoProducto.id);
          setOpenProductModal(false);
        }}
        products={productsSelect}
      />
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-cart-plus text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">Crear Nueva Compra</h2>
          </div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          <form id="purchase-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Sección de Fechas */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fecha de Compra <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border-2 rounded-xl text-sm border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white"
                value={fechaCompra}
                onChange={(e) => setFechaCompra(e.target.value)}
                required
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>

            {/* Sección de Proveedor e IVA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Proveedor <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <select
                    className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                      errores.proveedor
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white`}
                    value={proveedorId}
                    onChange={(e) => {
                      setProveedorId(e.target.value);
                      if (errores.proveedor) {
                        setErrores(prev => {
                          const newErrores = { ...prev };
                          delete newErrores.proveedor;
                          return newErrores;
                        });
                      }
                    }}
                    required
                    disabled={loadingSuppliers}
                  >
                    <option value="">
                      {loadingSuppliers ? "Cargando..." : "Seleccione proveedor"}
                    </option>
                    {suppliersSelect.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-gray-100 text-primary text-lg flex items-center justify-center transition-colors"
                    title="Crear proveedor"
                    onClick={() => setOpenSupplierModal(true)}
                  >
                    <i className="bi bi-plus-circle"></i>
                  </button>
                </div>
                {errores.proveedor && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <i className="bi bi-exclamation-triangle"></i>
                    {errores.proveedor}
                  </p>
                )}
                {suppliersSelect.length === 0 && !loadingSuppliers && (
                  <p className="text-xs text-gray-500 mt-1">
                    No hay proveedores activos disponibles
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  NIT
                </label>
                <input
                  type="text"
                  readOnly
                  className="w-full px-3 py-2 border-2 rounded-xl text-sm bg-gray-100 border-gray-200 cursor-not-allowed"
                  value={nit || ""}
                  placeholder="Seleccione un proveedor"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  IVA General (%)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border-2 rounded-xl text-sm border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white"
                  value={formatNumber(ivaGeneral, 0)}
                  onChange={(e) => {
                    const formatted = formatNumberInput(e.target.value, 0);
                    setIvaGeneral(parseFormattedNumber(formatted) || 0);
                  }}
                  placeholder="19"
                />
              </div>
            </div>

            {/* Sección para agregar productos */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-gray-700">
                Agregar Productos a la Compra
              </h3>
              {!proveedorId && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3">
                  <p className="text-xs text-yellow-800 flex items-center gap-1">
                    <i className="bi bi-exclamation-triangle"></i>
                    Debe seleccionar un proveedor antes de agregar productos
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Producto <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                        errores.producto
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      value={productoSeleccionado}
                      onChange={(e) => {
                        setProductoSeleccionado(e.target.value);
                        if (errores.producto) {
                          setErrores(prev => {
                            const newErrores = { ...prev };
                            delete newErrores.producto;
                            return newErrores;
                          });
                        }
                      }}
                      disabled={!proveedorId}
                    >
                      <option value="">Seleccionar producto</option>
                      {productsSelect.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="p-2 rounded-lg hover:bg-gray-100 text-primary text-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Crear producto"
                      onClick={() => setOpenProductModal(true)}
                      disabled={!proveedorId}
                    >
                      <i className="bi bi-plus-circle"></i>
                    </button>
                  </div>
                  {errores.producto && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="bi bi-exclamation-triangle"></i>
                      {errores.producto}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Cantidad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formatNumber(cantidad)}
                    onChange={(e) => {
                      handleNumberInput(e, setCantidad, 0);
                      if (errores.cantidad) {
                        setErrores(prev => {
                          const newErrores = { ...prev };
                          delete newErrores.cantidad;
                          return newErrores;
                        });
                      }
                    }}
                    className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                      errores.cantidad
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white disabled:bg-gray-100`}
                    disabled={!proveedorId}
                    placeholder="0"
                  />
                  {errores.cantidad && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="bi bi-exclamation-triangle"></i>
                      {errores.cantidad}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Costo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formatNumber(costo, 2)}
                    onChange={(e) => {
                      handleNumberInput(e, setCosto, 2);
                      if (errores.costo) {
                        setErrores(prev => {
                          const newErrores = { ...prev };
                          delete newErrores.costo;
                          return newErrores;
                        });
                      }
                    }}
                    className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                      errores.costo
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white disabled:bg-gray-100`}
                    disabled={!proveedorId}
                    placeholder="0,00"
                  />
                  {errores.costo && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="bi bi-exclamation-triangle"></i>
                      {errores.costo}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Precio (auto 20%)
                  </label>
                  <input
                    type="text"
                    value={formatNumber(precioVenta, 2)}
                    readOnly
                    className="w-full px-3 py-2 border-2 rounded-xl text-sm bg-gray-100 border-gray-200"
                    placeholder="0,00"
                  />
                  {errores.precioVenta && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="bi bi-exclamation-triangle"></i>
                      {errores.precioVenta}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all font-semibold text-sm flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:text-white"
                  onClick={handleAddProduct}
                  disabled={!proveedorId}
                >
                  <i className="bi bi-plus-circle"></i>
                  Agregar a la Lista
                </button>
              </div>
            </div>

            {/* Tabla de productos */}
            <div className="mt-8">
              <h3 className="text-md font-semibold text-text-main mb-4">
                Lista de Compra
              </h3>
              <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">CÓDIGO</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">NOMBRE</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">COSTO</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">PRECIO VENTA</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">CANTIDAD</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">IVA (%)</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">SUBTOTAL</th>
                      <th className="py-2 px-3 text-center font-semibold text-gray-700">ACCIÓN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {itemsCompra.length > 0 ? (
                      itemsCompra.map((item, index) => (
                        <tr key={index}>
                          <td className="py-2 px-3">{item.codigo}</td>
                          <td className="py-2 px-3">{item.nombre}</td>
                          <td className="py-2 px-3">{formatPrice(item.costo || 0)}</td>
                          <td className="py-2 px-3">{formatPrice(item.precioVenta || 0)}</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              className="w-20 px-2 py-1 border rounded-md"
                              value={formatNumber(item.cantidad)}
                              onChange={(e) => {
                                const formatted = formatNumberInput(e.target.value, 0);
                                handleUpdateCantidad(index, formatted);
                              }}
                            />
                          </td>
                          <td className="py-2 px-3">{formatPercentage(item.iva || 0)}</td>
                          <td className="py-2 px-3">
                        {formatPrice(((item.costo || 0) * (item.cantidad || 0)))}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-gray-500">
                          Aún no hay productos en la lista.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {itemsCompra.length > 0 && (
                    <tfoot className="bg-gray-50 border-t">
                      <tr>
                        <td colSpan="4"></td>
                        <td className="py-2 px-3 font-bold text-right">Subtotal:</td>
                        <td className="py-2 px-3 font-bold" colSpan="2">
                          {formatPrice(subtotal || 0)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="4"></td>
                        <td className="py-2 px-3 font-bold text-right">Total IVA:</td>
                        <td className="py-2 px-3 font-bold" colSpan="2">
                          {formatPrice(totalIva || 0)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="4"></td>
                        <td className="py-2 px-3 font-bold text-right text-primary">
                          Total:
                        </td>
                        <td className="py-2 px-3 font-bold text-primary" colSpan="2">
                          {formatPrice(total || 0)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </form>
        </div>
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <>
            <button type="button" className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-sm hover:bg-gray-50 transition-all duration-200 flex items-center gap-2" onClick={onClose}><i className="bi bi-x-circle"></i>Cancelar</button>
            <button type="submit" form="purchase-form" className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-sm font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 ml-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!proveedorId || itemsCompra.length === 0}><i className="bi bi-check-circle"></i>Guardar Compra</button>
          </>
        </div>
      </div>
    </div>
  );
}
