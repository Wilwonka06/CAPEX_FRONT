import { useState } from "react";
import Paginator from '../../../../shared/Paginator';
import PropTypes from "prop-types";
import SearchProduct from '../../../../shared/Search';

// Mock de proveedores y productos para selects
// const mockSuppliers = [ ... ];
// const mockProducts = [ ... ];

const mockPurchases = [
  {
    id: 1,
    fechaRegistro: "2024-06-10",
    fechaCompra: "2024-06-09",
    proveedor: "Distribuidora Capilar S.A.",
    nit: "1234567-8",
    total: 500,
    estado: "Registrada",
    productos: [
      { id: 1, descripcion: "Shampoo Nutritivo", cantidad: 10, iva: 0.12, precioBase: 100, precioVenta: 120 },
    ],
  },
  {
    id: 2,
    fechaRegistro: "2024-06-08",
    fechaCompra: "2024-06-07",
    proveedor: "Proveedora Belleza MX",
    nit: "9876543-2",
    total: 300,
    estado: "Anulada",
    productos: [
      { id: 2, descripcion: "Acondicionador Suavizante", cantidad: 5, iva: 0.12, precioBase: 80, precioVenta: 95 },
    ],
  },
  // ...más registros
];

const suppliersList = [
  { id: 1, nombre: "Distribuidora Capilar S.A.", nit: "1234567-8" },
  { id: 2, nombre: "Proveedora Belleza MX", nit: "9876543-2" },
];
const productsList = [
  { id: 1, descripcion: "Shampoo Nutritivo", iva: 0.12, precioBase: 100, precioVenta: 120 },
  { id: 2, descripcion: "Acondicionador Suavizante", iva: 0.12, precioBase: 80, precioVenta: 95 },
];

