import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import productsService from "../../products/API/productsService";

const paymentMethods = ["Efectivo", "Transferencia bancaria"];

export default function CreateSaleModal({
  isOpen,
  onClose,
  onCreate,
  customers,
  products,
}) {
  // Estado del formulario principal
  const [numeroVenta] = useState(
    `VEN-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${Math.floor(Math.random() * 900 + 100)}`
  );
  const [fechaVenta, setFechaVenta] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [clienteDoc, setClienteDoc] = useState("");
  const [cliente, setCliente] = useState({
    documentType: "",
    documentNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [metodoPago, setMetodoPago] = useState(paymentMethods[0]);

  // Estado para agregar productos a la lista
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [itemsVenta, setItemsVenta] = useState([]);
  const [errores, setErrores] = useState({});

  // Buscar cliente por documento
  useEffect(() => {
    const found = customers.find((c) => c.documentNumber === clienteDoc);
    if (found) {
      setCliente({ ...found });
    } else {
      setCliente({
        documentType: "",
        documentNumber: clienteDoc,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      });
    }
  }, [clienteDoc, customers]);

  // Calcular total
  const total = itemsVenta.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

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
    if (cantidad <= 0) {
      nuevosErrores.cantidad = "La cantidad debe ser mayor a 0.";
    }
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
    setErrores({});
    const producto = products.find(
      (p) => p.id === Number(productoSeleccionado)
    );
    if (!producto) return;

    // Validar stock disponible
    const cantidadEnVenta = itemsVenta.reduce((acc, item) => {
      if (item.id === producto.id) {
        return acc + item.cantidad;
      }
      return acc;
    }, 0);
    
    const stockDisponible = producto.cantidad - cantidadEnVenta;
    
    if (cantidad > stockDisponible) {
      setErrores({
        cantidad: `Stock insuficiente. Solo hay ${stockDisponible} unidades disponibles.`
      });
      return;
    }

    setItemsVenta((prev) => [
      ...prev,
      { ...producto, cantidad: Number(cantidad) },
    ]);
    setProductoSeleccionado("");
    setCantidad(1);
  };

  const handleRemoveItem = (index) => {
    setItemsVenta((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let nuevosErrores = {};
    if (!clienteDoc || !cliente.firstName) {
      nuevosErrores.cliente = "Debe ingresar un cliente válido.";
    }
    if (itemsVenta.length === 0) {
      nuevosErrores.items = "Debe agregar al menos un producto.";
    }
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
    setErrores({});

    // Actualizar la cantidad de los productos (decrementar stock)
    itemsVenta.forEach(async (item) => {
      const productoOriginal = products.find(p => p.id === item.id);
      if (productoOriginal) {
        try {
          await productsService.updateStock(
            item.id,
            productoOriginal.stock - item.cantidad,
            'set'
          );
        } catch (error) {
          console.error('Error updating product stock:', error);
        }
      }
    });

    const nuevaVenta = {
      id: Date.now(),
      numeroVenta,
      fecha: fechaVenta,
      clienteId:
        customers.find((c) => c.documentNumber === clienteDoc)?.id ||
        Date.now(),
      valor: total,
      estado: "Completado",
      productos: itemsVenta,
      metodoPago,
    };
    if (onCreate) onCreate(nuevaVenta);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-[#9C5B2B] m-0">
            Registrar Nueva Venta
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
          <form id="sale-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Sección de Venta */}
            <div>
              <h3 className="text-lg font-bold text-primary mb-4">
                Datos de la Venta
              </h3>
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                    <label className="block text-xs font-medium text-text-main mb-1">
                      N° Venta
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md bg-gray-200 text-sm"
                      value={numeroVenta}
                      readOnly
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-text-main mb-1">
                      Fecha de Venta
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border rounded-md text-xs"
                      value={fechaVenta}
                      onChange={(e) => setFechaVenta(e.target.value)}
                      required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-text-main mb-1">
                      Método de Pago
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    >
                      {paymentMethods.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                  </select>
                  </div>
                </div>
              </div>
            </div>
            {/* Sección de Cliente */}
            <div>
              <h3 className="text-lg font-bold text-primary mb-4">
                Datos del Cliente
              </h3>
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                    <label className="block text-xs font-medium text-text-main mb-1">
                      Documento Cliente <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      value={clienteDoc}
                      onChange={(e) => setClienteDoc(e.target.value)}
                      required
                    />
                    {errores.cliente && (
                      <span className="text-xs text-red-500">
                        {errores.cliente}
                      </span>
                    )}
                </div>
                <div>
                    <label className="block text-xs font-medium text-text-main mb-1">
                      Tipo de Documento
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md bg-gray-200 text-sm"
                      value={cliente.documentType}
                      readOnly
                    />
                </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-text-main mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md bg-gray-200 text-sm"
                      value={`${cliente.firstName} ${cliente.lastName}`.trim()}
                      readOnly
                    />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                    <label className="block text-xs font-medium text-text-main mb-1">
                      Correo
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border rounded-md bg-gray-200 text-sm"
                      value={cliente.email}
                      readOnly
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-text-main mb-1">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md bg-gray-200 text-sm"
                      value={cliente.phone}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Sección para agregar productos */}
            <div>
              <h3 className="text-lg font-bold text-primary mb-4">
                Agregar Productos
              </h3>
              <div className="p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-text-main mb-1">
                      Producto <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      value={productoSeleccionado}
                      onChange={(e) => setProductoSeleccionado(e.target.value)}
                    >
                    <option value="">Seleccionar producto</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} - Stock: {p.cantidad}
                        </option>
                      ))}
                  </select>
                    {errores.producto && (
                      <span className="text-xs text-red-500">
                        {errores.producto}
                      </span>
                    )}
                </div>
                <div>
                    <label className="block text-xs font-medium text-text-main mb-1">
                      Cantidad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cantidad"
                      value={formatNumber(cantidad)}
                      onChange={e => setCantidad(Number(cleanNumber(e.target.value)))}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                    {errores.cantidad && (
                      <span className="text-xs text-red-500">
                        {errores.cantidad}
                      </span>
                    )}
                </div>
                <div>
                    <button
                      type="button"
                      className="bg-text-main text-white text-sm px-4 py-2 rounded-md hover:bg-primary-dark mt-6 w-full"
                      onClick={handleAddProduct}
                    >
                    <i className="bi bi-plus-circle mr-2"></i>
                    Agregar a la Lista
                  </button>
                </div>
              </div>
              <div className="text-right mt-4">
                {/* Mensaje de error si no hay productos */}
                  {errores.items && (
                    <span className="text-xs text-red-500 mr-4">
                      {errores.items}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Tabla de productos en la venta */}
            <div>
              <h3 className="text-lg font-bold text-primary mb-4">
                Lista de Productos
              </h3>
              <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">
                        CÓDIGO
                      </th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">
                        NOMBRE
                      </th>
                      <th className="py-2 px-3 text-right font-semibold text-gray-700">
                        CANTIDAD
                      </th>
                      <th className="py-2 px-3 text-right font-semibold text-gray-700">
                        PRECIO
                      </th>
                      <th className="py-2 px-3 text-right font-semibold text-gray-700">
                        SUBTOTAL
                      </th>
                      <th className="py-2 px-3 text-center font-semibold text-gray-700">
                        ACCIÓN
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {itemsVenta.length > 0 ? (
                      itemsVenta.map((item, index) => (
                        <tr key={index}>
                          <td className="py-2 px-3">{item.codigo}</td>
                          <td className="py-2 px-3">{item.nombre}</td>
                          <td className="py-2 px-3 text-right">
                            {item.cantidad}
                          </td>
                          <td className="py-2 px-3 text-right">
                            ${item.precio.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right">
                            ${(item.precio * item.cantidad).toLocaleString()}
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
                        <td
                          colSpan="6"
                          className="text-center py-4 text-gray-500"
                        >
                          Aún no hay productos en la lista.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {itemsVenta.length > 0 && (
                    <tfoot className="bg-gray-50 border-t">
                      <tr>
                        <td colSpan="3"></td>
                        <td className="py-2 px-3 font-bold text-right text-lg">
                          Total:
                        </td>
                        <td className="py-2 px-3 font-bold text-lg" colSpan="2">
                          <span className="font-bold text-lg text-primary">${formatNumber(total)}</span>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </form>
          <div className=" flex justify-end px-8 py-4">
            <button
              type="button"
              className="px-4 py-2 rounded-md border text-sm"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="sale-form"
              className="px-4 py-2 rounded-md bg-text-main text-white font-semibold text-sm ml-2"
            >
              Guardar Venta
            </button>
        </div>
        </div>
      </div>
    </div>
  );
}

CreateSaleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  customers: PropTypes.array.isRequired,
  products: PropTypes.array.isRequired,
}; 
