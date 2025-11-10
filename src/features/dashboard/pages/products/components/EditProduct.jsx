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
import { formatNumber, cleanNumber } from '../../../../../shared/utils/formatters';
// Ajustar la ruta segÃºn la ubicaciÃ³n del componente

const MAX_IMAGES = 3;

const EditProduct = ({ product, onUpdate, products = [], isOpen: externalOpen = undefined, onClose: externalOnClose }) => {
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
    fotos: [],
  });
  const [previews, setPreviews] = useState([]);
  const [especificaciones, setEspecificaciones] = useState([
    { concepto: "", valor: "", otroConcepto: "" }
  ]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar datos del producto cuando se recibe
  useEffect(() => {
    if (product) {
      // Convertir url_foto (string separado por comas) a array si es necesario
      let fotosArray = [];
      if (product.fotos && Array.isArray(product.fotos)) {
        fotosArray = product.fotos;
      } else if (product.url_foto && typeof product.url_foto === 'string') {
        // Si viene como string separado por comas, convertirlo a array
        fotosArray = product.url_foto.split(',').filter(url => url && url.trim());
      }
      
      setFormData({
        nombre: product.nombre || "",
        descripcion: product.descripcion || "",
        precio: product.precio_venta?.toString() || product.precio?.toString() || "",
        cantidad: product.stock?.toString() || product.cantidad?.toString() || "",
        categoryId: product.id_categoria_producto?.toString() || product.categoryId?.toString() || "",
        fotos: fotosArray,
      });

      // Inicializar previews con imágenes existentes
      setPreviews(fotosArray);

      // Inicializar especificaciones desde características
      if (product.caracteristicas && Array.isArray(product.caracteristicas)) {
        const especs = product.caracteristicas.map(car => ({
          concepto: car.nombre,
          valor: car.FichaTecnica?.valor || car.valor || "",
          otroConcepto: ""
        }));
        setEspecificaciones(especs.length > 0 ? especs : [{ concepto: "", valor: "", otroConcepto: "" }]);
      }
    }
  }, [product]);

  // Cargar categorÃ­as al montar
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

  // Cargar caracterÃ­sticas al montar
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

    // Validaciones especÃ­ficas para campos numÃ©ricos
    if (name === "cantidad" && value && !isValidNumber(value)) {
      setError("Solo se permiten nÃºmeros enteros positivos en cantidad.");
      return;
    }
    if ((name === "precio" || name === "costo") && value && !isValidDecimal(value)) {
      setError("Solo se permiten nÃºmeros decimales positivos.");
      return;
    }
    if (name === "iva" && value && !isValidDecimal(value)) {
      setError("Solo se permiten nÃºmeros decimales positivos para el IVA.");
      return;
    }

    setError("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - formData.fotos.length;
    if (files.length > remainingSlots) {
      toast.warning(`Solo puedes agregar ${remainingSlots} imagen(es) mÃ¡s`);
      return;
    }

    try {
      for (const file of files) {
        if (!validateFileType(file)) {
          toast.error(`${file.name}: Tipo de archivo no vÃ¡lido`);
          continue;
        }

        if (!validateFileSize(file, 5)) {
          toast.error(`${file.name}: MÃ¡ximo 5MB`);
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
      console.error('Error procesando imÃ¡genes:', error);
      toast.error('Error al procesar las imÃ¡genes');
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
      toast.warning(`Solo puedes agregar ${remainingSlots} imagen(es) mÃ¡s`);
      return;
    }

    try {
      for (const file of files) {
        if (!validateFileType(file)) {
          toast.error(`${file.name}: Tipo no vÃ¡lido`);
          continue;
        }

        if (!validateFileSize(file, 5)) {
          toast.error(`${file.name}: MÃ¡ximo 5MB`);
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
      toast.error('Error al procesar las imÃ¡genes');
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
    setLoading(true);

    try {
      // Preparar datos para actualizar
      const updateData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion?.trim() || null,
        precio_venta: parseFloat(formData.precio),
        stock: formData.cantidad ? parseInt(formData.cantidad) : 0,
        id_categoria_producto: parseInt(formData.categoryId),
      };

      // SIEMPRE enviar el array de fotos, incluso si está vacío
      // Esto permite al backend saber que debe procesar las imágenes
      // (incluyendo eliminar todas si el array está vacío)
      if (formData.fotos !== undefined && Array.isArray(formData.fotos)) {
        // Filtrar solo imágenes válidas (base64 o URLs de Cloudinary)
        const validImages = formData.fotos
          .filter(img => img && (img.startsWith('data:image') || img.includes('cloudinary.com')))
          .slice(0, 3); // Máximo 3 imágenes

        // Enviar el array, incluso si está vacío (para eliminar todas las imágenes)
        updateData.fotos = validImages;
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
        updateData.caracteristicas = caracteristicasValidas;
      }

      console.log('EditProduct: Sending update data:', updateData);
      console.log('EditProduct: Fotos a enviar:', updateData.fotos);
      console.log('EditProduct: Características a enviar:', updateData.caracteristicas);

      // Pasar los datos al componente padre para que maneje la actualización
      // Esto evita problemas de sincronización
      if (onUpdate) {
        try {
          // Actualizar el producto (esto recargará la lista automáticamente)
          await onUpdate(product.id_producto, updateData);
          // Solo cerrar el modal si la actualización fue exitosa
          handleClose();
        } catch (error) {
          // Si hay error, mantener el modal abierto y mostrar el error
          // El error ya se maneja en products.jsx con toast
          console.error('Error updating product:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar el producto';
          setError(errorMessage);
          // No mostrar toast aquí porque ya se muestra en products.jsx
        }
      } else {
        // Si no hay onUpdate, actualizar directamente (caso de uso independiente)
        const result = await productsService.update(product.id_producto, updateData);
        if (result.success) {
          toast.success('Producto actualizado exitosamente');
          handleClose();
        } else {
          throw new Error(result.message || 'Error al actualizar el producto');
        }
      }
    } catch (error) {
      // Solo manejar errores si no fueron manejados ya en el bloque if (onUpdate)
      if (onUpdate && error.response) {
        // El error ya fue manejado arriba, no hacer nada más
        console.error('Error already handled:', error);
      } else {
        console.error('Error updating product:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar el producto';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
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
      const filteredProducts = products.filter(p => p.id_producto !== product.id_producto);
      if (isDuplicateProductName(value, filteredProducts)) {
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
          Nuevo Producto
        </button>
      )}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
            {/* Header fijo */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-md flex items-center justify-between px-8 py-4">
              <h2 className="text-xl font-bold text-primary m-0">
                Editar producto
              </h2>
              <button
                className="text-gray-400 hover:text-primary text-xl font-bold"
                onClick={handleClose}
                aria-label="Cerrar"
              >
                Ã—
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="overflow-y-auto p-8 flex-1">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Fotos del producto */}
                <div>
                  <label className="block text-xs font-medium text-text-main mb-1">
                    Fotos del Producto <span className="text-gray-500 text-xs">(MÃ¡ximo {MAX_IMAGES})</span>
                  </label>
                  <div className="space-y-3">
                    {formData.fotos.length < MAX_IMAGES && (
                      <div
                        className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("file-input").click()}
                      >
                        <div className="text-center">
                          <i className="bi bi-cloud-upload text-3xl text-gray-400 mb-2"></i>
                          <p className="text-sm text-gray-500 mb-1">
                            Arrastra y suelta imÃ¡genes aquÃ­
                          </p>
                          <p className="text-xs text-gray-400">
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
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Vista previa ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-sm"
                            >
                              Ã—
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Campos del formulario en grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-xs font-medium text-text-main mb-1">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm"
                      value={formData.nombre}
                      onChange={handleChange}
                      onBlur={handleBlurNombre}
                      required
                    />
                    {fieldErrors.nombre && <p className="text-xs text-red-500 mt-1">{fieldErrors.nombre}</p>}
                  </div>

                  {/* CategorÃ­a */}
                  <div>
                    <label className="block text-xs font-medium text-text-main mb-1">
                      CategorÃ­a <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="categoryId"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm"
                      value={formData.categoryId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccionar categorÃ­a</option>
                      {categories.filter(c => c.estado === 'activo').map((cat) => (
                        <option key={cat.id_categoria_producto} value={cat.id_categoria_producto}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.categoryId && <p className="text-xs text-red-500 mt-1">{fieldErrors.categoryId}</p>}
                  </div>

                  {/* Precio */}
                  <div>
                    <label className="block text-xs font-medium text-text-main mb-1">
                      Precio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="precio"
                      value={formatNumber(formData.precio)}
                      onChange={e => handleChange({ target: { name: 'precio', value: cleanNumber(e.target.value) } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm"
                      required
                      onKeyDown={isNumberInputValid}
                    />
                    {fieldErrors.precio && <p className="text-xs text-red-500 mt-1">{fieldErrors.precio}</p>}
                  </div>

                  {/* Cantidad en Stock */}
                  <div>
                    <label className="block text-xs font-medium text-text-main mb-1">
                      Cantidad en Stock
                    </label>
                    <input
                      type="text"
                      name="cantidad"
                      value={formatNumber(formData.cantidad)}
                      onChange={e => handleChange({ target: { name: 'cantidad', value: cleanNumber(e.target.value) } })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* DescripciÃ³n */}
                <div>
                  <label className="block text-xs font-medium text-text-main mb-1">
                    DescripciÃ³n
                  </label>
                  <textarea
                    name="descripcion"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                {/* Especificaciones TÃ©cnicas */}
                <div className="bg-gray-50 rounded-lg p-4 border mb-4">
                  <div className="font-semibold text-text-main mb-2">Especificaciones TÃ©cnicas</div>
                  <hr className="mb-4" />
                  {especificaciones.map((esp, idx) => (
                    <div key={idx} className="flex flex-wrap gap-2 items-center mb-2">
                      <select
                        className="px-2 py-1 border rounded text-sm min-w-[140px] max-w-[180px]"
                        value={esp.concepto}
                        onChange={e => handleChangeEspecificacion(idx, "concepto", e.target.value)}
                      >
                        <option value="">Seleccione concepto</option>
                        {characteristics.map(char => (
                          <option key={char.id_caracteristica} value={char.nombre}>
                            {char.nombre}
                          </option>
                        ))}
                        <option value="otro">Otroâ€¦</option>
                      </select>
                      {esp.concepto === "otro" && (
                        <input
                          type="text"
                          className="flex-1 min-w-[120px] max-w-[180px] px-2 py-1 border rounded text-sm"
                          placeholder="Nuevo concepto"
                          value={esp.otroConcepto}
                          onChange={e => handleChangeEspecificacion(idx, "otroConcepto", e.target.value)}
                        />
                      )}
                      <input
                        type="text"
                        className="flex-1 min-w-[120px] max-w-[220px] px-2 py-1 border rounded text-sm"
                        placeholder="Valor"
                        value={esp.valor}
                        onChange={e => handleChangeEspecificacion(idx, "valor", e.target.value)}
                      />
                      <button
                        type="button"
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => handleRemoveEspecificacion(idx)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="mt-2 px-4 py-2 bg-text-main text-white rounded hover:bg-primary-dark text-sm flex items-center gap-2"
                    onClick={handleAddEspecificacion}
                  >
                    <i className="bi bi-plus"></i> Agregar especificaciÃ³n
                  </button>
                </div>

                {/* Mensaje de error general */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                {/* Botones de acciÃ³n */}
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition"
                    onClick={handleClose}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="px-4 py-2 rounded-md bg-text-main text-white text-sm font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || loading ? 'Guardando...' : 'Guardar'}
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

EditProduct.propTypes = {
  product: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  products: PropTypes.array,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export default EditProduct;