export default function Shopping() {
  const [purchases, setPurchases] = useState(mockPurchases);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailCompra, setDetailCompra] = useState(null);

  // Filtro de búsqueda
  const filteredPurchases = purchases.filter((p) =>
    p.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nit.includes(searchTerm) ||
    p.estado.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPurchases = filteredPurchases.slice(startIndex, startIndex + itemsPerPage);

  // Descargar Excel (últimos 10 registros)
  const handleDownloadExcel = () => {
    const last10 = purchases.slice(-10);
    const csv = [
      ["ID", "Fecha Registro", "Fecha Compra", "Proveedor", "NIT", "Total", "Estado"],
      ...last10.map(p => [p.id, p.fechaRegistro, p.fechaCompra, p.proveedor, p.nit, p.total, p.estado])
    ].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compras_ultimos10.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Función para anular compra
  const handleAnularCompra = (id) => {
    setPurchases(prev => prev.map(c => c.id === id ? { ...c, estado: "Anulada" } : c));
  };

  // Modal de crear compra
  function CreatePurchaseModal({ isOpen, onClose, onCreate }) {
    const [fechaRegistro, setFechaRegistro] = useState(new Date().toISOString().slice(0, 10));
    const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().slice(0, 10));
    const [proveedorId, setProveedorId] = useState("");
    const [productos, setProductos] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState("");
    const [cantidad, setCantidad] = useState(1);

    // Obtener proveedor seleccionado
    const proveedor = suppliersList.find(s => s.id === Number(proveedorId));
    const nit = proveedor ? proveedor.nit : "";

    // Calcular totales
    const subtotal = productos.reduce((acc, p) => acc + p.precioBase * p.cantidad, 0);
    const totalIVA = productos.reduce((acc, p) => acc + (p.precioBase * p.cantidad * p.iva), 0);
    const total = subtotal + totalIVA;

    // Agregar producto a la lista
    const handleAddProduct = () => {
      const prod = productsList.find(p => p.id === Number(productoSeleccionado));
      if (!prod) return;
      setProductos(prev => [
        ...prev,
        {
          ...prod,
          cantidad: Number(cantidad),
        },
      ]);
      setProductoSeleccionado("");
      setCantidad(1);
    };

    // Modificar producto en la lista
    const handleProductChange = (idx, field, value) => {
      setProductos(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
    };

    // Eliminar producto
    const handleRemoveProduct = (idx) => {
      setProductos(prev => prev.filter((_, i) => i !== idx));
    };

    // Guardar compra
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!proveedorId || productos.length === 0) return;
      const nuevaCompra = {
        id: Date.now(),
        fechaRegistro,
        fechaCompra,
        proveedor: proveedor.nombre,
        nit,
        productos,
        total: total.toFixed(2),
        estado: "Registrada",
      };
      onCreate(nuevaCompra);
      onClose();
    };

    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
          <button className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold" onClick={onClose} aria-label="Cerrar">×</button>
          <h2 className="text-xl font-bold mb-4 text-primary">Registrar compra</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Registro</label>
                <input type="date" className="w-full px-3 py-2 border rounded-md" value={fechaRegistro} onChange={e => setFechaRegistro(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Compra</label>
                <input type="date" className="w-full px-3 py-2 border rounded-md" value={fechaCompra} onChange={e => setFechaCompra(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Proveedor</label>
                <select className="w-full px-3 py-2 border rounded-md" value={proveedorId} onChange={e => setProveedorId(e.target.value)} required>
                  <option value="">Seleccione proveedor</option>
                  {suppliersList.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">NIT</label>
                <input type="text" className="w-full px-3 py-2 border rounded-md bg-gray-100" value={nit} readOnly />
              </div>
            </div>
            {/* Productos en la compra */}
            <div className="border rounded-md p-4 mt-2">
              <div className="flex gap-2 mb-2">
                <select className="flex-1 px-2 py-1 border rounded-md" value={productoSeleccionado} onChange={e => setProductoSeleccionado(e.target.value)}>
                  <option value="">Agregar producto...</option>
                  {productsList.map(p => <option key={p.id} value={p.id}>{p.descripcion}</option>)}
                </select>
                <input type="number" min="1" className="w-24 px-2 py-1 border rounded-md" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="Cantidad" />
                <button type="button" className="bg-primary text-white px-3 py-1 rounded-md" onClick={handleAddProduct}>Agregar</button>
              </div>
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 py-1">ID</th>
                    <th className="px-2 py-1">Descripción</th>
                    <th className="px-2 py-1">Cantidad</th>
                    <th className="px-2 py-1">IVA</th>
                    <th className="px-2 py-1">Costo</th>
                    <th className="px-2 py-1">Precio Venta</th>
                    <th className="px-2 py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-1">{p.id}</td>
                      <td className="px-2 py-1">{p.descripcion}</td>
                      <td className="px-2 py-1">
                        <input type="number" min="1" className="w-16 px-1 py-0.5 border rounded-md" value={p.cantidad} onChange={e => handleProductChange(idx, "cantidad", Number(e.target.value))} />
                      </td>
                      <td className="px-2 py-1">
                        <input type="number" step="0.01" min="0" max="1" className="w-16 px-1 py-0.5 border rounded-md" value={p.iva} onChange={e => handleProductChange(idx, "iva", Number(e.target.value))} />
                      </td>
                      <td className="px-2 py-1">
                        <input type="number" min="0" className="w-20 px-1 py-0.5 border rounded-md" value={p.precioBase} onChange={e => handleProductChange(idx, "precioBase", Number(e.target.value))} />
                      </td>
                      <td className="px-2 py-1">
                        <input type="number" min="0" className="w-20 px-1 py-0.5 border rounded-md" value={p.precioVenta} onChange={e => handleProductChange(idx, "precioVenta", Number(e.target.value))} />
                      </td>
                      <td className="px-2 py-1">
                        <button type="button" className="text-red-500" onClick={() => handleRemoveProduct(idx)} title="Eliminar"><i className="bi bi-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Totales */}
            <div className="flex flex-col md:flex-row gap-4 justify-end mt-4">
              <div className="flex-1"></div>
              <div className="space-y-1 text-right">
                <div>Subtotal: <span className="font-semibold">${subtotal.toFixed(2)}</span></div>
                <div>IVA: <span className="font-semibold">${totalIVA.toFixed(2)}</span></div>
                <div>Total: <span className="font-bold text-primary">${total.toFixed(2)}</span></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" className="px-4 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={onClose}>Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary-dark">Guardar compra</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  CreatePurchaseModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired,
  };

  // Modal de ver detalle
  function PurchaseDetailModal({ compra, isOpen, onClose }) {
    if (!isOpen || !compra) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
          <button className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold" onClick={onClose} aria-label="Cerrar">×</button>
          <h2 className="text-xl font-bold mb-4 text-primary">Detalle de compra</h2>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">ID</div>
              <div className="font-semibold">{compra.id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Fecha de Registro</div>
              <div className="font-semibold">{compra.fechaRegistro}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Fecha de Compra</div>
              <div className="font-semibold">{compra.fechaCompra}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Proveedor</div>
              <div className="font-semibold">{compra.proveedor}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">NIT</div>
              <div className="font-semibold">{compra.nit}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Estado</div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${compra.estado === 'Registrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{compra.estado}</span>
            </div>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-2">Productos</div>
            <table className="min-w-full text-xs border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 py-1">ID</th>
                  <th className="px-2 py-1">Descripción</th>
                  <th className="px-2 py-1">Cantidad</th>
                  <th className="px-2 py-1">IVA</th>
                  <th className="px-2 py-1">Costo</th>
                  <th className="px-2 py-1">Precio Venta</th>
                </tr>
              </thead>
              <tbody>
                {compra.productos.map((p, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-1">{p.id}</td>
                    <td className="px-2 py-1">{p.descripcion}</td>
                    <td className="px-2 py-1">{p.cantidad}</td>
                    <td className="px-2 py-1">{(p.iva * 100).toFixed(0)}%</td>
                    <td className="px-2 py-1">${p.precioBase}</td>
                    <td className="px-2 py-1">${p.precioVenta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-end mt-4">
            <div className="flex-1"></div>
            <div className="space-y-1 text-right">
              <div>Subtotal: <span className="font-semibold">${compra.productos.reduce((acc, p) => acc + p.precioBase * p.cantidad, 0).toFixed(2)}</span></div>
              <div>IVA: <span className="font-semibold">${compra.productos.reduce((acc, p) => acc + (p.precioBase * p.cantidad * p.iva), 0).toFixed(2)}</span></div>
              <div>Total: <span className="font-bold text-primary">${compra.total}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  PurchaseDetailModal.propTypes = {
    compra: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Gestión de Compras</h1>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchProduct placeholder="Buscar compras..." />
              <button className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md flex items-center" onClick={() => setIsCreateOpen(true)}>
                <i className="bi bi-plus-circle mr-2"></i> Registrar compra
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2.5 rounded-lg shadow-md flex items-center" onClick={handleDownloadExcel}>
                <i className="bi bi-file-earmark-excel "></i>
              </button>
            </div>
            {/* Tabla de compras */}
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha Registro</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha Compra</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Proveedor</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedPurchases.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-4 text-xs font-medium text-gray-900">{p.id}</td>
                      <td className="py-4 px-4 text-xs text-gray-600">{p.fechaRegistro}</td>
                      <td className="py-4 px-4 text-xs text-gray-600">{p.fechaCompra}</td>
                      <td className="py-4 px-4 text-xs text-gray-600">{p.proveedor}</td>
                      <td className="py-4 px-4 text-xs text-gray-600 font-semibold">${p.total}</td>
                      <td className="py-4 px-4 text-xs text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.estado === 'Registrada' ? ' text-green-800' : ' text-red-800'}`}>{p.estado}</span>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-right">
                        <div className="flex justify-end space-x-2">
                          <button className="h-8 w-8 p-0 hover:bg-gray-50 hover:border-blue-300 rounded-md flex items-center justify-center transition-colors" title="Ver detalles" onClick={() => setDetailCompra(p)}>
                            <i className="bi bi-eye text-primary text-sm"></i>
                          </button>
                          {p.estado !== 'Anulada' && (
                            <button className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300 rounded-md flex items-center justify-center transition-colors" title="Anular" onClick={() => handleAnularCompra(p.id)}>
                              <i className="bi bi-x-octagon text-red-500 text-sm"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Paginador */}
            {totalPages > 1 && (
              <Paginator currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </div>
        </div>
      </div>
      {/* Modal de crear compra */}
      <CreatePurchaseModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={compra => setPurchases(prev => [compra, ...prev])} />
      {/* Modal de detalle de compra */}
      <PurchaseDetailModal compra={detailCompra} isOpen={!!detailCompra} onClose={() => setDetailCompra(null)} />
    </div>
  );
}
