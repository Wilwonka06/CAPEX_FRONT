import { useState } from "react";

const CreateProduct = ({ onCreate, categories = [] }) => {
  const [open, setOpen] = useState(false);
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

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      formData.nombre.trim() &&
      formData.descripcion.trim() &&
      formData.precio &&
      formData.cantidad
    ) {
      const newProduct = {
        ...formData,
        id: Date.now(), // ID temporal
        precio: parseFloat(formData.precio),
        cantidad: parseInt(formData.cantidad),
        fechaRegistro: new Date().toISOString().split("T")[0],
      };
      if (onCreate) onCreate(newProduct);
      handleClose();
    }
  };

    return (
    <>
      <button
        className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center"
        onClick={handleOpen}
      >
          <i className="bi bi-plus-circle mr-2"></i>
          Nuevo Producto
        </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl border-2 w-full max-w-2xl p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold"
              onClick={handleClose}
              aria-label="Cerrar"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-primary">
              Crear nuevo producto
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">
                    Nombre
                  </label>
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
                  <label className="block text-sm font-medium text-text-main mb-1">
                    Tipo de Producto
                  </label>
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
                  <label className="block text-sm font-medium text-text-main mb-1">
                    Categoría
                  </label>
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
                  <label className="block text-sm font-medium text-text-main mb-1">
                    Color
                  </label>
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
                  <label className="block text-sm font-medium text-text-main mb-1">
                    Precio
                  </label>
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
                  <label className="block text-sm font-medium text-text-main mb-1">
                    Cantidad en Stock
                  </label>
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
                <label className="block text-sm font-medium text-text-main mb-1">
                  Descripción
                </label>
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
                <label className="block text-sm font-medium text-text-main mb-1">
                  URL de la Foto
                </label>
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
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateProduct;
