import { useState, useEffect } from "react";

const EditProduct = ({ product, isOpen, onClose, onSave, categories = [] }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    cantidad: "",
    categoria: "",
    tipoProducto: "",
    color: "",
    foto: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre || "",
        descripcion: product.descripcion || "",
        precio: product.precio?.toString() || "",
        cantidad: product.cantidad?.toString() || "",
        categoria: product.categoria || "",
        tipoProducto: product.tipoProducto || "",
        color: product.color || "",
        foto: product.foto || "",
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.nombre.trim() && formData.descripcion.trim() && formData.precio && formData.cantidad) {
      const updatedProduct = {
        ...product,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: parseFloat(formData.precio),
        cantidad: parseInt(formData.cantidad),
        categoria: formData.categoria,
        tipoProducto: formData.tipoProducto,
        color: formData.color,
        foto: formData.foto,
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
      tipoProducto: "",
      color: "",
      foto: "",
    });
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold"
          onClick={handleClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-pencil-square text-white text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-primary">Editar Producto</h2>
          
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Tipo de Producto</label>
              <select
                name="tipoProducto"
                className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                value={formData.tipoProducto}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar tipo</option>
                <option value="Shampoo">Shampoo</option>
                <option value="Acondicionador">Acondicionador</option>
                <option value="Mascarilla">Mascarilla</option>
                <option value="Gel">Gel</option>
                <option value="Aceite">Aceite</option>
                <option value="Spray">Spray</option>
                <option value="Crema">Crema</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Categoría</label>
              <select
                name="categoria"
                className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                value={formData.categoria}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Color</label>
              <input
                type="text"
                name="color"
                className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                value={formData.color}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Precio</label>
              <input
                type="number"
                name="precio"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                value={formData.precio}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Cantidad en Stock</label>
              <input
                type="number"
                name="cantidad"
                min="0"
                className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                value={formData.cantidad}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Descripción</label>
            <textarea
              name="descripcion"
              className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main resize-none"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">URL de la Foto</label>
            <input
              type="url"
              name="foto"
              className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
              value={formData.foto}
              onChange={handleChange}
              placeholder="https://via.placeholder.com/80x80.png?text=Producto"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary-dark transition"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
