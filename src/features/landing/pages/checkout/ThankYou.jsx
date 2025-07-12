import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ordersService from '../../../../shared/services/OrdersService';
import { jsPDF } from 'jspdf';

// Mock de clientes (idéntico al dashboard)
const customersMock = [
  { id: 1, documentType: "CC", documentNumber: "1234567890", firstName: "Juan", lastName: "Pérez", email: "juan.perez@email.com", phone: "3101234567", address: "Calle 1 #2-3", status: "Activo" },
  { id: 2, documentType: "CE", documentNumber: "0987654321", firstName: "María", lastName: "González", email: "maria.gonzalez@email.com", phone: "3157894561", address: "Carrera 4 #5-6", status: "Activo" },
  { id: 3, documentType: "CC", documentNumber: "5678901234", firstName: "Carlos", lastName: "Rodríguez", email: "carlos.rodriguez@email.com", phone: "3203216547", address: "Av. 7 #8-9", status: "Inactivo" },
  { id: 4, documentType: "TI", documentNumber: "4321098765", firstName: "Ana", lastName: "Martínez", email: "ana.martinez@email.com", phone: "3112345678", address: "Calle 10 #11-12", status: "Activo" },
  { id: 5, documentType: "CC", documentNumber: "9876543210", firstName: "Pedro", lastName: "Sánchez", email: "pedro.sanchez@email.com", phone: "3145678901", address: "Carrera 13 #14-15", status: "Activo" },
  { id: 6, documentType: "CE", documentNumber: "2345678901", firstName: "Laura", lastName: "López", email: "laura.lopez@email.com", phone: "3167890123", address: "Av. 16 #17-18", status: "Inactivo" },
];

const formatNumber = (num) => new Intl.NumberFormat('es-CO').format(num);
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
};

const ThankYou = () => {
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [estado, setEstado] = useState('En espera de confirmación de tu pago');
  const navigate = useNavigate();

  useEffect(() => {
    // Simular obtener el último pedido realizado
    const allOrders = ordersService.getAllOrders();
    if (allOrders.length === 0) {
      navigate('/landing');
      return;
    }
    const lastOrder = allOrders[0];
    setOrder(lastOrder);
    // Buscar cliente por id o documento
    let cliente = customersMock.find(c => c.id === lastOrder.clienteId || c.documentNumber === lastOrder.clienteId);
    setCustomer(cliente);
    setEstado(lastOrder.estado === 'En proceso' ? 'En proceso' : 'En espera de confirmación de tu pago');

    // Cambiar estado a 'En proceso' después de 5 segundos
    if (lastOrder.estado !== 'En proceso') {
      const timer = setTimeout(() => {
        ordersService.updateOrderStatus(lastOrder.id, 'En proceso');
        setEstado('En proceso');
        setOrder({ ...lastOrder, estado: 'En proceso' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  if (!order) return null;

  // Simular fecha estimada de entrega (hoy + 5 días)
  const fechaEntrega = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString('es-CO');
  })();

  // Generar PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Recibo de compra', 10, 15);
    doc.setFontSize(10);
    doc.text(`Pedido: ${order.numeroOrden || order.id}`, 10, 25);
    doc.text(`Estado: ${estado}`, 10, 32);
    doc.text(`Fecha estimada de entrega: ${fechaEntrega}`, 10, 39);
    doc.text('---', 10, 45);
    doc.text('Información del pedido:', 10, 52);
    doc.text(`Domicilio: ${order.direccion || ''}, ${order.ciudad || ''}, ${order.pais || ''}`, 10, 59);
    if (customer && customer.email) doc.text(`Email: ${customer.email}`, 10, 66);
    doc.text(`Forma de envío: ${order.medioPago || 'Por definir'}`, 10, 73);
    doc.text(`Pedido realizado: ${order.fecha ? formatDate(order.fecha) : '-'}`, 10, 80);
    doc.text('---', 10, 87);
    doc.text('Productos:', 10, 94);
    let y = 101;
    order.productos.forEach((prod, idx) => {
      doc.text(`- ${prod.nombre} x${prod.cantidad || 1} $${formatNumber(prod.precio)}`, 12, y);
      y += 7;
    });
    y += 2;
    doc.text(`Subtotal: $${formatNumber(order.subtotal || order.valor)}`, 10, y);
    y += 7;
    doc.text(`Total: $${formatNumber(order.valor)}`, 10, y);
    doc.save(`recibo_pedido_${order.numeroOrden || order.id}.pdf`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background py-10 px-2">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-4xl text-green-600">✔️</span>
          <div>
            <div className="text-lg text-gray-500 font-mono">{order.numeroOrden || order.id}</div>
            <h1 className="text-2xl font-bold text-text-main">Gracias por tu Compra</h1>
          </div>
          <div className="ml-auto">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-semibold shadow transition" onClick={handleDownloadPDF}>Descargar recibo</button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:justify-between text-gray-600 text-sm border-b pb-2 mb-4">
          <span>{estado}</span>
          <span>Fecha estimada de entrega {fechaEntrega}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h2 className="text-lg font-bold mb-2 text-text-main">información del pedido</h2>
            <div className="mb-2">
              <span className="font-semibold">Domicilio de entrega</span><br />
              {order.direccion && <span>{order.direccion}, </span>}
              {order.ciudad && <span>{order.ciudad}, </span>}
              {order.pais && <span>{order.pais}</span>}<br />
              {customer && customer.email && <a href={`mailto:${customer.email}`} className="text-blue-700 underline text-xs">{customer.email}</a>}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Forma de envío</span><br />
              {order.medioPago || 'Por definir'}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Pedido realizado</span><br />
              {order.fecha ? formatDate(order.fecha) : '-'}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{order.productos.length} producto{order.productos.length !== 1 ? 's' : ''} --</span>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              {order.productos.map((prod, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-gray-100 border flex items-center justify-center text-gray-400 text-2xl rounded">
                    {prod.imagen ? <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover rounded" /> : <span>✖</span>}
                  </div>
                  <span className="text-sm">{prod.nombre}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1 text-right">
              <div className="text-sm text-gray-600">subtotal: <span className="font-semibold">${formatNumber(order.subtotal || order.valor)}</span></div>
              <div className="text-base font-bold text-text-main">total: ${formatNumber(order.valor)}</div>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link to="/landing/mis-pedidos" className="inline-block bg-primary hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition">Ver mis pedidos</Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYou; 