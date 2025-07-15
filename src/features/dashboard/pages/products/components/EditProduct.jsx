import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { isDuplicateProductName } from '../../../../../shared/validations';
import { useCategories } from '../../CatProducts/hooks/useCategories';

const CONCEPTOS_ESPECIFICACION = [
  "Color",
  "Material",
  "Contenido",
  "Tipo de Cabello",
  // Puedes agregar más conceptos aquí
];

const MAX_IMAGES = 3;

const EditProduct = ({ product, isOpen, onClose, onSave, products = [] }) => {
  const { categories: useCategoriesCategories } = useCategories();
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    cantidad: "",
    categoria: "",
    color: "",
    fotos: [],
    tipoProducto: "",
    // Eliminados: tamanio, volumen, tipoCabelloIdeal, textura, origen
  });
  const [previews, setPreviews] = useState([]);
  const [especificaciones, setEspecificaciones] = useState([{ concepto: "", valor: "", otroConcepto: "" }]);

  useEffect(() => {
    if (product) {
      const productFotos = product.fotos || (product.foto ? [product.foto] : []);
      
      setFormData({
        nombre: product.nombre || "",
        descripcion: product.descripcion || "",
        precio: product.precio?.toString() || "",
        cantidad: product.cantidad?.toString() || "",
        categoria: product.categoria || "",
        color: product.color || "",
        fotos: productFotos,
        tipoProducto: product.tipoProducto || "",
      });
      setPreviews(productFotos);
      setEspecificaciones(
        product.especificaciones && product.especificaciones.length > 0
          ? product.especificaciones.map(e => ({ ...e, otroConcepto: "" }))
          : [{ concepto: "", valor: "", otroConcepto: "" }]
      );
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Si cambia el tipo de producto a Extensiones, forzar cantidad a 1
    if (name === 'tipoProducto' && value === 'Extensiones') {
      setFormData((prev) => ({
        ...prev,
        tipoProducto: value,
        cantidad: '1',
      }));
      return;
    }
    // Si cambia el tipo de producto a otro, permitir editar cantidad
    if (name === 'tipoProducto' && value !== 'Extensiones') {
      setFormData((prev) => ({
        ...prev,
        tipoProducto: value,
        cantidad: '',
      }));
      return;
    }
    if (name === "cantidad" && formData.tipoProducto === "Extensiones") {
      // No permitir editar cantidad si es Extensiones
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.slice(0, MAX_IMAGES - formData.fotos.length);
      const newPreviews = newImages.map(file => URL.createObjectURL(file));
      
      setFormData((prev) => ({ 
        ...prev, 
        fotos: [...prev.fotos, ...newImages] 
      }));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      const newImages = files.slice(0, MAX_IMAGES - formData.fotos.length);
      const newPreviews = newImages.map(file => URL.createObjectURL(file));
      
      setFormData((prev) => ({ 
        ...prev, 
        fotos: [...prev.fotos, ...newImages] 
      }));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }));
    setPreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Liberar memoria de la URL del objeto si es un archivo nuevo
      if (formData.fotos[index] instanceof File) {
        URL.revokeObjectURL(prev[index]);
      }
      return newPreviews;
    });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      return;
    }
    const otrosProductos = products.filter(p => p.id !== product.id);
    if (isDuplicateProductName(formData.nombre, otrosProductos)) {
      window.alert('Ya existe un producto con ese nombre.');
      setFormData((prev) => ({ ...prev, nombre: product.nombre }));
      return;
    }
    if (formData.nombre.trim() && formData.descripcion.trim() && formData.precio && formData.tipoProducto.trim()) {
      // Procesar las fotos
      const fotosUrls = formData.fotos.map(foto => {
        if (foto instanceof File) {
          return URL.createObjectURL(foto);
        }
        return foto;
      });

      const updatedProduct = {
        ...product,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: parseFloat(formData.precio),
        cantidad: parseInt(formData.cantidad),
        categoria: formData.categoria,
        color: formData.color,
        fotos: fotosUrls,
        tipoProducto: formData.tipoProducto,
        especificaciones: especificaciones
          .filter(e => (e.concepto === "otro" ? e.otroConcepto : e.concepto) && e.valor)
          .map(e => ({ concepto: e.concepto === "otro" ? e.otroConcepto : e.concepto, valor: e.valor }))
      };
      onSave(updatedProduct);
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({
      nombre: "",
      descripcion: "",
      precio: "",
      cantidad: "",
      categoria: "",
      color: "",
      fotos: [],
      tipoProducto: "",
    });
    setPreviews([]);
    setEspecificaciones([{ concepto: "", valor: "", otroConcepto: "" }]);
  };

  const handleBlurNombre = (e) => {
    const value = e.target.value;
    // Excluir el producto actual de la validación
    const otrosProductos = products.filter(p => p.id !== product.id);
    if (isDuplicateProductName(value, otrosProductos)) {
      window.alert('Ya existe un producto con ese nombre.');
      setFormData((prev) => ({ ...prev, nombre: product.nombre }));
    }
  };

  const formatNumber = (num) => {
    if (num === '' || num === undefined || num === null) return '';
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const cleanNumber = (str) => str.replace(/,/g, '');

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 ">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-primary m-0">Editar producto</h2>
        <button
            className="text-gray-400 hover:text-primary text-xl font-bold"
          onClick={handleClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        </div>
        {/* Contenido con scroll */}
        <div className="overflow-y-auto p-8 flex-1">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-main mb-1">
                Fotos del Producto <span className="text-gray-500 text-xs">(Máximo {MAX_IMAGES})</span>
              </label>
              <div className="space-y-3">
                {formData.fotos.length < MAX_IMAGES && (
                  <div
                    className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('edit-file-input').click()}
                  >
                    <div className="text-center">
                      <i className="bi bi-cloud-upload text-3xl text-gray-400 mb-2"></i>
                      <p className="text-sm text-gray-500 mb-1">Arrastra y suelta imágenes aquí</p>
                      <p className="text-xs text-gray-400">o haz clic para seleccionar ({formData.fotos.length}/{MAX_IMAGES})</p>
                    </div>
                  </div>
                )}
                
                <input
                  id="edit-file-input"
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
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Nombre
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
            </div>
            <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Categoría
                </label>
              <select
                name="categoria"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm"
                value={formData.categoria}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar categoría</option>
                {useCategoriesCategories.filter(c => c.isActive).map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Color
                </label>
              <input
                type="text"
                name="color"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm"
                value={formData.color}
                onChange={handleChange}
                required
              />
            </div>
            <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Tipo de producto <span className="text-red-500">*</span>
                </label>
                <select
                  name="tipoProducto"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm"
                  value={formData.tipoProducto}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Extensiones">Extensiones</option>
                  <option value="Cuidado capilar">Cuidado capilar</option>
                </select>
            </div>
            {/* Especificaciones Técnicas (antes de la descripción) */}
            <div className="bg-gray-50 rounded-lg p-4 border mb-4">
              <div className="font-semibold text-text-main mb-2">Especificaciones Técnicas</div>
              <hr className="mb-4" />
              {especificaciones.map((esp, idx) => (
                <div key={idx} className="flex flex-wrap gap-2 items-center mb-2">
                  <select
                    className="px-2 py-1 border rounded text-sm min-w-[140px] max-w-[180px]"
                    value={esp.concepto}
                    onChange={e => handleChangeEspecificacion(idx, "concepto", e.target.value)}
                  >
                    <option value="">Seleccione concepto</option>
                    {CONCEPTOS_ESPECIFICACION.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    <option value="otro">Otro…</option>
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
                  <button type="button" className="text-gray-400 hover:text-red-500" onClick={() => handleRemoveEspecificacion(idx)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              ))}
              <button type="button" className="mt-2 px-4 py-2 bg-text-main text-white rounded hover:bg-primary-dark text-sm flex items-center gap-2" onClick={handleAddEspecificacion}>
                <i className="bi bi-plus"></i> Agregar especificación
              </button>
            </div>
            <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Precio
                </label>
              <input
                type="text"
                name="precio"
                value={formatNumber(formData.precio)}
                onChange={e => handleChange({ target: { name: 'precio', value: cleanNumber(e.target.value) } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm"
                required
              />
            </div>
            <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Cantidad en Stock
                </label>
              <input
                type="text"
                name="cantidad"
                value={formatNumber(formData.cantidad)}
                onChange={e => handleChange({ target: { name: 'cantidad', value: cleanNumber(e.target.value) } })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-white disabled:bg-gray-100 disabled:text-gray-400"
                min={formData.tipoProducto === 'Extensiones' ? 1 : 0}
                max={formData.tipoProducto === 'Extensiones' ? 1 : undefined}
                disabled={formData.tipoProducto === 'Extensiones'}
                required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Fecha de Registro
                </label>
                <input
                  type="text"
                  name="fechaRegistro"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm bg-gray-100 cursor-not-allowed"
                  value={product?.fechaRegistro || ""}
                  readOnly
                  disabled
              />
            </div>
          </div>
          <div>
              <label className="block text-xs font-medium text-text-main mb-1">
                Descripción
              </label>
            <textarea
              name="descripcion"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows={3}
            />
          </div>
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
                className="px-4 py-2 rounded-md bg-text-main text-white text-sm font-semibold hover:bg-primary-dark transition"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

EditProduct.propTypes = {
  product: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  products: PropTypes.array,
};

export default EditProduct;
