import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../components/CartContext';
import ordersService from '../../../../shared/services/OrdersService';
import CustomerService from '../../../../shared/services/CustomerService';

const empresasEnvio = [
  { nombre: 'INTER rapidísimo', precio: { 'Bogotá': 13500, 'Medellín': 15000, 'default': 18000 } },
  { nombre: 'CO-ORDINADORA', precio: { 'Bogotá': 20500, 'Medellín': 22000, 'default': 25000 } },
];

const formatNumber = (num) => new Intl.NumberFormat('es-CO').format(num);

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    documentType: 'CC',
    documento: '', nombre: '', apellidos: '', telefono: '', email: '',
    empresa: '', direccion: '', apto: '', ciudad: '', pais: 'Colombia',
  });
  const [envio, setEnvio] = useState('CO-ORDINADORA');
  const [error, setError] = useState('');
  const [clienteExistente, setClienteExistente] = useState(false);

  // Autocompletar si documento existe
  const handleDocumentoBlur = () => {
    if (!form.documento) return;
    const cliente = CustomerService.findByDocument(form.documento);
    if (cliente) {
      setForm(f => ({
        ...f,
        documentType: cliente.documentType || 'CC',
        nombre: cliente.firstName,
        apellidos: cliente.lastName,
        telefono: cliente.phone,
        email: cliente.email,
        direccion: cliente.address || '',
        ciudad: cliente.city || '',
        pais: cliente.country || 'Colombia',
      }));
      setClienteExistente(true);
    } else {
      setClienteExistente(false);
    }
  };

  // Calcular precio de envío
  const envioSeleccionado = empresasEnvio.find(e => e.nombre === envio);
  const precioEnvio = envioSeleccionado
    ? envioSeleccionado.precio[form.ciudad] || envioSeleccionado.precio['default']
    : 0;

  // Calcular subtotal
  const subtotal = cart.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const total = subtotal + precioEnvio;

  // Guardar pedido y redirigir
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.documento || !form.nombre || !form.apellidos || !form.telefono || !form.direccion || !form.ciudad) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }
    // Guardar cliente si es nuevo o actualizar si existe
    let cliente = CustomerService.findByDocument(form.documento);
    if (!cliente) {
      cliente = CustomerService.add({
        documentType: form.documentType,
        documentNumber: form.documento,
        firstName: form.nombre,
        lastName: form.apellidos,
        phone: form.telefono,
        email: form.email,
        address: form.direccion,
        city: form.ciudad,
        country: form.pais,
      });
    } else {
      cliente = CustomerService.update(form.documento, {
        documentType: form.documentType,
        firstName: form.nombre,
        lastName: form.apellidos,
        phone: form.telefono,
        email: form.email,
        address: form.direccion,
        city: form.ciudad,
        country: form.pais,
      });
    }
    // Guardar pedido en "mis pedidos"
    ordersService.createOrder({
      clienteId: cliente.id,
      direccion: form.direccion,
      ciudad: form.ciudad,
      pais: form.pais,
      productos: cart.map(p => ({
        id: p.id,
        nombre: p.nombre,
        cantidad: p.cantidad,
        precio: p.precio,
        color: p.color || '',
        imagen: p.fotos && p.fotos.length > 0 ? p.fotos[0] : (p.foto || p.imagen || ''),
      })),
      subtotal,
      envio: precioEnvio,
      valor: total,
      medioPago: envio,
      estado: 'Pendiente',
    });
    clearCart();
    navigate('/landing/gracias');
  };

  return (
    <div className="min-h-screen bg-background py-10 px-2 flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
        {/* Formulario */}
        <form className="flex-1 bg-white rounded-lg shadow p-6" onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold mb-4 text-text-main">Información del cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input className="border rounded px-3 py-2" placeholder="Número identificación*" value={form.documento} onChange={e => setForm(f => ({ ...f, documento: e.target.value }))} onBlur={handleDocumentoBlur} required />
            <input className="border rounded px-3 py-2" placeholder="Nombre*" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
            <input className="border rounded px-3 py-2" placeholder="Apellidos*" value={form.apellidos} onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))} required />
            <input className="border rounded px-3 py-2" placeholder="Teléfono*" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} required />
            <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Dirección de correo" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <h2 className="text-xl font-bold mb-4 text-text-main mt-6">Dirección de Entrega</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Dirección de entrega*" value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} required />
            <input className="border rounded px-3 py-2" placeholder="Apt. (opcional)" value={form.apto} onChange={e => setForm(f => ({ ...f, apto: e.target.value }))} />
            <input className="border rounded px-3 py-2" placeholder="Ciudad*" value={form.ciudad} onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))} required />
            <input className="border rounded px-3 py-2" placeholder="País*" value={form.pais} onChange={e => setForm(f => ({ ...f, pais: e.target.value }))} required />
          </div>
          <h2 className="text-xl font-bold mb-4 text-text-main mt-6">Método de envío</h2>
          <div className="mb-6">
            {empresasEnvio.map(e => (
              <label key={e.nombre} className="flex items-center gap-2 mb-2 cursor-pointer">
                <input type="radio" name="envio" value={e.nombre} checked={envio === e.nombre} onChange={() => setEnvio(e.nombre)} />
                <span className="font-semibold">{e.nombre}</span>
                <span className="text-xs text-gray-500">${formatNumber(e.precio[form.ciudad] || e.precio['default'])} (COP)</span>
              </label>
            ))}
          </div>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-lg transition">Continuar con el pago</button>
        </form>
        {/* Resumen */}
        <div className="w-full md:w-80 bg-gray-50 rounded-lg shadow p-6 h-fit">
          <h2 className="text-lg font-bold mb-4 text-text-main">Monto a pagar</h2>
          <div className="mb-2">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm mb-1">
                <span>{item.nombre}</span>
                <span>${formatNumber(item.precio * item.cantidad)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Subtotal</span>
            <span>${formatNumber(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Envío</span>
            <span>${formatNumber(precioEnvio)}</span>
          </div>
          <div className="border-t border-gray-300 my-2"></div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${formatNumber(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 