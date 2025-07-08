import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { isDuplicateProductName } from '../../../../../shared/validations';
import { useCategories } from '../../CatProducts/hooks/useCategories';

const EditProduct = ({ product, isOpen, onClose, onSave, products = [] }) => {
  const { categories: useCategoriesCategories } = useCategories();
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    cantidad: "",
    categoria: "",
    color: "",
    foto: "",
  });
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre || "",
        descripcion: product.descripcion || "",
        precio: product.precio?.toString() || "",
        cantidad: product.cantidad?.toString() || "",
        categoria: product.categoria || "",
        color: product.color || "",
        foto: product.foto || "",
      });
      setPreview(product.foto || "");
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, foto: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData((prev) => ({ ...prev, foto: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, foto: "" }));
    setPreview("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      // Si el campo nombre está vacío, no enviar
      return;
    }
    // Validar duplicado excluyendo el producto actual
    const otrosProductos = products.filter(p => p.id !== product.id);
    if (isDuplicateProductName(formData.nombre, otrosProductos)) {
      window.alert('Ya existe un producto con ese nombre.');
      setFormData((prev) => ({ ...prev, nombre: product.nombre }));
      return;
    }
    if (formData.nombre.trim() && formData.descripcion.trim() && formData.precio) {
      let fotoUrl = formData.foto;
      if (formData.foto instanceof File) {
        fotoUrl = URL.createObjectURL(formData.foto);
      }
      const updatedProduct = {
        ...product,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: parseFloat(formData.precio),
        cantidad: parseInt(formData.cantidad),
        categoria: formData.categoria,
        color: formData.color,
        foto: fotoUrl,
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
      foto: "",
    });
    setPreview("");
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
              <label className="block text-xs font-medium text-text-main mb-1">Foto del Producto</label>
              <div className="space-y-3">
                <div
                  className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('edit-file-input').click()}
                >
                  {preview ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img 
                        src={preview} 
                        alt="Vista previa" 
                        className="max-h-28 max-w-full object-contain rounded-lg mx-auto" 
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        className="absolute top-1 right-1 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <i className="bi bi-cloud-upload text-3xl text-gray-400 mb-2"></i>
                      <p className="text-sm text-gray-500 mb-1">Arrastra y suelta una imagen aquí</p>
                      <p className="text-xs text-gray-400">o haz clic para seleccionar</p>
                    </div>
                  )}
                </div>
                <input
                  id="edit-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
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
                  Precio
                </label>
              <input
                type="number"
                name="precio"
                step="0.01"
                min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm"
                value={formData.precio}
                onChange={handleChange}
                required
              />
            </div>
            <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Cantidad en Stock
                </label>
              <input
                type="number"
                name="cantidad"
                min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm bg-gray-100 cursor-not-allowed"
                value={formData.cantidad}
                  readOnly
                  disabled
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
