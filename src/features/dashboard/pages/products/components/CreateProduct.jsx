import { useState } from "react";
import PropTypes from "prop-types";
import {
  isDuplicateProductName,
  isNumberInputValid,
  isValidNumber,
  isValidDecimal,
} from "../../../../../shared/validations";
import { useCategories } from '../../CatProducts/hooks/useCategories';

const CreateProduct = ({ onCreate, products = [] }) => {
  const [open, setOpen] = useState(false);
  const { categories: useCategoriesCategories } = useCategories();
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    cantidad: "",
    categoria: "",
    color: "",
    tamanio: "",
    foto: "",
    tipoProducto: "",
    volumen: "",
    tipoCabelloIdeal: "",
    textura: "",
    origen: "",
  });
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      nombre: "",
      descripcion: "",
      precio: "",
      cantidad: "",
      categoria: "",
      color: "",
      tamanio: "",
      foto: "",
      tipoProducto: "",
      volumen: "",
      tipoCabelloIdeal: "",
      textura: "",
      origen: "",
    });
  };

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
    if (name === "cantidad" && value && !isValidNumber(value)) {
      setError("Solo se permiten números enteros positivos en cantidad.");
      return;
    }
    if (name === "precio" && value && !isValidDecimal(value)) {
      setError("Solo se permiten números decimales positivos en precio.");
      return;
    }
    setError("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    if (file && file.type.startsWith("image/")) {
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
    setError("");
    if (!formData.nombre.trim()) {
      // Si el campo nombre está vacío, no enviar
      return;
    }
    if (isDuplicateProductName(formData.nombre, products)) {
      window.alert("Ya existe un producto con ese nombre.");
      setFormData((prev) => ({ ...prev, nombre: "" }));
      return;
    }
    if (
      formData.nombre.trim() &&
      formData.categoria.trim() &&
      formData.precio &&
      formData.descripcion.trim() &&
      formData.tipoProducto.trim() &&
      (formData.tipoProducto !== "Extensiones" || formData.textura.trim())
    ) {
      let fotoUrl = formData.foto;
      if (formData.foto instanceof File) {
        fotoUrl = URL.createObjectURL(formData.foto);
      }
      const newProduct = {
        ...formData,
        id: Date.now(), // ID temporal
        precio: parseFloat(formData.precio),
        cantidad: formData.cantidad ? parseInt(formData.cantidad) : 0,
        tamanio: formData.tamanio ? parseFloat(formData.tamanio) : null,
        fechaRegistro: new Date().toISOString().split("T")[0],
        foto: fotoUrl,
      };
      if (onCreate) onCreate(newProduct);
      handleClose();
    }
  };

  const handleBlurNombre = (e) => {
    const value = e.target.value;
    if (isDuplicateProductName(value, products)) {
      window.alert("Ya existe un producto con ese nombre.");
      setFormData((prev) => ({ ...prev, nombre: "" }));
    }
  };

  const formatNumber = (num) => {
    if (num === '' || num === undefined || num === null) return '';
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const cleanNumber = (str) => str.replace(/,/g, '');

  return (
    <>
      <button
        className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center"
        onClick={handleOpen}
      >
        <i className="bi bi-plus-circle mr-2"></i>
        Nuevo Producto
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 rounded-md">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
            {/* Header fijo */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-md flex items-center justify-between px-8 py-4">
              <h2 className="text-xl font-bold text-primary m-0">
                Crear nuevo producto
              </h2>
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
                    Foto del Producto
                  </label>
                  <div className="space-y-3">
                    <div
                      className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() =>
                        document.getElementById("file-input").click()
                      }
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
                          <p className="text-sm text-gray-500 mb-1">
                            Arrastra y suelta una imagen aquí
                          </p>
                          <p className="text-xs text-gray-400">
                            o haz clic para seleccionar
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      id="file-input"
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
                      Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400  text-text-main text-sm"
                    value={formData.nombre}
                    onChange={handleChange}
                      onBlur={handleBlurNombre}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-main mb-1">
                      Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoria"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400  text-text-main text-sm"
                      value={formData.categoria}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {useCategoriesCategories.filter(c => c.isActive).map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400  text-text-main text-sm"
                      value={formData.color}
                    onChange={handleChange}
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
                {/* Volumen solo si es Cuidado capilar */}
                {formData.tipoProducto === "Cuidado capilar" && (
                  <div>
                    <label className="block text-xs font-medium text-text-main mb-1">
                      Volumen (ml)
                    </label>
                    <input
                      type="text"
                      name="volumen"
                      value={formatNumber(formData.volumen)}
                      onChange={e => handleChange({ target: { name: 'volumen', value: cleanNumber(e.target.value) } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm"
                      placeholder="Opcional"
                    />
                  </div>
                )}
                {/* Textura solo si es Extensiones */}
                {formData.tipoProducto === "Extensiones" && (
                  <div>
                    <label className="block text-xs font-medium text-text-main mb-1">
                      Textura <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="textura"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm"
                      value={formData.textura}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccionar textura</option>
                      <option value="Ondulado">Ondulado</option>
                      <option value="Rizo">Rizo</option>
                      <option value="Liso">Liso</option>
                    </select>
                  </div>
                )}
                {/* Origen solo si es Extensiones */}
                {formData.tipoProducto === "Extensiones" && (
                  <div>
                    <label className="block text-xs font-medium text-text-main mb-1">
                      Origen <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="origen"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm"
                      value={formData.origen || ""}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccionar origen</option>
                      <option value="Natural">Natural</option>
                      <option value="Sintética">Sintética</option>
                    </select>
                  </div>
                )}
                {/* Tipo de cabello ideal solo si es Cuidado capilar */}
                {formData.tipoProducto === "Cuidado capilar" && (
                  <div>
                    <label className="block text-xs font-medium text-text-main mb-1">
                      Tipo de cabello ideal
                    </label>
                    <select
                      name="tipoCabelloIdeal"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm"
                      value={formData.tipoCabelloIdeal || ""}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="Cabello seco">Cabello seco</option>
                      <option value="Cabello graso">Cabello graso</option>
                      <option value="Cabello teñido">Cabello teñido</option>
                      <option value="Cabello rizado">Cabello rizado</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-text-main mb-1">
                    Largo (mtr)
                  </label>
                  <input
                    type="text"
                    name="tamanio"
                    value={formatNumber(formData.tamanio)}
                    onChange={e => handleChange({ target: { name: 'tamanio', value: cleanNumber(e.target.value) } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400  text-text-main text-sm"
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-main mb-1">
                      Precio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="precio"
                    value={formatNumber(formData.precio)}
                    onChange={e => handleChange({ target: { name: 'precio', value: cleanNumber(e.target.value) } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400  text-text-main text-sm"
                    required
                      onKeyDown={isNumberInputValid}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-main mb-1">
                    Cantidad en Stock</label>
                  <input
                    type="text"
                    name="cantidad"
                    value={formatNumber(formData.cantidad)}
                    onChange={e => handleChange({ target: { name: 'cantidad', value: cleanNumber(e.target.value) } })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-white disabled:bg-gray-100 disabled:text-gray-400"
                    required
                    min={formData.tipoProducto === 'Extensiones' ? 1 : 0}
                    max={formData.tipoProducto === 'Extensiones' ? 1 : undefined}
                    disabled={formData.tipoProducto === 'Extensiones'}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                    Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="descripcion"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400  text-text-main text-sm"
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
                  Guardar
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
      {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
    </>
  );
};

CreateProduct.propTypes = {
  onCreate: PropTypes.func,
  products: PropTypes.array,
};

export default CreateProduct;
