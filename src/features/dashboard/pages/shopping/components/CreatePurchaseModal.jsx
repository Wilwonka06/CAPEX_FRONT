import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useProducts } from "../../products/hooks/useProducts";
import { useSuppliers } from "../../suppliers/hooks/useSuppliers";
import CreateSupplier from '../../suppliers/components/CreateSupplier';
import CreateProduct from '../../products/components/CreateProduct';
import QuickCreateSupplierModal from './QuickCreateSupplierModal';
import QuickCreateProductModal from './QuickCreateProductModal';

export default function CreatePurchaseModal({ isOpen, onClose, onCreate }) {
  const { products: productsList, editProduct } = useProducts();
  const { suppliers: suppliersList } = useSuppliers();
  
  // Estado del formulario principal
  const [proveedorId, setProveedorId] = useState("");
  const [nit, setNit] = useState("");
  const [ivaGeneral, setIvaGeneral] = useState(0.19); // IVA general por defecto (19%)
  const [fechaCompra, setFechaCompra] = useState(
    new Date().toISOString().slice(0, 10)
  ); // Fecha de compra seleccionable
  const [fechaRegistro] = useState(new Date().toISOString().slice(0, 10)); // Fecha de registro fija (actual)

  // Estado para agregar productos a la lista
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
  // Estado local para listas actualizadas
  const [localSuppliers, setLocalSuppliers] = useState([]);
  const [localProducts, setLocalProducts] = useState([]);

  // Unificar listas para selects
  const suppliersSelect = localSuppliers.length > 0 ? localSuppliers : suppliersList;
  const productsSelect = localProducts.length > 0 ? localProducts : productsList;

  // Efecto para actualizar el NIT cuando cambia el proveedor
  useEffect(() => {
    const proveedor = suppliersList.find((s) => s.id === Number(proveedorId));
    setNit(proveedor ? proveedor.nit : "");
  }, [proveedorId]);

  // Efecto para cargar datos del producto cuando se selecciona
  useEffect(() => {
    const producto = productsList.find(p => p.id === Number(productoSeleccionado));
    if (producto) {
      setCosto(producto.precio?.toString() || "");
      setPrecioVenta(producto.precio?.toString() || "");
    } else {
      setCosto("");
      setPrecioVenta("");
    }
  }, [productoSeleccionado, productsList]);

  // Efecto para recalcular totales cuando cambia la lista de items o el IVA general
  useEffect(() => {
    const newSubtotal = itemsCompra.reduce(
      (acc, item) => acc + item.costo * item.cantidad,
      0
    );
    const newTotalIva = itemsCompra.reduce(
      (acc, item) => acc + item.costo * item.cantidad * ivaGeneral,
      0
    );
    setSubtotal(newSubtotal);
    setTotalIva(newTotalIva);
    setTotal(newSubtotal + newTotalIva);
  }, [itemsCompra, ivaGeneral]);

  // Efecto para actualizar IVA de todos los items cuando cambia el IVA general
  useEffect(() => {
    if (itemsCompra.length > 0) {
      setItemsCompra((prev) =>
        prev.map((item) => {
          const montoIva = item.costo * item.cantidad * ivaGeneral;
          const precioConIva = (item.costo * (1 + ivaGeneral)).toFixed(2);
          return {
            ...item,
            iva: ivaGeneral,
            montoIva,
            precioConIva: parseFloat(precioConIva),
          };
        })
      );
    }
  }, [ivaGeneral]);

  const formatNumber = (num) => {
    if (num === '' || num === undefined || num === null) return '';
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };
  const cleanNumber = (str) => str.replace(/,/g, '');

  const handleAddProduct = () => {
    let nuevosErrores = {};
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
    const producto = productsList.find(p => p.id === Number(productoSeleccionado));
    if (!producto || Number(cantidad) <= 0 || Number(costo) <= 0) {
      alert("Por favor, complete todos los campos para agregar el producto.");
      return;
    }
    const montoIva = Number(costo) * Number(cantidad) * ivaGeneral;
    const precioConIva = (Number(costo) * (1 + ivaGeneral)).toFixed(2);
    const newItem = {
      ...producto,
      codigo: `P${producto.id.toString().padStart(3, '0')}`,
      cantidad: Number(cantidad),
      costo: Number(costo),
      precioVenta: Number(precioVenta),
      iva: ivaGeneral,
      montoIva: montoIva,
      precioConIva: parseFloat(precioConIva)
    };
    setItemsCompra(prev => [...prev, newItem]);
    setProductoSeleccionado("");
    setCantidad("");
    setCosto("");
    setPrecioVenta("");
  };

  const handleUpdateCantidad = (index, nuevaCantidad) => {
    setItemsCompra((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const montoIva = item.costo * nuevaCantidad * ivaGeneral;
          const precioConIva = (item.costo * (1 + ivaGeneral)).toFixed(2);
          return {
            ...item,
            cantidad: nuevaCantidad,
            montoIva,
            iva: ivaGeneral,
            precioConIva: parseFloat(precioConIva),
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (index) => {
    setItemsCompra((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!proveedorId || itemsCompra.length === 0) {
      alert("Debe seleccionar un proveedor y agregar al menos un producto.");
      return;
    }
    const proveedor = suppliersList.find((s) => s.id === Number(proveedorId));

    // Actualizar la cantidad de los productos
    itemsCompra.forEach(item => {
      const productoOriginal = productsList.find(p => p.id === item.id);
      if (productoOriginal) {
        const productoActualizado = {
          ...productoOriginal,
          cantidad: productoOriginal.cantidad + item.cantidad
        };
        editProduct(productoActualizado);
      }
    });

    const nuevaCompra = {
      id: Date.now(),
      fechaCompra: fechaCompra,
      fechaRegistro: fechaRegistro,
      proveedor: proveedor.nombre,
      nit: nit,
      items: itemsCompra,
      subtotal,
      totalIva,
      total,
      estado: "Registrada",
    };
    if (onCreate) onCreate(nuevaCompra);
    onClose(); // Idealmente, resetear estado aquí también al cerrar
  };

  if (openSupplierModal) {
    return (
      <CreateSupplier
        isOpen={true}
        onClose={() => setOpenSupplierModal(false)}
        onCreate={nuevoProveedor => {
          setLocalSuppliers(prev => [nuevoProveedor, ...suppliersSelect]);
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
        onCreate={nuevoProducto => {
          setLocalProducts(prev => [nuevoProducto, ...productsSelect]);
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
            {/* Sección de Fechas*/}
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
            {/* Sección de Proveedor, Fechas e IVA */}
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
                    >
                      <option value="">Seleccione proveedor</option>
                      {suppliersSelect.filter(s => s.isActive).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="ml-1 p-1 rounded-full hover:bg-gray-200 text-primary text-lg flex items-center justify-center"
                      title="Registrar proveedor"
                      style={{ border: 'none', background: 'none' }}
                      onClick={() => setOpenSupplierModal(true)}
                    >
                      <i className="bi bi-plus-circle"></i>
                    </button>
                  </div>
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
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    value={ivaGeneral * 100}
                    onChange={(e) =>
                      setIvaGeneral(parseFloat(e.target.value) / 100)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Sección para agregar productos */}
            <div className="p-6 border rounded-lg mb-6 space-y-4">
              <h3 className="text-md font-semibold text-text-main mb-4">Agregar Productos a la Compra</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
                <div className="flex items-center gap-2 md:col-span-2">
                  <select
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    value={productoSeleccionado}
                    onChange={(e) => setProductoSeleccionado(e.target.value)}
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
                    className="ml-1 p-1 rounded-full hover:bg-gray-200 text-primary text-lg flex items-center justify-center"
                    title="Registrar producto"
                    style={{ border: 'none', background: 'none' }}
                    onClick={() => setOpenProductModal(true)}
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
                    name="cantidad"
                    value={formatNumber(cantidad)}
                    onChange={e => setCantidad(cleanNumber(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                  {errores.cantidad && <span className="text-xs text-red-500">{errores.cantidad}</span>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-main mb-1">
                    Costo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="costo"
                    value={formatNumber(costo)}
                    onChange={e => setCosto(cleanNumber(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                  {errores.costo && <span className="text-xs text-red-500">{errores.costo}</span>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-main mb-1">
                    Precio Venta
                  </label>
                  <input
                    type="text"
                    name="precioVenta"
                    value={formatNumber(precioVenta)}
                    onChange={e => setPrecioVenta(cleanNumber(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                  {errores.precioVenta && <span className="text-xs text-red-500">{errores.precioVenta}</span>}
                </div>
              </div>
              <div className="text-right mt-6">
                <button
                  type="button"
                  className="bg-text-main text-white text-sm px-4 py-2 rounded-md hover:bg-primary-dark"
                  onClick={handleAddProduct}
                >
                  <i className="bi bi-plus-circle mr-2"></i>
                  Agregar a la Lista
                </button>
              </div>
            </div>

            {/* Tabla de productos en la compra */}
            <div className="mt-8">
              <h3 className="text-md font-semibold text-text-main mb-4">Lista de Compra</h3>
              <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">CÓDIGO</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">NOMBRE</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">COSTO</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">PRECIO VENTA</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700 w-24">CANTIDAD</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">IVA (%)</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">PRECIO C/IVA</th>
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
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              className="w-20 px-2 py-1 border rounded-md"
                              value={item.costo}
                              onChange={e => {
                                const value = Number(e.target.value);
                                setItemsCompra(prev => prev.map((it, i) => i === index ? { ...it, costo: value } : it));
                              }}
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              className="w-20 px-2 py-1 border rounded-md"
                              value={item.precioVenta}
                              onChange={e => {
                                const value = Number(e.target.value);
                                setItemsCompra(prev => prev.map((it, i) => i === index ? { ...it, precioVenta: value } : it));
                              }}
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="1"
                              className="w-20 px-2 py-1 border rounded-md"
                              value={item.cantidad}
                              onChange={e => handleUpdateCantidad(index, Number(e.target.value))}
                            />
                          </td>
                          <td className="py-2 px-3">{(item.iva * 100).toFixed(0)}%</td>
                          <td className="py-2 px-3">${item.precioConIva}</td>
                          <td className="py-2 px-3">${(item.costo * item.cantidad).toFixed(2)}</td>
                          <td className="py-2 px-3 text-center">
                            <button type="button" className="text-red-500 hover:text-red-700" onClick={() => handleRemoveItem(index)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center py-4 text-gray-500">Aún no hay productos en la lista.</td>
                      </tr>
                    )}
                  </tbody>
                  {itemsCompra.length > 0 && (
                    <tfoot className="bg-gray-50 border-t">
                      <tr>
                        <td colSpan="4"></td>
                        <td className="py-2 px-3 font-bold text-right">Subtotal:</td>
                        <td className="py-2 px-3 font-bold" colSpan="2">${formatNumber(subtotal)}</td>
                      </tr>
                      <tr>
                        <td colSpan="4"></td>
                        <td className="py-2 px-3 font-bold text-right">Total IVA:</td>
                        <td className="py-2 px-3 font-bold" colSpan="2">${formatNumber(totalIva)}</td>
                      </tr>
                      <tr>
                        <td colSpan="4"></td>
                        <td className="py-2 px-3 font-bold text-right text-primary">Total a Pagar:</td>
                        <td className="py-2 px-3 font-bold text-primary" colSpan="2">${formatNumber(total)}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </form>
          <div className="rounded-b-lg flex justify-end px-8 py-4">
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
              className="px-4 py-2 rounded-md bg-text-main text-white font-semibold text-sm ml-2"
            >
              Guardar Compra
            </button>
          </div>
        </div>

        {/* Footer fijo */}
      </div>
    </div>
  );
}

CreatePurchaseModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};
