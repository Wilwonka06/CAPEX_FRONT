import { useState } from "react";
import CreateSaleModal from "./components/CreateSaleModal";
import SaleDetailModal from "./components/SaleDetailModal";
import SalesTable from './components/SalesTable';
import { useSales } from "./context/SalesContext";

// Mock de clientes (idéntico a customers)
const customersMock = [
  { id: 1, documentType: "CC", documentNumber: "1234567890", firstName: "Juan", lastName: "Pérez", email: "juan.perez@email.com", phone: "3101234567", address: "Calle 1 #2-3", status: "Activo" },
  { id: 2, documentType: "CE", documentNumber: "0987654321", firstName: "María", lastName: "González", email: "maria.gonzalez@email.com", phone: "3157894561", address: "Carrera 4 #5-6", status: "Activo" },
  { id: 3, documentType: "CC", documentNumber: "5678901234", firstName: "Carlos", lastName: "Rodríguez", email: "carlos.rodriguez@email.com", phone: "3203216547", address: "Av. 7 #8-9", status: "Inactivo" },
  { id: 4, documentType: "TI", documentNumber: "4321098765", firstName: "Ana", lastName: "Martínez", email: "ana.martinez@email.com", phone: "3112345678", address: "Calle 10 #11-12", status: "Activo" },
  { id: 5, documentType: "CC", documentNumber: "9876543210", firstName: "Pedro", lastName: "Sánchez", email: "pedro.sanchez@email.com", phone: "3145678901", address: "Carrera 13 #14-15", status: "Activo" },
  { id: 6, documentType: "CE", documentNumber: "2345678901", firstName: "Laura", lastName: "López", email: "laura.lopez@email.com", phone: "3167890123", address: "Av. 16 #17-18", status: "Inactivo" },
];

// Mock de productos
const productsMock = [
  { id: 101, codigo: "P001", nombre: "Producto Alpha", precio: 150 },
  { id: 102, codigo: "P002", nombre: "Producto Beta", precio: 280 },
  { id: 103, codigo: "P003", nombre: "Producto Gamma", precio: 90 },
];

export default function SalesProductPage() {
  const { sales, setSales } = useSales();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailSale, setDetailSale] = useState(null);

  // Búsqueda
  const filteredSales = sales.filter((sale) => {
    const cliente = customersMock.find(c => c.id === sale.clienteId);
    const nombreCompleto = cliente ? `${cliente.firstName} ${cliente.lastName}` : "";
    return (
      sale.numeroVenta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.clienteId.toString().includes(searchTerm) ||
      sale.fecha.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.valor.toString().includes(searchTerm) ||

      nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Paginación
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredSales.slice(startIndex, startIndex + itemsPerPage);

  // Anular venta
  const handleAnularVenta = (id) => {
    setSales(prev => prev.map(s => s.id === id ? { ...s, estado: "Cancelado" } : s));
  };

  // Crear venta
  const handleCreateSale = (nuevaVenta) => {
    setSales(prev => [nuevaVenta, ...prev]);
    setIsCreateOpen(false);
  };

  // Descargar factura (PDF simulado)
  const handleDownloadFactura = (venta) => {
    //genera un PDF simple usando window.print
    const win = window.open('', '', 'width=800,height=600');
    win.document.write(`<h1>Factura Venta: ${venta.numeroVenta}</h1>`);
    win.document.write(`<p>Cliente: ${customersMock.find(c => c.id === venta.clienteId)?.firstName || ''} ${customersMock.find(c => c.id === venta.clienteId)?.lastName || ''}</p>`);
    win.document.write(`<p>Fecha: ${venta.fecha}</p>`);
    win.document.write(`<p>Método de pago: ${venta.metodoPago}</p>`);
    win.document.write('<table border="1" style="width:100%;border-collapse:collapse;"><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr>');
    venta.productos.forEach(prod => {
      win.document.write(`<tr><td>${prod.nombre}</td><td>${prod.cantidad}</td><td>${prod.precio}</td><td>${prod.precio * prod.cantidad}</td></tr>`);
    });
    win.document.write('</table>');
    win.document.write(`<h3>Total: $${venta.valor}</h3>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Ventas de Productos</h1>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 w-full">
              <input
                type="text"
                placeholder="Buscar por orden o cliente..."
                className="w-full px-3 py-2 border rounded-md text-sm flex-1"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md flex items-center whitespace-nowrap" onClick={() => setIsCreateOpen(true)}>
                <i className="bi bi-plus-circle mr-2"></i> Registrar venta
              </button>
            </div>
            {/* Tabla de ventas */}
            <SalesTable
              sales={paginatedSales}
              customers={customersMock}
              onView={setDetailSale}
              onAnnul={handleAnularVenta}
              onDownload={handleDownloadFactura}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
      {/* Modal de crear venta */}
      <CreateSaleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateSale}
        customers={customersMock}
        products={productsMock}
      />
      {/* Modal de detalle */}
      <SaleDetailModal
        sale={detailSale}
        customer={detailSale ? customersMock.find(c => c.id === detailSale.clienteId) : null}
        isOpen={!!detailSale}
        onClose={() => setDetailSale(null)}
      />
    </div>
  );
}

export { customersMock };