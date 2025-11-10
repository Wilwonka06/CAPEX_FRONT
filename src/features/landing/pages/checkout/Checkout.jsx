import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../components/CartContext';
import ordersService from '../../pages/orders/API/OrdersService';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import OrderProgressIndicator from './components/OrderProgressIndicator';
import { formatNumber } from '../../../../shared/utils/formatters';

const empresasEnvio = [
  { nombre: 'INTER rapidísimo', precio: { 'Bogotá': 13500, 'Medellín': 15000, 'default': 18000 } },
  { nombre: 'CO-ORDINADORA', precio: { 'Bogotá': 20500, 'Medellín': 22000, 'default': 25000 } },
];

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const user = currentUser;

  const [form, setForm] = useState({
    documentType: 'CC',
    documento: '', nombre: '', apellidos: '', telefono: '', email: '',
    empresa: '', direccion: '', apto: '', ciudad: '', pais: 'Colombia',
  });

  // Estados para edición de información del cliente
  const [isEditing, setIsEditing] = useState(false);
  const [envio, setEnvio] = useState('CO-ORDINADORA');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Autocompletar con datos del usuario autenticado
  useEffect(() => {
    if (user) {
      console.log('Usuario en checkout:', user);
      setForm(f => ({
        ...f,
        documentType: user.tipo_documento || 'CC',
        documento: user.numero_documento || user.documento || '',
        nombre: user.nombre || '',
        apellidos: user.apellido || '',
        telefono: user.telefono || '',
        email: user.correo || '',
        direccion: user.direccion || '',
        ciudad: '',
        pais: 'Colombia',
      }));
    } else {
      console.log('No hay usuario en checkout');
    }
  }, [user]);

  // Calcular precio de envío
  const envioSeleccionado = empresasEnvio.find(e => e.nombre === envio);
  const precioEnvio = envioSeleccionado
    ? envioSeleccionado.precio[form.ciudad] || envioSeleccionado.precio['default']
    : 0;

  // Calcular subtotal
  const subtotal = cart.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const total = subtotal + precioEnvio;

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // ✅ Validación mejorada del usuario
    if (!user || !user.id_usuario) {
      setError('Debes iniciar sesión para realizar un pedido.');
      console.error('❌ Usuario no autenticado o sin ID:', user);
      return;
    }
  
    if (!form.direccion || !form.ciudad) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }
  
    if (cart.length === 0) {
      setError('El carrito está vacío.');
      return;
    }
  
    setLoading(true);
    setError('');
    setCurrentStep(1);
  
    try {
      // Paso 1: Validando datos
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      // Paso 2: Creando pedido
      setCurrentStep(2);
      
      const orderData = {
        id_usuario: user.id_usuario,
        fecha: new Date().toISOString().split('T')[0],
        pais: form.pais,
        ciudad: form.ciudad,
        direccion_entrega: form.direccion,
        apto: form.apto,
        productos: cart.map(p => ({
          id_producto: p.id,
          cantidad: p.cantidad,
          precio_unitario: p.precio
        }))
      };
  
      console.log('📦 Datos del pedido:', orderData);
  
      const response = await ordersService.create(orderData);
  
      // Paso 3: Procesando pago
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      if (response.success) {
        setCurrentStep(4);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        clearCart();
        
        // ✅ Pasar el pedido creado a través del state de navegación
        navigate('/landing/gracias', {
          state: {
            order: response.data,
            justCreated: true
          }
        });
      } else {
        throw new Error(response.message || 'Error al crear el pedido');
      }
    } catch (error) {
      console.error('❌ Error creating order:', error);
      setError(error.message || 'Error al procesar el pedido. Inténtalo de nuevo.');
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 py-10 px-2 flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
        {/* Formulario */}
        <form className="flex-1 bg-white rounded-2xl shadow-lg p-8" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1E1E1E]">Información del cliente</h2>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-[#FACC15] hover:bg-yellow-400 text-[#1E1E1E] rounded-lg font-medium transition-colors"
            >
              {isEditing ? 'Cancelar edición' : 'Editar información'}
            </button>
          </div>

          {isEditing ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Modo edición:</strong> Puedes actualizar tu información personal.
                Los cambios se guardarán automáticamente al procesar el pedido.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Los datos se cargan automáticamente desde tu cuenta.
                Si necesitas actualizar tu información, haz clic en "Editar información".
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de documento</label>
              <select
                className={`border rounded-lg px-3 py-3 w-full ${isEditing ? 'bg-white focus:ring-2 focus:ring-[#FACC15]' : 'bg-gray-100 cursor-not-allowed'}`}
                value={form.documentType}
                onChange={e => setForm(f => ({ ...f, documentType: e.target.value }))}
                disabled={!isEditing}
              >
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="NIT">NIT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de documento*</label>
              <input
                className={`border rounded-lg px-3 py-3 w-full ${isEditing ? 'bg-white focus:ring-2 focus:ring-[#FACC15]' : 'bg-gray-100 cursor-not-allowed'}`}
                placeholder="Número identificación*"
                value={form.documento}
                onChange={e => setForm(f => ({ ...f, documento: e.target.value }))}
                readOnly={!isEditing}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre*</label>
              <input
                className={`border rounded-lg px-3 py-3 w-full ${isEditing ? 'bg-white focus:ring-2 focus:ring-[#FACC15]' : 'bg-gray-100 cursor-not-allowed'}`}
                placeholder="Nombre*"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                readOnly={!isEditing}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
              <input
                className={`border rounded-lg px-3 py-3 w-full ${isEditing ? 'bg-white focus:ring-2 focus:ring-[#FACC15]' : 'bg-gray-100 cursor-not-allowed'}`}
                placeholder="Apellidos"
                value={form.apellidos}
                onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))}
                readOnly={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono*</label>
              <input
                className={`border rounded-lg px-3 py-3 w-full ${isEditing ? 'bg-white focus:ring-2 focus:ring-[#FACC15]' : 'bg-gray-100 cursor-not-allowed'}`}
                placeholder="Teléfono*"
                value={form.telefono}
                onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                readOnly={!isEditing}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de correo*</label>
              <input
                type="email"
                className={`border rounded-lg px-3 py-3 w-full ${isEditing ? 'bg-white focus:ring-2 focus:ring-[#FACC15]' : 'bg-gray-100 cursor-not-allowed'}`}
                placeholder="Dirección de correo*"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                readOnly={!isEditing}
                required
              />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-4 text-[#1E1E1E] mt-6">Dirección de Entrega</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input className="border rounded-lg px-3 py-3 md:col-span-2 bg-gray-50 focus:ring-2 focus:ring-[#FACC15]" placeholder="Dirección de entrega*" value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} required />
            <input className="border rounded-lg px-3 py-3 bg-gray-50 focus:ring-2 focus:ring-[#FACC15]" placeholder="Apt. (opcional)" value={form.apto} onChange={e => setForm(f => ({ ...f, apto: e.target.value }))} />
            <input className="border rounded-lg px-3 py-3 bg-gray-50 focus:ring-2 focus:ring-[#FACC15]" placeholder="Ciudad*" value={form.ciudad} onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))} required />
            <input className="border rounded-lg px-3 py-3 bg-gray-50 focus:ring-2 focus:ring-[#FACC15]" placeholder="País*" value={form.pais} onChange={e => setForm(f => ({ ...f, pais: e.target.value }))} required />
          </div>
          <h2 className="text-xl font-bold mb-4 text-[#1E1E1E] mt-6">Método de envío</h2>
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
          
          {loading && (
            <div className="mb-6">
              <OrderProgressIndicator currentStep={currentStep} />
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FACC15] hover:bg-yellow-400 disabled:bg-gray-400 disabled:cursor-not-allowed text-[#1E1E1E] font-bold py-3 rounded-full text-lg transition mt-4 shadow-lg"
          >
            {loading ? 'Procesando pedido...' : 'Continuar con el pago'}
          </button>
        </form>
        
        {/* Resumen */}
        <div className="w-full md:w-80 bg-white rounded-2xl shadow-lg p-6 h-fit">
          <h2 className="text-lg font-bold mb-4 text-[#1E1E1E]">Monto a pagar</h2>
          <div className="mb-2 divide-y divide-gray-100">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm py-2">
                <span>{item.nombre}</span>
                <span>${formatNumber(item.precio * item.cantidad)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm mb-1 mt-4">
            <span>Subtotal</span>
            <span>${formatNumber(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Envío</span>
            <span>${formatNumber(precioEnvio)}</span>
          </div>
          <div className="border-t border-gray-200 my-2"></div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-[#FACC15]">${formatNumber(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;