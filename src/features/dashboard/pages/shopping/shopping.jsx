import { useState } from "react";
import SearchProduct from '../../../../shared/Search';
import CreatePurchaseModal from './components/CreatePurchaseModal';
import PurchaseDetailModal from './components/PurchaseDetailModal';
import PurchasesTable from './components/PurchasesTable';

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

export default function Shopping() {
  const [purchases, setPurchases] = useState(mockPurchases);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailCompra, setDetailCompra] = useState(null);

  // Filtro de búsqueda
  const filteredPurchases = purchases.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.id && p.id.toString().includes(term)) ||
      (p.fechaRegistro && p.fechaRegistro.toLowerCase().includes(term)) ||
      (p.fechaCompra && p.fechaCompra.toLowerCase().includes(term)) ||
      (p.proveedor && p.proveedor.toLowerCase().includes(term)) ||
      (p.nit && p.nit.toLowerCase().includes(term)) ||
      (p.total && p.total.toString().includes(term)) ||
      (p.estado && p.estado.toLowerCase().includes(term))
    );
  });

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

  // Función para crear una nueva compra
  const handleCreatePurchase = (newPurchase) => {
    setPurchases(prevPurchases => [newPurchase, ...prevPurchases]);
    setIsCreateOpen(false);
  };

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Gestión de Compras</h1>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchProduct onSearch={setSearchTerm} placeholder="Buscar compras..." />
              <button className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md flex items-center" onClick={() => setIsCreateOpen(true)}>
                <i className="bi bi-plus-circle mr-2"></i> Registrar compra
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2.5 rounded-lg shadow-md flex items-center" onClick={handleDownloadExcel}>
                <i className="bi bi-file-earmark-excel "></i>
              </button>
            </div>
            {/* Tabla de compras */}
            <PurchasesTable
              purchases={paginatedPurchases}
              onView={setDetailCompra}
              onAnnul={handleAnularCompra}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
      {/* Modal de crear compra */}
      <CreatePurchaseModal 
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreatePurchase}
      />
      {/* Modal de detalle de compra */}
      <PurchaseDetailModal 
        compra={detailCompra} 
        isOpen={!!detailCompra} 
        onClose={() => setDetailCompra(null)} 
      />
    </div>
  );
}
