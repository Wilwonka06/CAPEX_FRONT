import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import productsService from "../../products/API/productsService";
import usersService from "../../users/API/usersService";
import { formatNumber, formatNumberInput, parseFormattedNumber } from "../../../../../shared/utils/formatters";
import toast from "react-hot-toast";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../../users/components/phoneinput-search.css';

const paymentMethods = ["Efectivo", "Transferencia bancaria"];

export default function CreateSaleModal({
  isOpen,
  onClose,
  onCreate,
  customers,
  products,
}) {
  // Estado del formulario principal  
  const [numeroVenta] = useState(
    `VEN-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${Math.floor(Math.random() * 900 + 100)}`
  );
  const [fechaVenta, setFechaVenta] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [clienteDoc, setClienteDoc] = useState("");
  const [cliente, setCliente] = useState({
    id: null,
    documentType: "",
    documentNumber: "",
    nombre: "",
    // Mantener firstName y lastName para retrocompatibilidad
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [clienteNuevo, setClienteNuevo] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    documento: "",
  });
  const [numero, setNumero] = useState("");
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState(false);
  const [metodoPago, setMetodoPago] = useState(paymentMethods[0]);

  // Estado para agregar productos a la lista
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [itemsVenta, setItemsVenta] = useState([]);
  const [errores, setErrores] = useState({});

  // Buscar cliente por documento en el backend
  useEffect(() => {
    const buscarCliente = async () => {
      if (!clienteDoc || clienteDoc.trim().length < 8) {
        setClienteEncontrado(false);
        setCliente({
          id: null,
          documentType: "",
          documentNumber: clienteDoc,
          nombre: "",
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
        });
        setClienteNuevo({
          nombre: "",
          correo: "",
          telefono: "",
          documento: clienteDoc,
        });
        return;
      }

      setBuscandoCliente(true);
      try {
        const response = await usersService.getAll({
          documento: clienteDoc.trim()
        });

        if (response.success && response.data && response.data.length > 0) {
          const usuarioEncontrado = response.data.find(user => {
            const userDoc = user.documento?.toString().trim() || '';
            return userDoc === clienteDoc.trim();
          });

          if (usuarioEncontrado) {
            setCliente({
              id: usuarioEncontrado.id_usuario || usuarioEncontrado.id,
              documentType: usuarioEncontrado.tipo_documento || 'Cedula de ciudadania',
              documentNumber: usuarioEncontrado.documento || '',
              nombre: usuarioEncontrado.nombre || '',
              // Mantener firstName y lastName para retrocompatibilidad
              firstName: usuarioEncontrado.nombre ? usuarioEncontrado.nombre.split(' ')[0] : '',
              lastName: usuarioEncontrado.nombre ? usuarioEncontrado.nombre.split(' ').slice(1).join(' ') : '',
              email: usuarioEncontrado.correo || '',
              phone: usuarioEncontrado.telefono || '',
            });
            setClienteEncontrado(true);
          } else {
            setClienteEncontrado(false);
            setCliente({
              id: null,
              documentType: "",
              documentNumber: clienteDoc,
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
            });
            setClienteNuevo({
              nombre: "",
              correo: "",
              telefono: "",
              documento: clienteDoc,
            });
          }
        } else {
          setClienteEncontrado(false);
          setCliente({
            id: null,
            documentType: "",
            documentNumber: clienteDoc,
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
          });
          setClienteNuevo({
            nombre: "",
            correo: "",
            telefono: "",
            documento: clienteDoc,
          });
          setNumero("");
        }
      } catch (error) {
        console.error('Error buscando cliente:', error);
        setClienteEncontrado(false);
        setCliente({
          id: null,
          documentType: "",
          documentNumber: clienteDoc,
          nombre: "",
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
        });
        setClienteNuevo({
          nombre: "",
          correo: "",
          telefono: "",
          documento: clienteDoc,
        });
      } finally {
        setBuscandoCliente(false);
      }
    };

    // Debounce para evitar búsquedas excesivas
    const timeoutId = setTimeout(buscarCliente, 500);
    return () => clearTimeout(timeoutId);
  }, [clienteDoc]);

  // Calcular total
  const total = itemsVenta.reduce(
    (acc, item) => acc + (parseFormattedNumber(item.precio) || 0) * (item.cantidad || 0),
    0
  );

  // Usar cleanNumber del formatters (reemplaza puntos y otros caracteres)
  const cleanNumber = (str) => {
    if (!str) return '';
    return str.toString().replace(/[^0-9]/g, '');
  };

  const handleAddProduct = () => {
    let nuevosErrores = {};
    if (!productoSeleccionado) {
      nuevosErrores.producto = "Seleccione un producto.";
    }
    if (cantidad <= 0) {
      nuevosErrores.cantidad = "La cantidad debe ser mayor a 0.";
    }
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
    setErrores({});
    const producto = products.find(
      (p) => p.id === Number(productoSeleccionado)
    );
    if (!producto) return;

    // Validar stock disponible
    const cantidadEnVenta = itemsVenta.reduce((acc, item) => {
      if (item.id === producto.id) {
        return acc + item.cantidad;
      }
      return acc;
    }, 0);
    
    const stockDisponible = producto.cantidad - cantidadEnVenta;
    
    if (cantidad > stockDisponible) {
      setErrores({
        cantidad: `Stock insuficiente. Solo hay ${stockDisponible} unidades disponibles.`
      });
      return;
    }

    setItemsVenta((prev) => [
      ...prev,
      { ...producto, cantidad: Number(cantidad), precio: formatNumberInput(String(producto.precio || producto.precio_venta || 0)) },
    ]);
    setProductoSeleccionado("");
    setCantidad(1);
  };

  const handleRemoveItem = (index) => {
    setItemsVenta((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let nuevosErrores = {};

    // Validar cliente
    if (!clienteDoc || clienteDoc.trim().length < 8) {
      nuevosErrores.cliente = "Debe ingresar un número de documento válido (mínimo 8 dígitos).";
    }

    // Si no se encontró cliente, validar datos para crear uno nuevo
    if (!clienteEncontrado && clienteDoc) {
      if (!clienteNuevo.nombre || clienteNuevo.nombre.trim() === '') {
        nuevosErrores.nombre = "El nombre del cliente es requerido.";
      }
      if (!clienteNuevo.correo || clienteNuevo.correo.trim() === '') {
        nuevosErrores.correo = "El correo electrónico es requerido.";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(clienteNuevo.correo)) {
          nuevosErrores.correo = "El correo electrónico no es válido.";
        }
      }
      if (!numero || numero.trim() === '') {
        nuevosErrores.telefono = "El teléfono es requerido.";
      } else if (numero.length < 7 || numero.length > 15) {
        nuevosErrores.telefono = "El teléfono debe tener entre 7 y 15 dígitos.";
      }
    }

    if (itemsVenta.length === 0) {
      nuevosErrores.items = "Debe agregar al menos un producto.";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
    setErrores({});

    try {
      let clienteId = cliente.id;

      // Si no se encontró cliente, crear uno nuevo
      if (!clienteEncontrado) {
        toast.loading('Creando cliente...', { id: 'creating-client' });
        
        // Generar contraseña temporal
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

        const tempPassword = generateTempPassword();

        const newUserData = {
          nombre: clienteNuevo.nombre.trim(),
          telefono: '+' + numero,
          correo: clienteNuevo.correo.trim(),
          contrasena: tempPassword,
          tipo_documento: 'CC',
          documento: clienteNuevo.documento.trim(),
          roleId: 2, // Rol de cliente
          estado: 'Activo',
          sendEmail: true,
          tempPassword: tempPassword
        };

        const createResponse = await usersService.create(newUserData);
        
        if (createResponse.success && createResponse.data) {
          clienteId = createResponse.data.id_usuario || createResponse.data.id;
          toast.success('Cliente creado exitosamente', { id: 'creating-client' });
        } else {
          throw new Error('No se pudo crear el cliente');
        }
      }

      if (!clienteId) {
        throw new Error('No se pudo obtener el ID del cliente');
      }

      // Crear la venta
      const nuevaVenta = {
        fecha: fechaVenta,
        clienteId: clienteId,
        valor: total,
        estado: "Completado",
        productos: itemsVenta.map(item => ({
          id: item.id,
          cantidad: item.cantidad,
          precio: parseFormattedNumber(item.precio)
        })),
        metodoPago,
      };

      if (onCreate) {
        await onCreate(nuevaVenta);
      }
      onClose();
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      toast.error(error.message || 'Error al procesar la venta');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="bi bi-bag-plus text-lg"></i></div><h2 className="text-xl font-bold m-0">Crear Nueva Venta</h2></div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          <form id="sale-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Sección de Venta */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700">
                Datos de la Venta
              </h3>
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      N° Venta
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border-2 rounded-xl text-sm bg-gray-200 border-gray-200"
                      value={numeroVenta}
                      readOnly
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Fecha de Venta
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border-2 rounded-xl text-sm border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white"
                      value={fechaVenta}
                      onChange={(e) => setFechaVenta(e.target.value)}
                      required
                      max={new Date().toISOString().slice(0, 10)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Método de Pago
                    </label>
                    <select
                      className="w-full px-3 py-2 border-2 rounded-xl text-sm border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white"
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    >
                      {paymentMethods.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                  </select>
                  </div>
                </div>
              </div>
            </div>
            {/* Sección de Cliente */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700">
                Datos del Cliente
              </h3>
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Documento Cliente <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-3 py-2 border-2 rounded-xl text-sm border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white"
                        value={clienteDoc}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setClienteDoc(val);
                        }}
                        maxLength={15}
                        placeholder="Número de documento"
                        required
                      />
                      {buscandoCliente && (
                        <div className="absolute right-2 top-2">
                          <i className="bi bi-arrow-repeat animate-spin text-primary"></i>
                        </div>
                      )}
                      {!buscandoCliente && clienteEncontrado && (
                        <div className="absolute right-2 top-2 text-green-500">
                          <i className="bi bi-check-circle"></i>
                        </div>
                      )}
                    </div>
                    {errores.cliente && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="bi bi-exclamation-triangle"></i>
                        {errores.cliente}
                      </p>
                    )}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tipo de Documento
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border-2 rounded-xl text-sm bg-gray-200 border-gray-200"
                      value={cliente.documentType || 'Cedula de ciudadania'}
                      readOnly
                    />
                </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nombre Completo
                    </label>
                    {clienteEncontrado ? (
                      <input
                        type="text"
                        className="w-full px-3 py-2 border-2 rounded-xl text-sm bg-gray-200 border-gray-200"
                        value={cliente.nombre || `${cliente.firstName} ${cliente.lastName}`.trim() || ''}
                        readOnly
                      />
                    ) : (
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${errores.nombre ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white`}
                        value={clienteNuevo.nombre}
                        onChange={(e) => setClienteNuevo({ ...clienteNuevo, nombre: e.target.value })}
                        placeholder="Nombre completo del cliente"
                        required={!clienteEncontrado}
                      />
                    )}
                    {errores.nombre && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="bi bi-exclamation-triangle"></i>
                        {errores.nombre}
                      </p>
                    )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Correo <span className="text-red-500">{!clienteEncontrado ? '*' : ''}</span>
                    </label>
                    {clienteEncontrado ? (
                      <input
                        type="email"
                        className="w-full px-3 py-2 border-2 rounded-xl text-sm bg-gray-200 border-gray-200"
                        value={cliente.email}
                        readOnly
                      />
                    ) : (
                      <input
                        type="email"
                        className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${errores.correo ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white`}
                        value={clienteNuevo.correo}
                        onChange={(e) => setClienteNuevo({ ...clienteNuevo, correo: e.target.value })}
                        placeholder="correo@ejemplo.com"
                        required={!clienteEncontrado}
                      />
                    )}
                    {errores.correo && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="bi bi-exclamation-triangle"></i>
                        {errores.correo}
                      </p>
                    )}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Teléfono <span className="text-red-500">{!clienteEncontrado ? '*' : ''}</span>
                    </label>
                    {clienteEncontrado ? (
                      <input
                        type="text"
                        className="w-full px-3 py-2 border-2 rounded-xl text-sm bg-gray-200 border-gray-200"
                        value={cliente.phone}
                        readOnly
                      />
                    ) : (
                      <PhoneInput
                        country={'co'}
                        value={numero}
                        onChange={(value) => {
                          setNumero(value);
                          if (errores.telefono) {
                            setErrores(prev => {
                              const newErrores = { ...prev };
                              if (value && value.length >= 7 && value.length <= 15) {
                                delete newErrores.telefono;
                              }
                              return newErrores;
                            });
                          }
                        }}
                        inputClass={`w-full px-3 py-2 border rounded-md text-sm ${errores.telefono ? 'border-red-500' : 'border-gray-300'}`}
                        containerClass="w-full"
                        inputProps={{
                          name: 'telefono',
                          required: !clienteEncontrado,
                          placeholder: 'Ej: 3001234567',
                        }}
                        specialLabel=""
                      />
                    )}
                    {errores.telefono && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="bi bi-exclamation-triangle"></i>
                        {errores.telefono}
                      </p>
                    )}
                  </div>
                  {!clienteEncontrado && (
                    <div className="flex items-end">
                      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-xs">
                        <i className="bi bi-info-circle mr-1"></i>
                        Cliente no encontrado. Se creará automáticamente.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Sección para agregar productos */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700">
                Agregar Productos
              </h3>
              <div className="p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Producto <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border-2 rounded-xl text-sm border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white"
                      value={productoSeleccionado}
                      onChange={(e) => setProductoSeleccionado(e.target.value)}
                    >
                        <option value="">Seleccionar producto</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} - Stock: {formatNumber(p.cantidad || 0)}
                        </option>
                      ))}
                  </select>
                    {errores.producto && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="bi bi-exclamation-triangle"></i>
                        {errores.producto}
                      </p>
                    )}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Cantidad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cantidad"
                      value={formatNumber(cantidad)}
                      onChange={e => setCantidad(Number(cleanNumber(e.target.value)))}
                      className="w-full px-3 py-2 border-2 rounded-xl text-sm border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white"
                    />
                    {errores.cantidad && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="bi bi-exclamation-triangle"></i>
                        {errores.cantidad}
                      </p>
                    )}
                </div>
                <div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all font-semibold text-sm flex items-center gap-2 mt-6 w-full"
                      onClick={handleAddProduct}
                    >
                    <i className="bi bi-plus-circle mr-2"></i>
                    Agregar a la Lista
                  </button>
                </div>
              </div>
              <div className="text-right mt-4">
                {/* Mensaje de error si no hay productos */}
                  {errores.items && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 mr-4">
                      <i className="bi bi-exclamation-triangle"></i>
                      {errores.items}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Tabla de productos en la venta */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700">
                Lista de Productos
              </h3>
              <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">
                        CÓDIGO
                      </th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">
                        NOMBRE
                      </th>
                      <th className="py-2 px-3 text-right font-semibold text-gray-700">
                        CANTIDAD
                      </th>
                      <th className="py-2 px-3 text-right font-semibold text-gray-700">
                        PRECIO
                      </th>
                      <th className="py-2 px-3 text-right font-semibold text-gray-700">
                        SUBTOTAL
                      </th>
                      <th className="py-2 px-3 text-center font-semibold text-gray-700">
                        ACCIÓN
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {itemsVenta.length > 0 ? (
                      itemsVenta.map((item, index) => (
                        <tr key={index}>
                          <td className="py-2 px-3">{item.codigo}</td>
                          <td className="py-2 px-3">{item.nombre}</td>
                          <td className="py-2 px-3 text-right">
                            {formatNumber(item.cantidad)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            ${formatNumber(item.precio || 0)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            ${formatNumber((item.precio || 0) * (item.cantidad || 0))}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-4 text-gray-500"
                        >
                          Aún no hay productos en la lista.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {itemsVenta.length > 0 && (
                    <tfoot className="bg-gray-50 border-t">
                      <tr>
                        <td colSpan="3"></td>
                        <td className="py-2 px-3 font-bold text-right text-lg">
                          Total:
                        </td>
                        <td className="py-2 px-3 font-bold text-lg" colSpan="2">
                          <span className="font-bold text-lg text-primary">${formatNumber(total)}</span>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </form>
        </div>
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button type="button" className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-sm hover:bg-gray-50 transition-all duration-200 flex items-center gap-2" onClick={onClose}><i className="bi bi-x-circle"></i>Cancelar</button>
          <button type="submit" form="sale-form" className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-sm font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 ml-2"><i className="bi bi-check-circle"></i>Guardar Venta</button>
        </div>
      </div>
    </div>
  );
}

CreateSaleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  products: PropTypes.array.isRequired,
};
