import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import ServiceSelector from "./ServiceSelector";
import ProductSelector from "./ProductSelector";
import ErrorBoundary from "./ErrorBoundary";
import { validateServiceOrder, isValidEmail, validateUserDocument } from "../../../../../shared/validations";
import { createServiceOrder } from "../API/ServiceOrderService";
import usersService from "../../users/API/usersService";
import { formatNumber, formatNumberInput, parseFormattedNumber, formatPrice } from "../../../../../shared/utils/formatters";
import { DOC_TYPES_CODES, DOC_TYPE_LABELS, toBackendDocCode } from "../../../../../shared/constants/documentTypes";

const CreateServiceOrder = ({ isOpen, onClose, onCreated, services }) => {
  const [formData, setFormData] = useState({
    id_cliente: null,
    tipoDocumento: "CC",
    documento: "",
    nombre: "",
    telefono: "",
    correo: "",
    dineroProporcionado: "",
    status: "En ejecucion"
  });
  const [clienteEncontrado, setClienteEncontrado] = useState(false);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Refs para preservar posición de scroll y focus
  const scrollContainerRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const dineroInputRef = useRef(null);
  const cursorPositionRef = useRef(0);
  const wasDineroFocusedRef = useRef(false);

  // Calcular totales
  const totalServices = selectedServices.reduce((total, service) => total + (service.subtotal || 0), 0);
  const totalProducts = selectedProducts.reduce((total, product) => total + (product.subtotal || 0), 0);
  const totalGeneral = totalServices + totalProducts;

  // Validación solo cuando se envían servicios/productos (no en tiempo real)
  useEffect(() => {
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
  // Solo mostrar error cuando se intente enviar el formulario, no cuando se escriba en otros campos
  const showServiceError = showErrors && (!selectedServices || selectedServices.length === 0);

  // Restaurar posición de scroll y focus después de actualizar dineroProporcionado
  useEffect(() => {
    // Solo restaurar si el modal está abierto y el input estaba enfocado
    if (isOpen && scrollContainerRef.current && wasDineroFocusedRef.current) {
      // Usar requestAnimationFrame para restaurar después del render
      requestAnimationFrame(() => {
        // Verificar nuevamente que el modal sigue abierto
        if (isOpen && scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollPositionRef.current;
        }
        // Restaurar focus y posición del cursor en el input solo si el modal sigue abierto
        if (isOpen && dineroInputRef.current) {
          dineroInputRef.current.focus();
          // Restaurar posición del cursor
          if (dineroInputRef.current.setSelectionRange) {
            const cursorPos = Math.min(cursorPositionRef.current, dineroInputRef.current.value.length);
            dineroInputRef.current.setSelectionRange(cursorPos, cursorPos);
          }
        }
      });
    }
  }, [formData.dineroProporcionado, isOpen]);

  // Memoizar cálculo de devolución para evitar re-renders innecesarios
  const devolucion = useMemo(() => {
    const dinero = parseFormattedNumber(formData.dineroProporcionado);
    return formatPrice(Math.max(0, dinero - totalGeneral));
  }, [formData.dineroProporcionado, totalGeneral]);

  // Buscar cliente por documento y autocompletar (con debounce)
  const searchTimeoutRef = useRef(null);
  
  const lookupClientByDocument = useCallback(async (doc, clearIfNotFound = false) => {
    const cleanDoc = doc?.toString().trim();
    
    // Si el documento es muy corto, limpiar los campos si clearIfNotFound es true
    if (!cleanDoc || cleanDoc.length < 5) {
      setClienteEncontrado(false);
      if (clearIfNotFound) {
        setFormData(prev => ({
          ...prev,
          id_cliente: null,
          nombre: '',
          telefono: '',
          correo: ''
        }));
      }
      return;
    }
    
    try {
      setBuscandoCliente(true);
      console.log('🔍 Buscando cliente con documento:', cleanDoc);
      
      // Buscar usuarios - sin filtro en la petición para que el backend retorne todos
      const searchResponse = await usersService.getAll();
      
      console.log('📦 Respuesta de búsqueda:', searchResponse);
      
      if (searchResponse.success && searchResponse.data && searchResponse.data.length > 0) {
        // Buscar el usuario que coincida exactamente con el documento
        const existingUser = searchResponse.data.find(user => {
          const userDoc = user.documento?.toString().trim() || '';
          const matches = userDoc === cleanDoc;
          if (matches) {
            console.log('✅ Cliente encontrado:', user);
          }
          return matches;
        });
        
        if (existingUser) {
          console.log('🎯 Autocompletando datos del cliente:', existingUser);
          setFormData(prev => ({
            ...prev,
            id_cliente: existingUser.id_usuario || existingUser.id,
            tipoDocumento: existingUser.tipo_documento || prev.tipoDocumento || 'CC',
            nombre: existingUser.nombre || '',
            telefono: (existingUser.telefono || '').replace(/\D/g, ''),
            correo: existingUser.correo || ''
          }));
          setClienteEncontrado(true);
          setTouched(prev => ({
            ...prev,
            nombre: false,
            telefono: false,
            correo: false
          }));
        } else {
          console.log('❌ No se encontró cliente con ese documento');
          setClienteEncontrado(false);
          if (clearIfNotFound) {
            setFormData(prev => ({
              ...prev,
              id_cliente: null,
              nombre: '',
              telefono: '',
              correo: ''
            }));
          }
        }
      } else {
        console.log('⚠️ No hay datos de usuarios en la respuesta');
        setClienteEncontrado(false);
        if (clearIfNotFound) {
          setFormData(prev => ({
            ...prev,
            id_cliente: null,
            nombre: '',
            telefono: '',
            correo: ''
          }));
        }
      }
    } catch (error) {
      console.error('❌ Error buscando cliente:', error);
      setClienteEncontrado(false);
    } finally {
      setBuscandoCliente(false);
    }
  }, []);

  // Función para crear o buscar cliente
  const findOrCreateClient = useCallback(async (clientName, clientPhone, clientEmail, clientDocument) => {
    try {
      // Buscar usuario existente por documento
      const searchResponse = await usersService.getAll({ documento: clientDocument.trim() });
      
      if (searchResponse.success && searchResponse.data && searchResponse.data.length > 0) {
        const existingUser = searchResponse.data.find(user => {
          const userDoc = user.documento?.toString().trim() || '';
          return userDoc === clientDocument.trim();
        });
        
        if (existingUser) {
          return existingUser.id_usuario || existingUser.id;
        }
      }

      // Si no se encontró, crear nuevo usuario/cliente
      const generateTempPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        password += '0123456789'[Math.floor(Math.random() * 10)];
        password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
        for (let i = password.length; i < 12; i++) {
          password += chars[Math.floor(Math.random() * chars.length)];
        }
        return password.split('').sort(() => Math.random() - 0.5).join('');
      };

      const cleanName = clientName.trim();
      const cleanPhone = '+' + String(clientPhone).replace(/[^0-9]/g, '');
      const cleanEmail = clientEmail.trim();
      const cleanDocument = clientDocument.trim();
      const tempPassword = generateTempPassword();

      const newUserData = {
        nombre: cleanName,
        telefono: cleanPhone,
        correo: cleanEmail,
        contrasena: tempPassword,
        tipo_documento: toBackendDocCode(formData.tipoDocumento || 'CC'),
        documento: cleanDocument,
        roleId: 3, // Rol de cliente
        estado: 'Activo',
        sendEmail: true,
        tempPassword: tempPassword
      };

      const createResponse = await usersService.create(newUserData);
      if (createResponse.success && createResponse.data) {
        return createResponse.data.id_usuario || createResponse.data.id;
      }

      throw new Error('No se pudo crear el cliente');
    } catch (error) {
      console.error('Error en findOrCreateClient:', error);
      throw error;
    }
  }, [formData.tipoDocumento]);

  // Validar campos en tiempo real
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'tipoDocumento':
        return value ? '' : 'Tipo de documento requerido';
      case 'documento':
        return validateUserDocument(formData.tipoDocumento, value);
      case 'nombre':
        return value.trim() ? '' : 'Nombre requerido';
      case 'telefono':
        if (!value) return 'Teléfono requerido';
        if (!/^[0-9]{7,15}$/.test(value.replace(/\s/g, ''))) {
          return 'Teléfono debe tener entre 7 y 15 dígitos';
        }
        return '';
      case 'correo':
        if (!value) return 'Correo requerido';
        if (!isValidEmail(value)) return 'Correo inválido';
        return '';
      default:
        return '';
    }
  }, [formData.tipoDocumento]);

  // Reset form cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        id_cliente: null,
        tipoDocumento: "CC",
        documento: "",
        nombre: "",
        telefono: "",
        correo: "",
        dineroProporcionado: "",
        status: "En ejecucion"
      });
      setSelectedServices([]);
      setSelectedProducts([]);
      setErrors({});
      setTouched({});
      setShowErrors(false);
      setClienteEncontrado(false);
      setBuscandoCliente(false);
      // Resetear refs de scroll y focus
      scrollPositionRef.current = 0;
      cursorPositionRef.current = 0;
      wasDineroFocusedRef.current = false;
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowErrors(true);
    setTouched({
      tipoDocumento: true,
      documento: true,
      nombre: true,
      telefono: true,
      correo: true,
      dineroProporcionado: true,
    });

    // Validar todos los campos requeridos
    const fieldErrors = {};
    ['tipoDocumento', 'documento', 'nombre', 'telefono', 'correo'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) fieldErrors[field] = error;
    });

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    
    if (Object.keys(errors).length > 0 || loading) {
      return;
    }

    try {
      setLoading(true);
      
      // Buscar o crear cliente
      let clienteId;
      try {
        clienteId = await findOrCreateClient(
          formData.nombre,
          formData.telefono,
          formData.correo,
          formData.documento
        );
      } catch (error) {
        console.error('Error al buscar o crear cliente:', error);
        setLoading(false);
        return;
      }

      const orderData = {
        ...formData,
        id_cliente: clienteId,
        nombre_cliente: formData.nombre.trim(),
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
      console.error('Error al crear orden:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name === 'dineroProporcionado') {
      // Guardar posición de scroll y cursor SOLO para dinero proporcionado
      if (scrollContainerRef.current) {
        scrollPositionRef.current = scrollContainerRef.current.scrollTop;
      }
      
      // Marcar que el input estaba enfocado
      wasDineroFocusedRef.current = true;
      
      // Guardar posición del cursor antes de actualizar
      if (e.target.selectionStart !== null) {
        cursorPositionRef.current = e.target.selectionStart;
      }
      
      // Usar versión funcional de setFormData para acceder al estado más reciente
      setFormData(prev => {
        const currentValue = prev.dineroProporcionado || '';
        const cleaned = value.replace(/[^0-9]/g, '');
        
        // Si el valor actual es solo "0" y el usuario escribe un número, reemplazar
        if (currentValue === '0' && cleaned && cleaned !== '0') {
          return { ...prev, [name]: formatNumberInput(cleaned) };
        }
        return { ...prev, [name]: formatNumberInput(value) };
      });
      // NO marcar como touched para dinero proporcionado para evitar activar validación de servicios
    } else {
      // Para otros campos, simplemente actualizar sin afectar scroll
      setFormData(prev => ({ ...prev, [name]: value }));
      setTouched(prev => ({ ...prev, [name]: true }));
      
      // Búsqueda en tiempo real para el documento
      if (name === 'documento') {
        // Cancelar búsqueda anterior si existe
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
        
        // Buscar después de 500ms de inactividad (debounce)
        searchTimeoutRef.current = setTimeout(() => {
          lookupClientByDocument(value, true);
        }, 500);
      }
    }
  }, []); // Sin dependencias - usa versión funcional de setState

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validar el campo al perder foco
    if (['tipoDocumento', 'documento', 'nombre', 'telefono', 'correo'].includes(name)) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
    
    // Buscar cliente al perder foco del documento
    if (name === 'documento' && value && value.length >= 6) {
      lookupClientByDocument(value);
    }
    
    // Marcar que el input ya no está enfocado
    if (name === 'dineroProporcionado') {
      wasDineroFocusedRef.current = false;
    }
  }, [validateField, lookupClientByDocument]);

  const handleClose = useCallback(() => {
    if (!loading) {
      // Resetear refs antes de cerrar para evitar interferencias
      wasDineroFocusedRef.current = false;
      scrollPositionRef.current = 0;
      cursorPositionRef.current = 0;
      onClose();
    }
  }, [loading, onClose]);

  if (!isOpen) return null;

  return (
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
        <div 
          ref={scrollContainerRef}
          className="overflow-y-auto p-6 flex-1 bg-gray-50" 
          style={{ 
            maxHeight: 'calc(95vh - 120px)',
            scrollBehavior: 'auto' // Evitar animaciones de scroll
          }}
        >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos del Cliente */}
        <div>
          <h3 className="text-sm font-semibold text-black mb-3">Datos del Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Documento */}
            <div>
              <label className="block text-xs font-medium text-black mb-1">
                Tipo de Documento <span className="text-red-500">*</span>
              </label>
              <select
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
              >
                {DOC_TYPES_CODES.map(code => (
                  <option key={code} value={code}>
                    {code} - {DOC_TYPE_LABELS[code]}
                  </option>
                ))}
              </select>
              {(touched.tipoDocumento || showErrors) && errors.tipoDocumento && (
                <p className="text-red-600 text-xs mt-1">{errors.tipoDocumento}</p>
              )}
            </div>

            {/* Documento */}
            <div>
              <label className="block text-xs font-medium text-black mb-1">
                Número de Documento <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="documento"
                  value={formData.documento}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                  placeholder="Número de documento"
                  maxLength={20}
                />
                {buscandoCliente && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <i className="bi bi-arrow-repeat animate-spin text-primary"></i>
                  </div>
                )}
                {!buscandoCliente && clienteEncontrado && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600">
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                )}
              </div>
              {(touched.documento || showErrors) && errors.documento && (
                <p className="text-red-600 text-xs mt-1">{errors.documento}</p>
              )}
            </div>
            {/* Nombre */}
            <div>
              <label className="block text-xs font-medium text-black mb-1">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                placeholder="Nombre completo del cliente"
              />
              {(touched.nombre || showErrors) && errors.nombre && (
                <p className="text-red-600 text-xs mt-1">{errors.nombre}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-medium text-black mb-1">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                placeholder="Número de teléfono"
                maxLength={15}
              />
              {(touched.telefono || showErrors) && errors.telefono && (
                <p className="text-red-600 text-xs mt-1">{errors.telefono}</p>
              )}
            </div>

            {/* Correo */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-black mb-1">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                placeholder="correo@ejemplo.com"
              />
              {(touched.correo || showErrors) && errors.correo && (
                <p className="text-red-600 text-xs mt-1">{errors.correo}</p>
              )}
            </div>
          </div>
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border-2 rounded-xl text-sm border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white"
          >
            <option value="En ejecucion">En ejecución</option>
            <option value="Pagado">Pagado</option>
          </select>
        </div>

        {/* Servicios y Productos */}
        <div className="space-y-4">
          {/* Servicios */}
          <div>
            <label className="block text-xs font-medium text-black mb-1">
              Servicios <span className="text-red-500">*</span>
            </label>
            <ErrorBoundary>
              <ServiceSelector 
                selectedServices={selectedServices}
                onServicesChange={setSelectedServices}
              />
            </ErrorBoundary>
            {/* Mensaje de error con espacio reservado para evitar scroll */}
            <div className="min-h-[20px] mt-1">
              {showServiceError && (
                <p className="text-red-600 text-xs">Debes agregar al menos un servicio</p>
              )}
            </div>
          </div>

          {/* Productos */}
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
                  ref={dineroInputRef}
                  type="text"
                  name="dineroProporcionado"
                  value={formData.dineroProporcionado}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                    (touched.dineroProporcionado || showErrors) && errors.dineroProporcionado
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white`}
                  placeholder="0"
                />
                {(touched.dineroProporcionado || showErrors) && errors.dineroProporcionado && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <i className="bi bi-exclamation-triangle"></i>
                    {errors.dineroProporcionado}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-black mb-1">
                  Devolución
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                  {devolucion}

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
        </div>
      </div>
    </div>
  );
};

export default CreateServiceOrder;
