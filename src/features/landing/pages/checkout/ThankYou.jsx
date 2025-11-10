import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ordersService from '../../pages/orders/API/OrdersService';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { jsPDF } from 'jspdf';

import { formatNumber } from '../../../../shared/utils/formatters';
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Imagen por defecto para productos sin imagen (similar a usuarios)
const getDefaultProductImage = (productName = "Product") => {
  const name = encodeURIComponent(productName || "Product");
  return `https://ui-avatars.com/api/?name=${name}&background=9C5B2B&color=fff&size=128&bold=true`;
};

const ThankYou = () => {
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const loadOrderData = async () => {
      if (!user || !user.id_usuario) {
        navigate('/landing');
        return;
      }

      try {
        setLoading(true);
        
        // ✅ Primero intentar obtener el pedido del state de navegación
        const passedOrder = location.state?.order;
        const justCreated = location.state?.justCreated;

        console.log('📍 Location state:', location.state);
        console.log('📦 Passed order:', passedOrder);

        let orderData = null;

        if (passedOrder && justCreated) {
          // ✅ Usar el pedido que acaba de ser creado
          console.log('✅ Usando pedido recién creado');
          orderData = passedOrder;
        } else {
          // ✅ Si no hay pedido pasado, obtener el último del backend
          console.log('📡 Obteniendo último pedido del backend...');
          const response = await ordersService.getByUsuario(user.id_usuario, {
            page: 1,
            limit: 1
          });

          console.log('📦 Respuesta de pedidos:', response);

          if (response.success && response.data && response.data.length > 0) {
            orderData = response.data[0];
          } else {
            throw new Error('No se encontraron pedidos');
          }
        }

        if (!orderData) {
          throw new Error('No se pudo cargar la información del pedido');
        }

        // ✅ Formatear el pedido para mostrar
        const formattedOrder = {
          id: orderData.id_pedido,
          numeroOrden: `PED-${orderData.id_pedido.toString().padStart(6, '0')}`,
          fecha: orderData.fecha,
          estado: orderData.estado || 'Pendiente',
          valor: parseFloat(orderData.total || 0),
          subtotal: parseFloat(orderData.total || 0),
          productos: (orderData.detalles || []).map(det => ({
            id: det.id_producto,
            nombre: det.producto?.nombre || 'Producto',
            imagen: det.producto?.url_foto || '/placeholder.png',
            cantidad: det.cantidad,
            precio: parseFloat(det.precio_unitario || 0)
          })),
          direccion: user.direccion || 'No especificada',
          ciudad: 'N/A',
          pais: 'Colombia'
        };

        setOrder(formattedOrder);
        
        // Datos del cliente
        setCustomer({
          firstName: user.nombre || 'Cliente',
          lastName: user.apellido || '',
          documentType: user.tipo_documento || 'CC',
          documentNumber: user.documento || 'N/A',
          email: user.correo || 'N/A',
          phone: user.telefono || 'N/A',
          address: user.direccion || 'N/A'
        });

        // Actualizar estado después de 5 segundos si está pendiente
        if (formattedOrder.estado === 'Pendiente') {
          setTimeout(async () => {
            try {
              await ordersService.changeStatus(formattedOrder.id, 'En proceso');
              setOrder(prev => ({ ...prev, estado: 'En proceso' }));
            } catch (err) {
              console.error('Error actualizando estado:', err);
            }
          }, 5000);
        }

      } catch (err) {
        console.error('❌ Error cargando pedido:', err);
        setError(err.message || 'Error al cargar el pedido');
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();
  }, [navigate, user, location.state]);

  // Generar PDF
  const handleDownloadPDF = () => {
    if (!order) return;

    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text('RECIBO DE COMPRA', 105, 20, { align: 'center' });
    
    // Línea separadora
    doc.setDrawColor(250, 204, 21);
    doc.setLineWidth(1);
    doc.line(20, 25, 190, 25);
    
    // Información del pedido
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Pedido: ${order.numeroOrden}`, 20, 35);
    doc.text(`Estado: ${order.estado}`, 20, 42);
    doc.text(`Fecha: ${formatDate(order.fecha)}`, 20, 49);
    
    // Información del cliente
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Información del Cliente', 20, 62);
    doc.setFontSize(10);
    doc.setTextColor(0);
    if (customer) {
      doc.text(`Nombre: ${customer.firstName} ${customer.lastName}`, 20, 70);
      doc.text(`Documento: ${customer.documentType} ${customer.documentNumber}`, 20, 77);
      doc.text(`Email: ${customer.email}`, 20, 84);
      doc.text(`Teléfono: ${customer.phone}`, 20, 91);
      doc.text(`Dirección: ${customer.address}`, 20, 98);
    }
    
    // Productos
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Productos', 20, 113);
    
    let yPos = 123;
    doc.setFontSize(10);
    doc.setTextColor(0);
    
    order.productos.forEach((prod, idx) => {
      const subtotal = prod.precio * prod.cantidad;
      doc.text(`${idx + 1}. ${prod.nombre}`, 20, yPos);
      doc.text(`x${prod.cantidad}`, 130, yPos);
      doc.text(`$${formatNumber(prod.precio)}`, 150, yPos);
      doc.text(`$${formatNumber(subtotal)}`, 170, yPos, { align: 'right' });
      yPos += 7;
    });
    
    // Total
    yPos += 5;
    doc.setDrawColor(200);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('TOTAL:', 130, yPos);
    doc.setFontSize(16);
    doc.setTextColor(250, 204, 21);
    doc.text(`$${formatNumber(order.valor)}`, 190, yPos, { align: 'right' });
    
    // Pie de página
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Gracias por su compra', 105, 280, { align: 'center' });
    
    doc.save(`recibo_pedido_${order.numeroOrden}.pdf`);
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 py-10 px-2 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FACC15] mb-4"></div>
        <p className="text-gray-600 text-lg">Cargando información del pedido...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 py-10 px-2 flex flex-col items-center justify-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar el pedido</h2>
        <p className="text-gray-600 mb-6">{error || 'No se pudo obtener la información del pedido'}</p>
        <div className="flex gap-4">
          <Link 
            to="/landing/mis-pedidos" 
            className="bg-[#FACC15] hover:bg-yellow-400 text-[#1E1E1E] font-bold py-3 px-8 rounded-full text-lg transition shadow-lg"
          >
            Ver mis pedidos
          </Link>
          <Link 
            to="/landing" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-full text-lg transition"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Fecha estimada de entrega (5 días después)
  const fechaEntrega = (() => {
    const d = new Date(order.fecha);
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString('es-CO');
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 py-10 px-2 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center">
        {/* Icono de éxito */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-[#1E1E1E] text-center">
          ¡Gracias por tu compra!
        </h1>
        
        <p className="text-gray-700 text-lg mb-2 text-center">
          Tu pedido <span className="font-bold text-[#FACC15]">{order.numeroOrden}</span> ha sido registrado exitosamente.
        </p>
        
        <p className="text-gray-600 mb-6 text-center">
          Fecha estimada de entrega: <span className="font-semibold">{fechaEntrega}</span>
        </p>

        {/* Botón para descargar PDF */}
        <button
          onClick={handleDownloadPDF}
          className="mb-6 bg-[#FACC15] hover:bg-yellow-400 text-[#1E1E1E] font-bold py-3 px-6 rounded-full text-base transition shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Descargar recibo en PDF
        </button>

        {/* Resumen del pedido */}
        <div className="w-full bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-gray-800">
              {order.productos.length} producto{order.productos.length !== 1 ? 's' : ''}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              order.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
              order.estado === 'En proceso' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {order.estado}
            </span>
          </div>
          
          <div className="space-y-3 mb-4">
            {order.productos.map((prod, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white border-2 border-[#FACC15] flex items-center justify-center rounded-xl shadow overflow-hidden">
                  <img 
                    src={
                      (prod.fotos && prod.fotos.length > 0 && prod.fotos[0])
                        ? prod.fotos[0]
                        : (prod.imagen || prod.foto || getDefaultProductImage(prod.nombre))
                    }
                    alt={prod.nombre} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = getDefaultProductImage(prod.nombre);
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-base text-[#1E1E1E] font-medium">{prod.nombre}</div>
                  <div className="text-sm text-gray-500">Cantidad: {prod.cantidad}</div>
                </div>
                <div className="text-base font-semibold text-gray-800">
                  ${formatNumber(prod.precio * prod.cantidad)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Subtotal:</span>
              <span className="font-semibold">${formatNumber(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-[#FACC15] mt-2">
              <span>Total:</span>
              <span>${formatNumber(order.valor)}</span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link 
            to="/landing/mis-pedidos" 
            className="flex-1 text-center bg-[#FACC15] hover:bg-yellow-400 text-[#1E1E1E] font-bold py-3 px-8 rounded-full text-lg transition shadow-lg"
          >
            Ver mis pedidos
          </Link>
          <Link 
            to="/landing" 
            className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-full text-lg transition"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;