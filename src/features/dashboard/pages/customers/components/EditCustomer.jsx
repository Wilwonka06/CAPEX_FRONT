import { useState, useEffect } from "react";
import { validateCustomer } from "../services/ValidateCustomerService";

const EditProductCard = ({ children, title, onClose }) => (
  <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-4 md:p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto border border-gray-200">
    <button
      className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold"
      onClick={onClose}
      aria-label="Cerrar"
    >
      ×
    </button>
    <h2 className="text-xl font-bold mb-4 text-primary">{title}</h2>
    {children}
  </div>
);

const EditCustomer = ({ isOpen, onClose, customer, onEdit, loading, customers = [] }) => {
  const [formData, setFormData] = useState({
    documentType: "",
    documentNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });
  const [errors, setErrors] = useState({});

  // Cargar datos del cliente cuando se abre el modal
  useEffect(() => {
    if (customer && isOpen) {
      setFormData({
        documentType: customer.documentType || "",
        documentNumber: customer.documentNumber || "",
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        email: customer.email || "",
        phone: customer.phone || ""
      });
    }
  }, [customer, isOpen]);

  // Resetear formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        documentType: "",
        documentNumber: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: ""
      });
      setErrors({});
    }
  }, [isOpen]);

  // Validación en tiempo real
  useEffect(() => {
    if (isOpen && customer) {
      const otherCustomers = customers.filter(c => c.id !== customer.id);
      const validation = validateCustomer(formData, otherCustomers);
      setErrors(validation.errors);
    }
  }, [formData, customers, customer, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(errors).length === 0 && onEdit) onEdit(formData);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <EditProductCard title="Editar cliente" onClose={handleClose}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Nombre *</label>
              <input
                type="text"
                name="firstName"
                className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Ej. Juan"
              />
              {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Apellido *</label>
              <input
                type="text"
                name="lastName"
                className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Ej. Pérez"
              />
              {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Tipo de documento *</label>
              <select
                name="documentType"
                className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                value={formData.documentType}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Seleccione...</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="TI">Tarjeta de Identidad</option>
              </select>
              {errors.documentType && <p className="text-red-600 text-xs mt-1">{errors.documentType}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Número de documento *</label>
              <input
                type="text"
                name="documentNumber"
                className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                value={formData.documentNumber}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Ej. 123456789"
              />
              {errors.documentNumber && <p className="text-red-600 text-xs mt-1">{errors.documentNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Correo electrónico *</label>
              <input
                type="email"
                name="email"
                className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Ej. correo@ejemplo.com"
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Teléfono *</label>
              <input
                type="tel"
                name="phone"
                className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Ej. 3001234567"
              />
              {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary-dark transition flex items-center"
              disabled={loading || Object.keys(errors).length > 0}
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle mr-2"></i>
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </EditProductCard>
    </div>
  );
};

export default EditCustomer; 