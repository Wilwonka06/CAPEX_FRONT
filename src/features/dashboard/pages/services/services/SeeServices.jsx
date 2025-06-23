import React from "react";

const SeeServices = ({ onClose }) => {
  const servicio = {
    id: 1,
    servicio: "Corte de cabello",
    categoria: "Servicio de corte",
    descripcion: "Corte completo",
    duracion: "20 min",
    precio: "20.000",
    estado: "Activo",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Ver servicio</h2>
        <div className="space-y-3 text-text-main">
          <p><strong>ID:</strong> {servicio.id}</p>
          <p><strong>Servicio:</strong> {servicio.servicio}</p>
          <p><strong>Categoria:</strong> {servicio.categoria}</p>
          <p><strong>Descripcion:</strong> {servicio.descripcion}</p>
          <p><strong>Duracion:</strong> {servicio.duracion}</p>
          <p><strong>Precio:</strong> {servicio.precio}</p>
          <p>
            <strong>Estado:</strong>{" "}
            <span className={servicio.estado === "Activo" ? "text-green-600" : "text-red-600"}>
              {servicio.estado}
            </span>
          </p>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-primary-dark text-white px-4 py-2 rounded hover:bg-primary transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
export default SeeServices;
