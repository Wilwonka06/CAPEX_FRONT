import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateCustomer = ({ onBack }) => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    navigate("/dashboard/customers");
  };

  return (
    <div className="p-4 bg-white">
      <div className="flex items-center mb-6">
        <i className="bi bi-arrow-left text-xl mr-2 cursor-pointer" onClick={onBack}></i>
        <h2 className="text-xl">Registrese en CAPEX</h2>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
        <div className="space-y-3">
          <div className="flex items-start">
            <span className="text-red-500 mr-1">*</span>
            <div className="w-full">
              <label className="block mb-1">Nombre:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border rounded p-1.5"
                required
              />
            </div>
          </div>

          <div className="flex items-start">
            <span className="text-red-500 mr-1">*</span>
            <div className="w-full">
              <label className="block mb-1">Apellido:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border rounded p-1.5"
                required
              />
            </div>
          </div>

          <div className="flex items-start">
            <span className="text-red-500 mr-1">*</span>
            <div className="w-full">
              <label className="block mb-1">Tipo de documento:</label>
              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                className="w-full border rounded p-1.5"
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
              <label className="block mb-1">Documento:</label>
              <input
                type="text"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleChange}
                className="w-full border rounded p-1.5"
                required
              />
            </div>
          </div>

          <div className="flex items-start">
            <span className="text-red-500 mr-1">*</span>
            <div className="w-full">
              <label className="block mb-1">Teléfono:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border rounded p-1.5"
                required
              />
            </div>
          </div>

          <div className="flex items-start">
            <span className="text-red-500 mr-1">*</span>
            <div className="w-full">
              <label className="block mb-1">Correo:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded p-1.5"
                required
              />
            </div>
          </div>

          <div className="flex items-start">
            <span className="text-red-500 mr-1">*</span>
            <div className="w-full">
              <label className="block mb-1">Contraseña:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded p-1.5"
                required
              />
            </div>
          </div>

          <div className="flex items-start">
            <span className="text-red-500 mr-1">*</span>
            <div className="w-full">
              <label className="block mb-1">Confirmar contraseña:</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border rounded p-1.5"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-1.5 border rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-1.5 border rounded"
          >
            Registrarme
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCustomer;