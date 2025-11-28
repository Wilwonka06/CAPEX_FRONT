import { useState, useEffect, useCallback } from "react";
import ServiceSelector from "./ServiceSelector";
import ProductSelector from "./ProductSelector";
import ErrorBoundary from "./ErrorBoundary";
import { validateServiceOrder } from "../../../../../shared/validations";
import { createServiceOrder } from "../API/ServiceOrderService";
import usersService from "../../users/API/usersService";
import { formatNumber, formatNumberInput, parseFormattedNumber, formatPrice } from "../../../../../shared/utils/formatters";

const CreateServiceOrder = ({ isOpen, onClose, onCreated, services }) => {
  const [formData, setFormData] = useState({
    id_cliente: null,
    dineroProporcionado: "",
    status: "En ejecucion"
  });

  const [clienteDoc, setClienteDoc] = useState("");
  const [clienteEncontrado, setClienteEncontrado] = useState(false);
  const [cliente, setCliente] = useState({ id: null, documentType: "", documentNumber: "", nombre: "", email: "", phone: "" });
  const [clienteNuevo, setClienteNuevo] = useState({ nombre: "", correo: "", telefono: "", documento: "" });
  const [numero, setNumero] = useState("");
  const [buscandoCliente, setBuscandoCliente] = useState(false);

  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calcular totales
  const totalServices = selectedServices.reduce((total, service) => total + (service.subtotal || 0), 0);
  const totalProducts = selectedProducts.reduce((total, product) => total + (product.subtotal || 0), 0);
  const totalGeneral = totalServices + totalProducts;

  // Validación solo cuando se envían servicios/productos (no en tiempo real)
  useEffect(() => {
    // Solo validar cuando hay servicios o productos seleccionados
    if (selectedServices.length > 0 || selectedProducts.length > 0) {
      const orderData = {
        ...formData,
        servicios: selectedServices,
        productos: selectedProducts
      };
      
      const validation = validateServiceOrder(orderData, services, totalGeneral, formData.status);
      setErrors(validation.errors);
    }
  }, [selectedServices.length, selectedProducts.length, totalGeneral, services]);

  // Helpers para errores separados - solo servicios son obligatorios
  const showServiceError = (showErrors || touched.dineroProporcionado) && (!selectedServices || selectedServices.length === 0);
  // Los productos son opcionales, no se muestran errores

  // Reset form cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        id_cliente: null,
        dineroProporcionado: "",
        status: "En ejecucion"
      });
      setClienteDoc("");
      setClienteEncontrado(false);
      setCliente({ id: null, documentType: "", documentNumber: "", nombre: "", email: "", phone: "" });
      setClienteNuevo({ nombre: "", correo: "", telefono: "", documento: "" });
      setNumero("");
      setBuscandoCliente(false);
      setSelectedServices([]);
      setSelectedProducts([]);
      setErrors({});
      setTouched({});
      setShowErrors(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const buscarCliente = async () => {
      if (!clienteDoc || clienteDoc.trim().length < 8) {
        setClienteEncontrado(false);
        setCliente({ id: null, documentType: "", documentNumber: clienteDoc, nombre: "", email: "", phone: "" });
        setClienteNuevo({ nombre: "", correo: "", telefono: "", documento: clienteDoc });
        return;
      }
      setBuscandoCliente(true);
      try {
        const response = await usersService.getAll({ documento: clienteDoc.trim() });
        if (response.success && Array.isArray(response.data)) {
          const usuarioEncontrado = response.data.find(u => (u.documento || '').toString().trim() === clienteDoc.trim());
          if (usuarioEncontrado) {
            const idc = usuarioEncontrado.id_usuario || usuarioEncontrado.id;
            setCliente({
              id: idc,
              documentType: usuarioEncontrado.tipo_documento || 'Cedula de ciudadania',
              documentNumber: usuarioEncontrado.documento || '',
              nombre: usuarioEncontrado.nombre || '',
              email: usuarioEncontrado.correo || '',
              phone: usuarioEncontrado.telefono || '',
            });
            setClienteEncontrado(true);
            setFormData(prev => ({ ...prev, id_cliente: idc }));
          } else {
            setClienteEncontrado(false);
            setCliente({ id: null, documentType: "", documentNumber: clienteDoc, nombre: "", email: "", phone: "" });
            setClienteNuevo({ nombre: "", correo: "", telefono: "", documento: clienteDoc });
          }
        } else {
          setClienteEncontrado(false);
          setCliente({ id: null, documentType: "", documentNumber: clienteDoc, nombre: "", email: "", phone: "" });
          setClienteNuevo({ nombre: "", correo: "", telefono: "", documento: clienteDoc });
        }
      } catch (error) {
        setClienteEncontrado(false);
        setCliente({ id: null, documentType: "", documentNumber: clienteDoc, nombre: "", email: "", phone: "" });
        setClienteNuevo({ nombre: "", correo: "", telefono: "", documento: clienteDoc });
      } finally {
        setBuscandoCliente(false);
      }
    };
    const timeoutId = setTimeout(buscarCliente, 500);
    return () => clearTimeout(timeoutId);
  }, [clienteDoc]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowErrors(true);
    setTouched({
      dineroProporcionado: true,
      // Agrega aquí otros campos si los hay
    });
    
    if (Object.keys(errors).length > 0 || loading) {
      return;
    }

    try {
      setLoading(true);
      let clienteId = formData.id_cliente;
      if (!clienteId) {
        if (!clienteEncontrado) {
          if (!clienteDoc || clienteDoc.trim().length < 8) {
            return;
          }
          const newUserData = {
            nombre: clienteNuevo.nombre.trim(),
            telefono: '+' + numero,
            correo: clienteNuevo.correo.trim(),
            tipo_documento: 'Cedula de ciudadania',
            documento: clienteDoc.trim(),
            roleId: 2,
          };
          const createResponse = await usersService.create(newUserData);
          clienteId = createResponse?.data?.id_usuario || createResponse?.data?.id;
        } else {
          clienteId = cliente.id;
        }
      }

      const orderData = {
        ...formData,
        id_cliente: clienteId,
        servicios: selectedServices,
        productos: selectedProducts,
        totalServices,
        totalProducts,
        totalGeneral,
        dineroProporcionado: parseFormattedNumber(formData.dineroProporcionado)
      };

      const newOrder = await createServiceOrder(orderData, services);
      if (onCreated) onCreated(newOrder);
      if (onClose) onClose();
    } catch (err) {
      // Silenciar, validación visual se maneja en la UI de página
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    const newVal = name === 'dineroProporcionado' ? formatNumberInput(value) : value;
    setFormData(prev => ({ ...prev, [name]: newVal }));
    // Solo marcar como tocado, no validar en tiempo real
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    // No validar en tiempo real para evitar re-renderizados
  }, []);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const CreateOrderCard = ({ children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-receipt text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">Crear Orden de Servicio</h2>
          </div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={handleClose} aria-label="Cerrar" disabled={loading}>×</button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <CreateOrderCard>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <div>
          <label className="block text-xs font-medium text-black mb-1">Documento Cliente <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="relative">
              <input
                type="text"
                value={clienteDoc}
                onChange={(e) => setClienteDoc(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Número de documento"
                required
              />
              {buscandoCliente && (
                <div className="absolute right-2 top-2">
                  <i className="bi bi-arrow-repeat animate-spin text-primary"></i>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-black mb-1">Nombre</label>
              {clienteEncontrado ? (
                <input type="text" value={cliente.nombre} className="w-full px-3 py-2 border rounded-md bg-gray-200 text-sm" readOnly />
              ) : (
                <input type="text" value={clienteNuevo.nombre} onChange={(e) => setClienteNuevo(prev => ({ ...prev, nombre: e.target.value }))} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="Nombre completo" required />
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-black mb-1">Teléfono</label>
              {clienteEncontrado ? (
                <input type="text" value={cliente.phone} className="w-full px-3 py-2 border rounded-md bg-gray-200 text-sm" readOnly />
              ) : (
                <input type="text" value={numero} onChange={(e) => setNumero(e.target.value.replace(/[^0-9]/g, ''))} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="Ej: 3001234567" required />
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-black mb-1">Correo</label>
              {clienteEncontrado ? (
                <input type="email" value={cliente.email} className="w-full px-3 py-2 border rounded-md bg-gray-200 text-sm" readOnly />
              ) : (
                <input type="email" value={clienteNuevo.correo} onChange={(e) => setClienteNuevo(prev => ({ ...prev, correo: e.target.value }))} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="correo@ejemplo.com" required />
              )}
            </div>
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-xs font-medium text-black mb-1">
            Estado
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
          >
            <option value="En ejecucion">En ejecución</option>
            <option value="Pagado">Pagado</option>
          </select>
        </div>

        {/* Servicios */}
        <div>
          <label className="block text-xs font-medium text-black mb-1">
            Servicios
          </label>
          <ErrorBoundary>
            <ServiceSelector 
              selectedServices={selectedServices}
              onServicesChange={setSelectedServices}
            />
          </ErrorBoundary>
          {showServiceError && (
            <p className="text-red-600 text-xs mt-1">Debes agregar al menos un servicio</p>
          )}
        </div>

        {/* Productos - Opcionales */}
        <div>
          <label className="block text-xs font-medium text-black mb-1">
            Productos (Opcional)
          </label>
          <ErrorBoundary>
            <ProductSelector 
              selectedProducts={selectedProducts}
              onProductsChange={setSelectedProducts}
            />
          </ErrorBoundary>
        </div>

        {/* Resumen de totales */}
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4 text-accent">Resumen de Venta</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-black">Total Servicios:</span>
                <span className="text-blue-600 font-bold">{formatPrice(totalServices)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium text-black">Total Productos:</span>
                <span className="text-green-600 font-bold">{formatPrice(totalProducts)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-black">Total General:</span>
                <span className="text-primary font-bold">{formatPrice(totalGeneral)}</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-black mb-1">
                  Dinero Proporcionado
                </label>
                <input
                  type="text"
                  name="dineroProporcionado"
                  value={formData.dineroProporcionado}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                  placeholder="0"
                />
                {(touched.dineroProporcionado || showErrors) && errors.dineroProporcionado && (
                  <p className="text-red-600 text-xs mt-1">{errors.dineroProporcionado}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-black mb-1">
                  Devolución
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                  {formatPrice(Math.max(0, parseFormattedNumber(formData.dineroProporcionado) - totalGeneral))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                Creando...
              </>
            ) : (
              'Crear Orden'
            )}
          </button>
        </div>
      </form>
    </CreateOrderCard>
  );
};

export default CreateServiceOrder;