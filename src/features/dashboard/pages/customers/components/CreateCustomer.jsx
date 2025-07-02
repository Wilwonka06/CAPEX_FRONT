import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateCustomer = ({ onBack, onCreate }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    documentType: "",
    documentNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onCreate(formData);
    } catch (err) {
      setError(err.message || "Error al crear cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 p-2 bg-primary-dark text-white rounded hover:bg-primary transition"
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        <h2 className="text-xl font-semibold text-text-main">Registrese en CAPEX</h2>
      </div>

      <div className="max-w-2xl mx-auto bg-background p-6 rounded-lg border border-background shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-red-500 mr-1">*</span>
              <div className="w-full">
                <label className="block mb-1 text-text-main font-medium">Nombre:</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border border-accent rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                  required
                  placeholder="Ej. Juan"
                />
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-red-500 mr-1">*</span>
              <div className="w-full">
                <label className="block mb-1 text-text-main font-medium">Apellido:</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border border-accent rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                  required
                  placeholder="Ej. Pérez"
                />
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-red-500 mr-1">*</span>
              <div className="w-full">
                <label className="block mb-1 text-text-main font-medium">Tipo de documento:</label>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleChange}
                  className="w-full border border-accent rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="TI">Tarjeta de Identidad</option>
                </select>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-red-500 mr-1">*</span>
              <div className="w-full">
                <label className="block mb-1 text-text-main font-medium">Documento:</label>
                <input
                  type="text"
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleChange}
                  className="w-full border border-accent rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                  required
                  placeholder="Ej. 123456789"
                />
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-red-500 mr-1">*</span>
              <div className="w-full">
                <label className="block mb-1 text-text-main font-medium">Teléfono:</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-accent rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                  required
                  placeholder="Ej. 3001234567"
                />
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-red-500 mr-1">*</span>
              <div className="w-full">
                <label className="block mb-1 text-text-main font-medium">Correo:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-accent rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                  required
                  placeholder="Ej. correo@ejemplo.com"
                />
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-red-500 mr-1">*</span>
              <div className="w-full">
                <label className="block mb-1 text-text-main font-medium">Contraseña:</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-accent rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                  required
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-red-500 mr-1">*</span>
              <div className="w-full">
                <label className="block mb-1 text-text-main font-medium">Confirmar contraseña:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-accent rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                  required
                  placeholder="Repita la contraseña"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 border border-primary-dark text-primary-dark rounded hover:bg-accent-light transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-dark text-white rounded hover:bg-primary transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrarme"}
            </button>
          </div>
        </form>
        {error && (
          <div className="text-red-600 text-center mt-2">{error}</div>
        )}
      </div>
    </div>
  );
};

export default CreateCustomer;