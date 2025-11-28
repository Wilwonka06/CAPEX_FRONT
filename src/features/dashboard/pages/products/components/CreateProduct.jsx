import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  isDuplicateProductName,
  isNumberInputValid,
  isValidNumber,
  isValidDecimal,
} from "../../../../../shared/validations";
import categoriesService from '../../CatProducts/API/categoriesService';
import characteristicsService from '../API/characteristicsService';
import { 
  compressImageToBase64, 
  validateFileSize, 
  validateFileType 
} from '../../../../../shared/utils/imagesUploadHelper';
import toast from 'react-hot-toast';
import productsService from '../API/productsService';
import { formatNumber, cleanNumber, parseFormattedNumber } from '../../../../../shared/utils/formatters';

const MAX_IMAGES = 3;

const CreateProduct = ({ onCreate, products = [], isOpen: externalOpen = undefined, onClose: externalOnClose }) => {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [characteristics, setCharacteristics] = useState([]);
  const [characteristicsLoading, setCharacteristicsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    cantidad: "",
    categoryId: "",
    costo: "",
    iva: "",
    fotos: [],
  });
  const [marginPct, setMarginPct] = useState(20);
  const [previews, setPreviews] = useState([]);
  const [especificaciones, setEspecificaciones] = useState([
    { concepto: "", valor: "", otroConcepto: "" }
  ]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar categorías al montar
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoriesService.getActive();
        if (response.success) {
          setCategories(response.data || []);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Cargar características al montar
  useEffect(() => {
    const loadCharacteristics = async () => {
      try {
        setCharacteristicsLoading(true);
        const response = await characteristicsService.getAll();
        if (response.success) {
          setCharacteristics(response.data || []);
        }
      } catch (error) {
        console.error('Error loading characteristics:', error);
      } finally {
        setCharacteristicsLoading(false);
      }
    };

    loadCharacteristics();
  }, []);

  const modalOpen = externalOpen !== undefined ? externalOpen : open;

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      nombre: "",
      descripcion: "",
      precio: "",
      cantidad: "",
      categoryId: "",
      costo: "",
      iva: "",
      fotos: [],
    });
    setPreviews([]);
    setEspecificaciones([{ concepto: "", valor: "", otroConcepto: "" }]);
    setError("");
    setFieldErrors({});
    setIsSubmitting(false); // Resetear estado de envío
    if (externalOnClose) externalOnClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validaciones específicas para campos numéricos
    if (name === "cantidad" && value && !isValidNumber(value)) {
      setError("Solo se permiten números enteros positivos en cantidad.");
      return;
    }
    if ((name === "precio" || name === "costo") && value && !isValidDecimal(value)) {
      setError("Solo se permiten números decimales positivos.");
      return;
    }
    if (name === "iva" && value && !isValidDecimal(value)) {
      setError("Solo se permiten números decimales positivos para el IVA.");
      return;
    }

    setError("");
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'costo') {
        const c = parseFloat(value);
        const m = parseFloat(marginPct) / 100;
        if (isFinite(c) && c > 0 && isFinite(m)) {
          next.precio = (c * (1 + m)).toFixed(2);
        } else {
          next.precio = "";
        }
      }
      return next;
    });
  };

  useEffect(() => {
    const c = parseFloat(formData.costo);
    const m = parseFloat(marginPct) / 100;
    if (isFinite(c) && c > 0 && isFinite(m)) {
      setFormData(prev => ({ ...prev, precio: (c * (1 + m)).toFixed(2) }));
    }
  }, [marginPct]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - formData.fotos.length;
    if (files.length > remainingSlots) {
      toast.warning(`Solo puedes agregar ${remainingSlots} imagen(es) más`);
      return;
    }

    try {
      for (const file of files) {
        if (!validateFileType(file)) {
          toast.error(`${file.name}: Tipo de archivo no válido`);
          continue;
        }

        if (!validateFileSize(file, 5)) {
          toast.error(`${file.name}: Máximo 5MB`);
          continue;
        }

        const base64Image = await compressImageToBase64(file, 1000, 1000, 0.8);
        
        setFormData((prev) => ({
          ...prev,
          fotos: [...prev.fotos, base64Image]
        }));

        const preview = URL.createObjectURL(file);
        setPreviews((prev) => [...prev, preview]);
      }
    } catch (error) {
      console.error('Error procesando imágenes:', error);
      toast.error('Error al procesar las imágenes');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith("image/"));
    
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - formData.fotos.length;
    if (files.length > remainingSlots) {
      toast.warning(`Solo puedes agregar ${remainingSlots} imagen(es) más`);
      return;
    }

    try {
      for (const file of files) {
        if (!validateFileType(file)) {
          toast.error(`${file.name}: Tipo no válido`);
          continue;
        }

        if (!validateFileSize(file, 5)) {
          toast.error(`${file.name}: Máximo 5MB`);
          continue;
        }

        const base64Image = await compressImageToBase64(file, 1000, 1000, 0.8);
        
        setFormData((prev) => ({
          ...prev,
          fotos: [...prev.fotos, base64Image]
        }));

        const preview = URL.createObjectURL(file);
        setPreviews((prev) => [...prev, preview]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar las imágenes');
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }));
    
    const previewUrl = previews[index];
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddEspecificacion = () => {
    setEspecificaciones([...especificaciones, { concepto: "", valor: "", otroConcepto: "" }]);
  };

  const handleChangeEspecificacion = (idx, field, value) => {
    const nuevas = [...especificaciones];
    nuevas[idx][field] = value;
    if (field === "concepto" && value !== "otro") {
      nuevas[idx].otroConcepto = "";
    }
    setEspecificaciones(nuevas);
  };

  const handleRemoveEspecificacion = (idx) => {
    setEspecificaciones(especificaciones.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevenir doble envío
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    let errors = {};

    // Validaciones obligatorias
    if (!formData.nombre.trim()) errors.nombre = "El nombre es obligatorio";
    if (!formData.categoryId) errors.categoryId = "La categoría es obligatoria";
    if (!formData.costo) errors.costo = "El costo es obligatorio";
    if (!formData.precio) errors.precio = "El precio es obligatorio";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    // NO validar duplicados en el frontend antes de enviar
    // El backend tiene la validación final y más precisa
    // Esto evita problemas de sincronización con la lista

    setFieldErrors({});

    try {
      const newProduct = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        id_categoria_producto: parseInt(formData.categoryId),
        precio_venta: parseFormattedNumber(formData.precio),
        stock: formData.cantidad ? parseFormattedNumber(formData.cantidad) : 0,
        costo: formData.costo ? parseFormattedNumber(formData.costo) : undefined,
        iva: formData.iva ? parseFormattedNumber(formData.iva) : 0,
      };

      if (formData.fotos.length > 0) {
        newProduct.fotos = formData.fotos;
      }

      // Mapear especificaciones a características
      const caracteristicasValidas = especificaciones
        .filter(e => {
          const nombre = e.concepto === "otro" ? e.otroConcepto : e.concepto;
          return nombre && nombre.trim() !== '' && e.valor && e.valor.trim() !== '';
        })
        .map(e => {
          const nombre = e.concepto === "otro" ? e.otroConcepto : e.concepto;
          return {
            nombre: nombre.trim(),
            valor: e.valor.trim()
          };
        });

      if (caracteristicasValidas.length > 0) {
        newProduct.caracteristicas = caracteristicasValidas;
      }

      console.log('CreateProduct: Sending product data:', newProduct);
      console.log('CreateProduct: Características a enviar:', newProduct.caracteristicas);

      // Pasar los datos al componente padre para que maneje la creación
      // Esto evita crear el producto dos veces
      if (onCreate) {
        try {
          // Crear el producto (esto recargará la lista automáticamente)
          await onCreate(newProduct);
          // Solo cerrar el modal si la creación fue exitosa
          handleClose();
        } catch (error) {
          // Si hay error, mantener el modal abierto y mostrar el error
          // El error ya se maneja en products.jsx con toast
          console.error('Error creating product:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Error al crear el producto';
          setError(errorMessage);
          // No mostrar toast aquí porque ya se muestra en products.jsx
          throw error; // Re-lanzar para que el catch externo no lo maneje también
        }
      } else {
        // Si no hay onCreate, crear directamente (caso de uso independiente)
        const result = await productsService.create(newProduct);
        if (result.success) {
          toast.success('Producto creado exitosamente');
          handleClose();
        } else {
          const errorMsg = result.message || 'Error al crear el producto';
          setError(errorMsg);
          toast.error(errorMsg);
        }
      }
    } catch (error) {
      // Solo manejar errores si no fueron manejados ya en el bloque if (onCreate)
      if (onCreate && error.response) {
        // El error ya fue manejado arriba, no hacer nada más
        console.error('Error already handled:', error);
      } else {
        console.error('Error creating product:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Error al crear el producto';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlurNombre = (e) => {
    // No validar duplicados en blur si ya se está enviando el formulario
    if (isSubmitting) {
      return;
    }
    
    const value = e.target.value;
    // Solo validar si hay un valor, el modal está abierto y no estamos en proceso de envío
    if (value && value.trim() && modalOpen && !isSubmitting) {
      // Validación opcional en tiempo real (solo como advertencia visual)
      // El backend tiene la validación final
      if (isDuplicateProductName(value, products)) {
        setFieldErrors(prev => ({
          ...prev,
          nombre: "Advertencia: Puede existir un producto con nombre similar"
        }));
      } else {
        // Limpiar el error si no es duplicado
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.nombre;
          return newErrors;
        });
      }
    }
  };


  return (
    <>
      {externalOpen === undefined && (
        <button
          className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center"
          onClick={handleOpen}
        >
          <i className="bi bi-plus-circle mr-2"></i>
          Crear Producto
        </button>
      )}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header fijo */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="bi bi-plus-circle text-lg"></i>
                </div>
                <h2 className="text-xl font-bold m-0">
                  Crear nuevo producto
                </h2>
              </div>
              <button
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-200"
                onClick={handleClose}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="overflow-y-auto p-6 flex-1 bg-gray-50">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Fotos del producto */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <label className="block text-xs font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="bi bi-images text-[#FACC15]"></i>
                    Fotos del Producto <span className="text-gray-500 text-xs font-normal">(Máximo {MAX_IMAGES})</span>
                  </label>
                  <div className="space-y-4">
                    {formData.fotos.length < MAX_IMAGES && (
                      <div
                        className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FACC15] hover:bg-yellow-50 transition-all duration-200 group"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("file-input").click()}
                      >
                        <div className="text-center">
                          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-yellow-100 transition-colors">
                            <i className="bi bi-cloud-upload text-2xl text-gray-500 group-hover:text-[#FACC15] transition-colors"></i>
                          </div>
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            Arrastra y suelta imágenes aquí
                          </p>
                          <p className="text-xs text-gray-500">
                            o haz clic para seleccionar ({formData.fotos.length}/{MAX_IMAGES})
                          </p>
                        </div>
                      </div>
                    )}

                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {previews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {previews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Vista previa ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg"
                            >
                              <i className="bi bi-x text-sm"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Campos del formulario en grid */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="bi bi-info-circle text-[#FACC15]"></i>
                    Información del Producto
                  </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nombre */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700">
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent text-gray-800 text-xs transition-all duration-200"
                        value={formData.nombre}
                        onChange={handleChange}
                        onBlur={handleBlurNombre}
                        required
                        placeholder="Ingresa el nombre del producto"
                      />
                      {fieldErrors.nombre && <p className="text-xs text-red-500 mt-1">{fieldErrors.nombre}</p>}
                    </div>

                    {/* Categoría */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700">
                        Categoría <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="categoryId"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent text-gray-800 text-xs transition-all duration-200 bg-white"
                        value={formData.categoryId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.filter(c => c.estado === 'activo').map((cat) => (
                          <option key={cat.id_categoria_producto} value={cat.id_categoria_producto}>
                            {cat.nombre}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.categoryId && <p className="text-xs text-red-500 mt-1">{fieldErrors.categoryId}</p>}
                    </div>

                    {/* Costo */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700">
                        Costo <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="text"
                          name="costo"
                          value={formatNumber(formData.costo)}
                          onChange={e => handleChange({ target: { name: 'costo', value: cleanNumber(e.target.value) } })}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent text-gray-800 text-xs transition-all duration-200"
                          required
                          onKeyDown={isNumberInputValid}
                          placeholder="0"
                        />
                      </div>
                      {fieldErrors.costo && <p className="text-xs text-red-500 mt-1">{fieldErrors.costo}</p>}
                    </div>

                    {/* Precio (auto margen) */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700">
                        Precio (auto margen) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="text"
                          name="precio"
                          value={formatNumber(formData.precio)}
                          readOnly
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent text-gray-800 text-xs transition-all duration-200"
                          required
                          placeholder="0"
                        />
                      </div>
                      {fieldErrors.precio && <p className="text-xs text-red-500 mt-1">{fieldErrors.precio}</p>}
                      {formData.costo && formData.precio && (
                        <p className="text-[10px] text-gray-500">Margen: ${formatNumber(parseFormattedNumber(formData.precio) - parseFormattedNumber(formData.costo))} ({(((parseFormattedNumber(formData.precio) - parseFormattedNumber(formData.costo)) / parseFormattedNumber(formData.costo)) * 100 || 0).toFixed(2)}%)</p>
                      )}
                    </div>

                    {/* Margen (%) */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700">Margen (%)</label>
                      <input
                        type="text"
                        name="marginPct"
                        value={formatNumber(marginPct)}
                        onChange={e => {
                          const val = cleanNumber(e.target.value);
                          if (val === "" || /^\d*\.?\d*$/.test(val)) setMarginPct(val);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent text-gray-800 text-xs transition-all duration-200"
                        placeholder="20"
                      />
                    </div>

                    {/* Cantidad en Stock */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700">
                        Cantidad en Stock
                      </label>
                      <input
                        type="text"
                        name="cantidad"
                        value={formatNumber(formData.cantidad)}
                        onChange={e => handleChange({ target: { name: 'cantidad', value: cleanNumber(e.target.value) } })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent text-gray-800 text-xs transition-all duration-200"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent text-gray-800 text-xs resize-none transition-all duration-200"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe las características principales del producto..."
                  />
                </div>

                {/* Especificaciones Técnicas */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                      <i className="bi bi-gear text-[#FACC15]"></i>
                      Especificaciones Técnicas
                    </h3>
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-[#FACC15] text-gray-800 rounded-lg hover:bg-yellow-400 transition-all duration-200 flex items-center gap-2 text-xs font-medium"
                      onClick={handleAddEspecificacion}
                    >
                      <i className="bi bi-plus"></i> Agregar
                    </button>
                  </div>
                  <div className="space-y-3">
                    {especificaciones.map((esp, idx) => (
                      <div key={idx} className="flex flex-wrap gap-3 items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <select
                          className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs min-w-[160px] max-w-[200px] focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all duration-200"
                          value={esp.concepto}
                          onChange={e => handleChangeEspecificacion(idx, "concepto", e.target.value)}
                        >
                          <option value="">Seleccione concepto</option>
                          {characteristics.map(char => (
                            <option key={char.id_caracteristica} value={char.nombre}>
                              {char.nombre}
                            </option>
                          ))}
                          <option value="otro">Otro…</option>
                        </select>
                        {esp.concepto === "otro" && (
                          <input
                            type="text"
                            className="flex-1 min-w-[140px] max-w-[200px] px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all duration-200"
                            placeholder="Nuevo concepto"
                            value={esp.otroConcepto}
                            onChange={e => handleChangeEspecificacion(idx, "otroConcepto", e.target.value)}
                          />
                        )}
                        <input
                          type="text"
                          className="flex-1 min-w-[140px] max-w-[240px] px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all duration-200"
                          placeholder="Valor"
                          value={esp.valor}
                          onChange={e => handleChangeEspecificacion(idx, "valor", e.target.value)}
                        />
                        <button
                          type="button"
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all duration-200"
                          onClick={() => handleRemoveEspecificacion(idx)}
                        >
                          <i className="bi bi-trash text-base"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mensaje de error general */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <i className="bi bi-exclamation-triangle text-red-500 text-lg mt-0.5"></i>
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                    onClick={handleClose}
                  >
                    <i className="bi bi-x-circle"></i>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <i className="bi bi-arrow-repeat animate-spin"></i>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle"></i>
                        Guardar Producto
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

CreateProduct.propTypes = {
  onCreate: PropTypes.func.isRequired,
  products: PropTypes.array,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export default CreateProduct;
