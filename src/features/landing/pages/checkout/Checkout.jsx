import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../components/CartContext';
import ordersService from '../../pages/orders/API/OrdersService';
import shippingZonesService from '../../../dashboard/pages/shipping/API/shippingZonesService';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import OrderProgressIndicator from './components/OrderProgressIndicator';
import { formatNumber } from '../../../../shared/utils/formatters';
import { isNumberInputValid } from '../../../../shared/validations';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const user = currentUser;

  const [form, setForm] = useState({
    documentType: 'CC',
    documento: '', nombre: '', telefono: '', email: '',
    direccion: '', apto: '', ciudad: '', pais: 'Colombia',
  });

  // Estados
  const [shippingZones, setShippingZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Cargar zonas de envío
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await shippingZonesService.getAll({ includeInactive: false });
        if (response.success) {
          setShippingZones(response.data || []);
          if (response.data?.length > 0) {
            setSelectedZoneId(response.data[0].id_shipping_zone.toString());
          }
        }
      } catch (err) {
        console.error('Error fetching shipping zones:', err);
      }
    };
    fetchZones();
  }, []);

  // Autocompletar con datos del usuario autenticado
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        documentType: user.tipo_documento || 'CC',
        documento: user.numero_documento || user.documento || '',
        nombre: user.nombre || '',
        telefono: (user.telefono || '').replace('+', ''),
        email: user.correo || '',
        direccion: user.direccion || '',
        ciudad: f.ciudad || '',
        pais: 'Colombia',
      }));
    }
  }, [user]);

  // Calcular precio de envío dinámicamente
  const selectedZone = useMemo(() => 
    shippingZones.find(z => z.id_shipping_zone.toString() === selectedZoneId),
    [shippingZones, selectedZoneId]
  );
  
  const precioEnvio = selectedZone ? parseFloat(selectedZone.precio) : 0;

  // Calcular subtotal
  const subtotal = cart.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const total = subtotal + precioEnvio;

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!user || !user.id_usuario) {
      setError('Debes iniciar sesión para realizar un pedido.');
      return;
    }
  
    if (!form.direccion || !form.ciudad) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (!selectedZoneId) {
      setError('Por favor selecciona una zona de envío.');
      return;
    }
  
    if (cart.length === 0) {
      setError('El carrito está vacío.');
      return;
    }
  
    setLoading(true);
    setError('');
  
    try {
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 800));
  
      setCurrentStep(2);
      
      const orderData = {
        id_usuario: user.id_usuario,
        fecha: new Date().toISOString().split('T')[0],
        pais: form.pais,
        ciudad: form.ciudad,
        direccion_entrega: form.direccion,
        apto: form.apto,
        costo_envio: precioEnvio,
        id_shipping_zone: Number(selectedZoneId),
        productos: cart.map(p => ({
          id_producto: p.id,
          cantidad: p.cantidad,
          precio_unitario: p.precio
        }))
      };
  
      const response = await ordersService.create(orderData);
  
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 800));
  
      if (!response || !response.success) {
        throw new Error(response?.message || 'Error al crear el pedido');
      }

      setCurrentStep(4);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      clearCart();
      
      navigate('/landing/gracias', {
        state: {
          order: response.data,
          justCreated: true
        },
        replace: true
      });
    } catch (error) {
      console.error('❌ Error creating order:', error);
      setError(error.message || 'Error al procesar el pedido. Inténtalo de nuevo.');
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex flex-col items-center font-inter">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-10">
        
        {/* Formulario Izquierda */}
        <form className="flex-1 bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-black text-gray-800">Finalizar Compra</h2>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-xl font-bold transition-all text-sm"
            >
              <i className={`bi ${isEditing ? 'bi-x-lg' : 'bi-pencil-square'}`}></i>
              {isEditing ? 'Cancelar Edición' : 'Editar Datos'}
            </button>
          </div>

          <div className="space-y-8">
            {/* Sección 1: Datos Personales */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#FACC15] w-6 h-6 rounded-full flex items-center justify-center text-gray-900 text-xs font-bold">1</div>
                <h3 className="font-bold text-gray-700">Información Personal</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-500 uppercase ml-1">Tipo Documento</label>
                   <select
                    className={`w-full border rounded-xl px-4 py-3 bg-gray-50 outline-none transition-all ${isEditing ? 'focus:ring-2 focus:ring-[#FACC15] border-gray-200' : 'cursor-not-allowed border-transparent opacity-70'}`}
                    value={form.documentType}
                    onChange={e => setForm(f => ({ ...f, documentType: e.target.value }))}
                    disabled={!isEditing}
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="NIT">NIT</option>
                  </select>
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-500 uppercase ml-1">N° Documento</label>
                   <input
                    className={`w-full border rounded-xl px-4 py-3 bg-gray-50 outline-none transition-all ${isEditing ? 'focus:ring-2 focus:ring-[#FACC15] border-gray-200' : 'cursor-not-allowed border-transparent opacity-70'}`}
                    value={form.documento}
                    onChange={e => setForm(f => ({ ...f, documento: e.target.value.replace(/[^\d]/g, '') }))}
                    readOnly={!isEditing}
                    required
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                   <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre Completo</label>
                   <input
                    className={`w-full border rounded-xl px-4 py-3 bg-gray-50 outline-none transition-all ${isEditing ? 'focus:ring-2 focus:ring-[#FACC15] border-gray-200' : 'cursor-not-allowed border-transparent opacity-70'}`}
                    value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    readOnly={!isEditing}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Entrega */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#FACC15] w-6 h-6 rounded-full flex items-center justify-center text-gray-900 text-xs font-bold">2</div>
                <h3 className="font-bold text-gray-700">Dirección de Entrega</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-1">
                   <label className="text-xs font-bold text-gray-500 uppercase ml-1">Dirección Exacta</label>
                   <input 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-[#FACC15] outline-none" 
                    placeholder="Ej: Calle 10 # 5-20" 
                    value={form.direccion} 
                    onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} 
                    required 
                  />
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-500 uppercase ml-1">Ciudad</label>
                   <input 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-[#FACC15] outline-none" 
                    placeholder="Ej: Medellín" 
                    value={form.ciudad} 
                    onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))} 
                    required 
                  />
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-500 uppercase ml-1">Apartamento/Interior</label>
                   <input 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-[#FACC15] outline-none" 
                    placeholder="Opcional..." 
                    value={form.apto} 
                    onChange={e => setForm(f => ({ ...f, apto: e.target.value }))} 
                  />
                </div>
              </div>
            </div>

            {/* Sección 3: Método Envío */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#FACC15] w-6 h-6 rounded-full flex items-center justify-center text-gray-900 text-xs font-bold">3</div>
                <h3 className="font-bold text-gray-700">Zona de Envío (Domicilio)</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {shippingZones.length > 0 ? (
                  shippingZones.map(zone => (
                    <label 
                      key={zone.id_shipping_zone} 
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedZoneId === zone.id_shipping_zone.toString() ? 'border-[#FACC15] bg-yellow-50/30' : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="shipping_zone" 
                          className="w-5 h-5 text-yellow-500 focus:ring-yellow-500 border-gray-300"
                          value={zone.id_shipping_zone} 
                          checked={selectedZoneId === zone.id_shipping_zone.toString()} 
                          onChange={(e) => setSelectedZoneId(e.target.value)} 
                        />
                        <span className="font-bold text-gray-700 uppercase text-sm tracking-wide">{zone.nombre}</span>
                      </div>
                      <span className="font-black text-gray-900">{formatNumber(zone.precio)} COP</span>
                    </label>
                  ))
                ) : (
                  <p className="text-gray-400 italic text-sm text-center py-4 bg-gray-50 rounded-2xl">Cargando opciones de envío...</p>
                )}
              </div>
            </div>
          </div>
          
          {error && <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-medium text-sm flex items-center gap-2"><i className="bi bi-exclamation-triangle-fill"></i>{error}</div>}
          
          {loading && (
            <div className="mt-8">
              <OrderProgressIndicator currentStep={currentStep} />
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FACC15] to-[#F59E0B] hover:shadow-lg hover:shadow-yellow-500/30 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-gray-900 font-black py-4 rounded-2xl text-xl transition-all mt-8 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <span className="animate-spin h-6 w-6 border-4 border-gray-900 border-t-transparent rounded-full"></span>
                Procesando...
              </>
            ) : (
              <>
                <i className="bi bi-lock-fill"></i>
                Pagar Ahora ({formatNumber(total)} COP)
              </>
            )}
          </button>
        </form>
        
        {/* Resumen Derecha */}
        <div className="w-full lg:w-96 space-y-6">
          <div className="bg-gray-800 text-white rounded-3xl shadow-xl p-8 sticky top-10">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <i className="bi bi-cart3 text-yellow-400"></i>
              Resumen del Pedido
            </h2>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6 custom-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                   <div className="w-16 h-16 rounded-xl bg-white/10 flex-shrink-0 overflow-hidden border border-white/5">
                      <img src={item.url_foto || item.foto} alt={item.nombre} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{item.nombre}</p>
                      <p className="text-gray-400 text-xs">Cant: {item.cantidad}</p>
                      <p className="text-yellow-400 font-bold text-sm mt-1">{formatNumber(item.precio * item.cantidad)} COP</p>
                   </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-white/10 pt-6">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Subtotal</span>
                <span className="text-white font-medium">{formatNumber(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Costo de Envío</span>
                <span className="text-white font-medium">{formatNumber(precioEnvio)}</span>
              </div>
              <div className="flex justify-between text-xl font-black pt-4 border-t border-white/5 mt-2">
                <span className="text-white">Total</span>
                <span className="text-[#FACC15]">{formatNumber(total)}</span>
              </div>
            </div>

            <div className="mt-8 bg-white/5 p-4 rounded-2xl flex items-center gap-3">
               <i className="bi bi-shield-check text-green-400 text-2xl"></i>
               <p className="text-[10px] text-gray-400 leading-tight">Tu compra está protegida con seguridad SSL de 256 bits. Los datos de pago no se guardan en nuestros servidores.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;