import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import ServiceSelector from "./ServiceSelector";
import ProductSelector from "./ProductSelector";
import ErrorBoundary from "./ErrorBoundary";
import { validateServiceOrder, isValidEmail, validateUserDocument } from "../../../../../shared/validations";
import { editServiceOrder } from "../API/ServiceOrderService";
import { formatNumber, formatNumberInput, parseFormattedNumber, formatPrice } from "../../../../../shared/utils/formatters";
import { DOC_TYPES_CODES, DOC_TYPE_LABELS, toBackendDocCode } from "../../../../../shared/constants/documentTypes";
import usersService from "../../users/API/usersService";

const EditServiceOrder = ({ isOpen, onClose, onEdited, order, services }) => {
  const [formData, setFormData] = useState({
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
      
      // Buscar usuarios con filtro en el backend para mejor rendimiento
      const searchResponse = await usersService.getAll({ documento: cleanDoc });
      
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

  // Cleanup: limpiar timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
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

  // Cargar datos del order cuando se abre el modal
  // Función para calcular tiempos de servicios existentes si no los tienen
  const ensureServiceTimes = (services) => {
    const now = new Date();
    let currentTime = now;
    
    return services.map((service, index) => {
      // Normalizar campos del backend al formato del frontend
      const duration = service.duration || service.duracion || 30;
      
      // Función para convertir hora del backend (HH:MM:SS) a formato corto (HH:MM)
      const formatTimeFromBackend = (timeStr) => {
        if (!timeStr) return null;
        const parts = timeStr.split(':');
        return `${parts[0]}:${parts[1]}`;
      };
      
      // Obtener tiempos existentes (pueden venir del backend o ya estar calculados)
      let startTime = service.startTime || formatTimeFromBackend(service.hora_inicio);
      let endTime = service.endTime || formatTimeFromBackend(service.hora_finalizacion);
      
      // Si ya tiene tiempos válidos, usarlos
      if (startTime && endTime) {
        // Parsear endTime para el siguiente servicio
        const [hours, minutes] = endTime.split(':').map(Number);
        currentTime = new Date();
        currentTime.setHours(hours, minutes, 0, 0);
        
        return {
          ...service,
          startTime: startTime,
          endTime: endTime,
          duration: duration
        };
      }
      
      // Si no tiene tiempos, calcularlos desde cero
      const startDate = new Date(currentTime);
      const endDate = new Date(currentTime.getTime() + (duration * 60000));
      
      // Formatear a HH:MM
      const formatTime = (date) => {
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
      };
      
      currentTime = endDate; // Actualizar para el siguiente servicio
      
      return {
        ...service,
        startTime: formatTime(startDate),
        endTime: formatTime(endDate),
        duration: duration
      };
    });
  };

  // Función para cargar datos del cliente desde el backend si no están en el order
  const loadClientData = useCallback(async (clientId) => {
    if (!clientId) return null;
    
    try {
      const response = await usersService.getAll();
      if (response.success && response.data) {
        const client = response.data.find(u => 
          (u.id_usuario || u.id) === clientId || 
          (u.id_usuario || u.id)?.toString() === clientId?.toString()
        );
        return client;
      }
    } catch (error) {
      console.error('Error cargando datos del cliente:', error);
    }
    return null;
  }, []);

  useEffect(() => {
    if (isOpen && order) {
      console.log('📋 Cargando datos del order:', order);
      
      // Función asíncrona para cargar todos los datos
      const loadOrderData = async () => {
        // Formatear dinero proporcionado
        const dineroProporcionado = order.dineroProporcionado || order.dinero_proporcionado || 0;
        const dineroFormateado = dineroProporcionado 
          ? formatNumberInput(dineroProporcionado.toString())
          : "";
        
        // Obtener datos del cliente - puede venir de diferentes campos
        let clienteNombre = order.clientName || order.nombre || order.cliente?.nombre || order.usuario?.nombre || "";
        let clienteDocumento = order.documento || order.cliente?.documento || order.usuario?.documento || "";
        let clienteTelefono = order.telefono || order.cliente?.telefono || order.usuario?.telefono || "";
        let clienteCorreo = order.correo || order.cliente?.correo || order.usuario?.correo || "";
        let clienteTipoDoc = order.tipoDocumento || order.tipo_documento || order.cliente?.tipo_documento || order.usuario?.tipo_documento || "CC";
        
        // Si no tenemos los datos del cliente, intentar buscarlos por id_cliente
        if ((!clienteNombre || !clienteDocumento) && order.id_cliente) {
          console.log('🔍 Buscando datos del cliente por ID:', order.id_cliente);
          const clientData = await loadClientData(order.id_cliente);
          if (clientData) {
            console.log('✅ Cliente encontrado:', clientData);
            clienteNombre = clientData.nombre || clienteNombre;
            clienteDocumento = clientData.documento || clienteDocumento;
            clienteTelefono = clientData.telefono || clienteTelefono;
            clienteCorreo = clientData.correo || clienteCorreo;
            clienteTipoDoc = clientData.tipo_documento || clienteTipoDoc;
          }
        }
        
        console.log('👤 Datos del cliente finales:', {
          nombre: clienteNombre,
          documento: clienteDocumento,
          telefono: clienteTelefono,
          correo: clienteCorreo,
          tipoDocumento: clienteTipoDoc
        });
        
        // Mapear estado del backend al frontend
        let orderStatus = order.status || "En ejecucion";
        // Si el estado viene del backend con formato diferente, mapearlo
        if (orderStatus === 'En ejecución' || orderStatus === 'En proceso') {
          orderStatus = 'En ejecucion';
        } else if (orderStatus === 'Pagada') {
          orderStatus = 'Pagado';
        } else if (orderStatus === 'Cancelada por el usuario') {
          orderStatus = 'Anulado';
        }
        
        console.log('📊 Estado de la orden:', {
          estadoOriginal: order.status,
          estadoMapeado: orderStatus,
          dineroProporcionado: dineroProporcionado
        });
        
        // Si el estado es "En ejecucion", limpiar dinero proporcionado
        const dineroFinal = orderStatus === 'Pagado' ? dineroFormateado : '';
        
        setFormData({
          tipoDocumento: clienteTipoDoc,
          documento: clienteDocumento ? clienteDocumento.toString().replace(/[^0-9]/g, '') : '',
          nombre: clienteNombre,
          telefono: clienteTelefono ? clienteTelefono.toString().replace(/[^0-9]/g, '') : '',
          correo: clienteCorreo,
          dineroProporcionado: dineroFinal,
          status: orderStatus
        });
        
        // Asegurar que los servicios tengan tiempos calculados
        const serviciosConTiempos = ensureServiceTimes(order.servicios || []);
        console.log('🔧 Servicios procesados:', serviciosConTiempos);
        
        // Obtener el id_cita del primer servicio o del order
        const citaId = order.citaId || order.id_cita || serviciosConTiempos[0]?.id_cita || null;
        console.log('📋 ID de cita relacionada:', citaId);
        
        setSelectedServices(serviciosConTiempos);
        setSelectedProducts(order.productos || []);
        setClienteEncontrado(false);
        setBuscandoCliente(false);
        
        // Limpiar errores y touched al cargar
        setErrors({});
        setTouched({});
        setShowErrors(false);
      };
      
      loadOrderData();
    }
  }, [isOpen, order, loadClientData]);

  // Validación solo cuando se envían servicios/productos (no en tiempo real)
  useEffect(() => {
    if (isOpen && (selectedServices.length > 0 || selectedProducts.length > 0)) {
      const orderData = {
        ...formData,
        servicios: selectedServices,
        productos: selectedProducts
      };
      
      const validation = validateServiceOrder(orderData, services, totalGeneral, formData.status);
      setErrors(validation.errors);
    }
  }, [selectedServices.length, selectedProducts.length, totalGeneral, services, isOpen]);

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

  // Reset form cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
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

    // Validar que si hay dinero proporcionado, el estado debe ser "Pagado"
    const dineroProporcionado = parseFormattedNumber(formData.dineroProporcionado);
    if (dineroProporcionado > 0 && formData.status !== 'Pagado') {
      fieldErrors.dineroProporcionado = 'Solo se puede registrar dinero proporcionado cuando el estado es "Pagado"';
    }

    // Validar que el dinero proporcionado sea igual al total general cuando el estado es "Pagado"
    if (formData.status === 'Pagado') {
      if (!dineroProporcionado || dineroProporcionado === 0) {
        fieldErrors.dineroProporcionado = 'El dinero proporcionado es requerido cuando el estado es "Pagado"';
      } else {
        // Redondear ambos valores a 2 decimales para comparación precisa
        const dineroRedondeado = Math.round(dineroProporcionado * 100) / 100;
        const totalRedondeado = Math.round(totalGeneral * 100) / 100;
        
        // Comparar con tolerancia de 0.01 para evitar problemas de precisión de punto flotante
        const diferencia = Math.abs(dineroRedondeado - totalRedondeado);
        if (diferencia > 0.01) {
          fieldErrors.dineroProporcionado = `El dinero proporcionado (${formatPrice(dineroProporcionado)}) debe ser igual al total general (${formatPrice(totalGeneral)})`;
        }
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    
    if (Object.keys(errors).length > 0 || loading) {
      return;
    }

    try {
      setLoading(true);
      
      // Buscar o crear cliente (en editar, normalmente ya existe)
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

      // Obtener el id_cita del order o de los servicios
      const citaId = order.citaId || order.id_cita || selectedServices[0]?.id_cita || null;
      
      const orderData = {
        ...formData,
        id: order.id,
        id_cliente: clienteId,
        nombre_cliente: formData.nombre.trim(),
        servicios: selectedServices,
        productos: selectedProducts,
        totalServices,
        totalProducts,
        totalGeneral,
        dineroProporcionado: parseFormattedNumber(formData.dineroProporcionado),
        status: formData.status, // Asegurar que el estado se incluya explícitamente
        citaId: citaId // Incluir el ID de la cita relacionada
      };
      
      console.log('📋 ID de cita para actualizar:', citaId);

      console.log('📤 Enviando orden al backend:', {
        id: orderData.id,
        status: orderData.status,
        formDataStatus: formData.status,
        servicios: orderData.servicios.length,
        totalGeneral: orderData.totalGeneral
      });

      const updatedOrder = await editServiceOrder(orderData, services);
      
      console.log('📥 Respuesta del backend:', {
        id: updatedOrder.id,
        status: updatedOrder.status,
        updatedOrder: updatedOrder
      });
      if (onEdited) onEdited(updatedOrder);
      if (onClose) onClose();
    } catch (err) {
      console.error('Error al editar orden:', err);
    } finally {
      setLoading(false);
    }
  };

  // Manejar tecla Enter para guardar cambios
  const handleKeyDown = useCallback((e) => {
    // Si se presiona Enter y no está en un textarea, select, o botón
    if (e.key === 'Enter' && 
        e.target.tagName !== 'TEXTAREA' && 
        e.target.tagName !== 'SELECT' &&
        !e.target.closest('button') &&
        !loading) {
      // Si el target es un input, prevenir el comportamiento por defecto
      // y disparar el submit del formulario haciendo clic en el botón de submit
      if (e.target.tagName === 'INPUT') {
        e.preventDefault();
        const form = e.target.closest('form');
        if (form) {
          // Buscar el botón de submit y hacer clic en él
          const submitButton = form.querySelector('button[type="submit"]');
          if (submitButton && !submitButton.disabled) {
            submitButton.click();
          }
        }
      }
    }
  }, [loading]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name === 'dineroProporcionado') {
      // Si el estado es "En ejecucion", no permitir ingresar dinero proporcionado
      setFormData(prev => {
        if (prev.status !== 'Pagado') {
          // Limpiar el error si existe
          setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            delete newErrors.dineroProporcionado;
            return newErrors;
          });
          return prev; // No actualizar el campo
        }
        
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
        
        const currentValue = prev.dineroProporcionado || '';
        // Permitir números, puntos (miles) y coma (decimal)
        const cleaned = value.replace(/[^0-9.,]/g, '');
        
        // Si el valor actual es solo "0" y el usuario escribe un número, reemplazar
        if (currentValue === '0' && cleaned && cleaned !== '0') {
          return { ...prev, [name]: formatNumberInput(cleaned, 2) };
        }
        return { ...prev, [name]: formatNumberInput(value, 2) };
      });
      // NO marcar como touched para dinero proporcionado para evitar activar validación de servicios
    } else if (name === 'status') {
      // Si cambia el estado a "En ejecucion", limpiar dinero proporcionado
      setFormData(prev => {
        if (value === 'En ejecucion' && prev.dineroProporcionado) {
          // Limpiar error si existe
          setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            delete newErrors.dineroProporcionado;
            return newErrors;
          });
          return { ...prev, [name]: value, dineroProporcionado: '' };
        }
        return { ...prev, [name]: value };
      });
      setTouched(prev => ({ ...prev, [name]: true }));
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
  }, [lookupClientByDocument]); // Sin dependencias - usa versión funcional de setState

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

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-pencil-square text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">Editar Orden de Servicio</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {/* Contenido */}
        <div 
          ref={scrollContainerRef}
          className="overflow-y-auto p-6 flex-1 bg-gray-50" 
          style={{ 
            maxHeight: 'calc(95vh - 120px)',
            scrollBehavior: 'auto' // Evitar animaciones de scroll
          }}
        >
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
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
                disabled={clienteEncontrado}
                className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${clienteEncontrado ? 'border-gray-200 bg-gray-100 cursor-not-allowed' : 'border-gray-200 hover:border-gray-300 bg-white'} focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all`}
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
                  className="w-full px-3 py-2 pr-10 border-2 rounded-xl text-sm border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white"
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
                readOnly={clienteEncontrado}
                className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${clienteEncontrado ? 'border-gray-200 bg-gray-100 cursor-not-allowed' : 'border-gray-200 hover:border-gray-300 bg-white'} focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all`}
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
                readOnly={clienteEncontrado}
                className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${clienteEncontrado ? 'border-gray-200 bg-gray-100 cursor-not-allowed' : 'border-gray-200 hover:border-gray-300 bg-white'} focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all`}
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
                readOnly={clienteEncontrado}
                className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${clienteEncontrado ? 'border-gray-200 bg-gray-100 cursor-not-allowed' : 'border-gray-200 hover:border-gray-300 bg-white'} focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all`}
                placeholder="correo@ejemplo.com"
              />
              {(touched.correo || showErrors) && errors.correo && (
                <p className="text-red-600 text-xs mt-1">{errors.correo}</p>
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
            className="w-full px-3 py-2 border-2 rounded-xl text-sm border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white"
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
          {/* Mensaje de error con espacio reservado para evitar scroll */}
          <div className="min-h-[20px] mt-1">
            {showServiceError && (
              <p className="text-red-600 text-xs">Debes agregar al menos un servicio</p>
            )}
          </div>
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
                  {formData.status !== 'Pagado' && (
                    <span className="text-gray-500 text-xs ml-2">(Solo disponible cuando el estado es "Pagado")</span>
                  )}
                </label>
                <input
                  ref={dineroInputRef}
                  type="text"
                  name="dineroProporcionado"
                  value={formData.dineroProporcionado}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={formData.status !== 'Pagado'}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 text-sm ${
                    formData.status !== 'Pagado'
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 focus:ring-gray-400 focus:border-gray-400 text-black bg-white'
                  }`}
                  placeholder="0,00"
                />
                {(touched.dineroProporcionado || showErrors) && errors.dineroProporcionado && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <i className="bi bi-exclamation-triangle"></i>
                    {errors.dineroProporcionado}
                  </p>
                )}
                {formData.status !== 'Pagado' && formData.dineroProporcionado && (
                  <p className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                    <i className="bi bi-info-circle"></i>
                    Cambia el estado a "Pagado" para registrar el dinero proporcionado
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
            className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            <i className="bi bi-x-circle"></i>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-sm font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-gray-800 border-t-transparent rounded-full"></span>
                Guardando...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle-fill"></i>
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
};

export default EditServiceOrder;
