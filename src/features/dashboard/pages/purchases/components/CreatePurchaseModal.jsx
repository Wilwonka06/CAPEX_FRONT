import { useState, useEffect } from "react";
import productsService from "../../products/API/productsService";
import suppliersService from "../../suppliers/API/suppliersService";
import CreateSupplier from "../../suppliers/components/CreateSupplier";
import CreateProduct from "../../products/components/CreateProduct";

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
  const [fechaRegistro] = useState(new Date().toISOString().slice(0, 10));

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
      (acc, item) => acc + (parseFloat(item.costo) || 0) * (parseInt(item.cantidad) || 0),
      0
    );

    // Calcular IVA total usando el IVA general de la compra
    const ivaDecimal = ivaGeneral / 100; // Convertir 19 a 0.19
    const newTotalIva = newSubtotal * ivaDecimal;

    setSubtotal(newSubtotal);
    setTotalIva(newTotalIva);
    setTotal(newSubtotal + newTotalIva);
  }, [itemsCompra, ivaGeneral]);

  const formatNumber = (num) => {
    if (num === "" || num === undefined || num === null) return "";
    const parts = num.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const cleanNumber = (str) => {
    if (!str) return "";
    return str.toString().replace(/[^0-9.]/g, "");
  };

  const handleNumberInput = (e, setter) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  const handleAddProduct = () => {
    let nuevosErrores = {};

    if (!proveedorId) {
      alert("Debe seleccionar un proveedor antes de agregar productos.");
      return;
    }

    if (!productoSeleccionado) {
      nuevosErrores.producto = "Seleccione un producto.";
    }
    if (!cantidad || Number(cantidad) <= 0) {
      nuevosErrores.cantidad = "La cantidad debe ser mayor a 0.";
    }
    if (costo === "" || Number(costo) < 0) {
      nuevosErrores.costo = "El costo no puede ser negativo.";
    }
    if (precioVenta === "" || Number(precioVenta) < 0) {
      nuevosErrores.precioVenta = "El precio de venta no puede ser negativo.";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setErrores({});

    const producto = productsSelect.find((p) => p.id === Number(productoSeleccionado));
    if (!producto) {
      alert("Producto no encontrado.");
      return;
    }

    const costoNum = parseFloat(costo);
    const cantidadNum = parseInt(cantidad);
    const precioVentaNum = parseFloat(precioVenta);
    
    // Calcular subtotal sin IVA
    const subtotalItem = costoNum * cantidadNum;
    
    // Calcular IVA del item usando el IVA general
    const ivaDecimal = ivaGeneral / 100;
    const montoIva = subtotalItem * ivaDecimal;
    
    // Precio con IVA (solo para mostrar)
    const precioConIva = costoNum * (1 + ivaDecimal);

    const newItem = {
      ...producto,
      codigo: `P${producto.id.toString().padStart(3, "0")}`,
      cantidad: cantidadNum,
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
    const cantidadNum = parseInt(nuevaCantidad) || 0;
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
      alert("Debe seleccionar un proveedor.");
      return;
    }
    
    if (itemsCompra.length === 0) {
      alert("Debe agregar al menos un producto.");
      return;
    }

    try {
      const purchaseData = {
        supplierId: Number(proveedorId),
        fechaCompra: fechaCompra,
        ivaGeneral: ivaGeneral, // Enviar el IVA general de la compra
        detalles: itemsCompra.map((item) => ({
          productId: item.id,
          cantidad: item.cantidad,
          precioUnitario: item.costo, // Costo de compra
          precioVenta: item.precioVenta // Precio de venta a actualizar (opcional)
        })),
      };

      await onCreate(purchaseData);

      // Limpiar formulario
      setProveedorId("");
      setItemsCompra([]);
      setIvaGeneral(19);
      setFechaCompra(new Date().toISOString().slice(0, 10));
    } catch (error) {
      console.error("Error creating purchase:", error);
      alert(error.response?.data?.message || "Error al crear la compra");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-[#9C5B2B] m-0">
            Registrar Nueva Compra
          </h2>
          <button
            className="text-gray-400 hover:text-primary text-xl font-bold"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="overflow-y-auto p-8 flex-1 space-y-8">
          <form id="purchase-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Sección de Fechas */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-main mb-1">
                    Fecha de Compra <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-md text-xs"
                    value={fechaCompra}
                    onChange={(e) => setFechaCompra(e.target.value)}
                    required
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-main mb-1">
                    Fecha de Registro
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-md bg-gray-200 text-xs"
                    value={fechaRegistro}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Sección de Proveedor e IVA */}
            <div className="p-6 border rounded-lg bg-gray-50 mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-medium text-text-main mb-1">
                    Proveedor <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      value={proveedorId}
                      onChange={(e) => setProveedorId(e.target.value)}
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
                      className="ml-1 p-1 rounded-full hover:bg-gray-200 text-primary text-lg flex items-center justify-center"
                      title="Registrar proveedor"
                      style={{ border: "none", background: "none" }}
                      onClick={() => setOpenSupplierModal(true)}
                    >
                      <i className="bi bi-plus-circle"></i>
                    </button>
                  </div>
                  {suppliersSelect.length === 0 && !loadingSuppliers && (
                    <span className="text-xs text-red-500">
                      No hay proveedores activos disponibles
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-main mb-1">
                    NIT
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md bg-gray-200 text-sm"
                    value={nit}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-main mb-1">
                    IVA General (%)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    value={ivaGeneral}
                    onChange={(e) => handleNumberInput(e, (val) => setIvaGeneral(parseFloat(val) || 0))}
                  />
                </div>
              </div>
            </div>

            {/* Sección para agregar productos */}
            <div className="p-6 border rounded-lg mb-6 space-y-4">
              <h3 className="text-md font-semibold text-text-main mb-4">
                Agregar Productos a la Compra
              </h3>
              {!proveedorId && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <i className="bi bi-exclamation-triangle mr-2"></i>
                    Debe seleccionar un proveedor antes de agregar productos
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
                <div className="flex items-center gap-2 md:col-span-2">
                  <select
                    className="w-full px-3 py-2 border rounded-md text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={productoSeleccionado}
                    onChange={(e) => setProductoSeleccionado(e.target.value)}
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
                    className="ml-1 p-1 rounded-full hover:bg-gray-200 text-primary text-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Registrar producto"
                    style={{ border: "none", background: "none" }}
                    onClick={() => setOpenProductModal(true)}
                    disabled={!proveedorId}
                  >
                    <i className="bi bi-plus-circle"></i>
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-main mb-1">
                    Cantidad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cantidad}
                    onChange={(e) => handleNumberInput(e, setCantidad)}
                    className="w-full px-3 py-2 border rounded-md text-sm disabled:bg-gray-100"
                    disabled={!proveedorId}
                    placeholder="0"
                  />
                  {errores.cantidad && (
                    <span className="text-xs text-red-500">{errores.cantidad}</span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-main mb-1">
                    Costo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={costo}
                    onChange={(e) => handleNumberInput(e, setCosto)}
                    className="w-full px-3 py-2 border rounded-md text-sm disabled:bg-gray-100"
                    disabled={!proveedorId}
                    placeholder="0.00"
                  />
                  {errores.costo && (
                    <span className="text-xs text-red-500">{errores.costo}</span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-main mb-1">
                    Precio Venta
                  </label>
                  <input
                    type="text"
                    value={precioVenta}
                    onChange={(e) => handleNumberInput(e, setPrecioVenta)}
                    className="w-full px-3 py-2 border rounded-md text-sm disabled:bg-gray-100"
                    disabled={!proveedorId}
                    placeholder="0.00"
                  />
                  {errores.precioVenta && (
                    <span className="text-xs text-red-500">{errores.precioVenta}</span>
                  )}
                </div>
              </div>
              <div className="text-right mt-6">
                <button
                  type="button"
                  className="bg-text-main text-white text-sm px-4 py-2 rounded-md hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={handleAddProduct}
                  disabled={!proveedorId}
                >
                  <i className="bi bi-plus-circle mr-2"></i>
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
                          <td className="py-2 px-3">${(item.costo || 0).toFixed(2)}</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              className="w-20 px-2 py-1 border rounded-md"
                              value={item.cantidad}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || /^\d+$/.test(val)) {
                                  handleUpdateCantidad(index, val);
                                }
                              }}
                            />
                          </td>
                          <td className="py-2 px-3">{(item.iva || 0).toFixed(0)}%</td>
                          <td className="py-2 px-3">
                            ${((item.costo || 0) * (item.cantidad || 0)).toFixed(2)}
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
                          ${(subtotal || 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="4"></td>
                        <td className="py-2 px-3 font-bold text-right">Total IVA:</td>
                        <td className="py-2 px-3 font-bold" colSpan="2">
                          ${(totalIva || 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="4"></td>
                        <td className="py-2 px-3 font-bold text-right text-primary">
                          Total a Pagar:
                        </td>
                        <td className="py-2 px-3 font-bold text-primary" colSpan="2">
                          ${(total || 0).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </form>
        </div>

        {/* Footer fijo */}
        <div className="rounded-b-lg flex justify-end px-8 py-4 border-t">
          <button
            type="button"
            className="px-4 py-2 rounded-md border text-sm"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="purchase-form"
            className="px-4 py-2 rounded-md bg-text-main text-white font-semibold text-sm ml-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!proveedorId || itemsCompra.length === 0}
          >
            Guardar Compra
          </button>
        </div>
      </div>
    </div>
  );
}