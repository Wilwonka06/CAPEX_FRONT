import DetailServices from './components/DetailServices';
import React, { useState } from "react";

const ServicesPage = () => {
  const servicios = [
    { id: 1, nombre: "Servicio 1", precio: "20.000$", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcoEYCK8Au51Vw3ElRJiZeiXyA6n6zKb2vfQ&s" },
    { id: 2, nombre: "Servicio 2", precio: "25.000$", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcoEYCK8Au51Vw3ElRJiZeiXyA6n6zKb2vfQ&s" },
    { id: 3, nombre: "Servicio 3", precio: "30.000$", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcoEYCK8Au51Vw3ElRJiZeiXyA6n6zKb2vfQ&s" },

  ];
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="flex justify-between mb-4 items-center">
        <h1 className="text-4xl font-bold text-text-main ml-8">Servicios</h1>
        <input
          type="text"
          placeholder="Buscar servicios..."
          className="w-48 border border-primary-dark px-2 py-1 text-sm mr-8 rounded focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 py-12 px-4 place-items-center">
        {servicios.map((servicio) => (
          <div
            key={servicio.id}
            className="bg-background border border-background rounded-lg overflow-hidden shadow-md flex flex-col"
            style={{ width: "400px" , height: "500px"}} // w-64
          >
            {/* Imagen casi cuadrada */}
            <img
              src={servicio.img}
              alt={servicio.nombre}
              className="w-full h-70 object-cover"
            />

            <div className="p-4 flex flex-col flex-1 justify-between">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-text-main font-medium text-base">{servicio.nombre}</h2>
                <span className="text-text-main font-bold text-base">{servicio.precio}</span>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(true)}
                className="text-accent text-base hover:underline mb-2 text-left py-2"
              >
                Detalles
              </button>
              
              <button className="bg-primary-dark text-white w-full py-4 rounded text-lg hover:bg-primary transition mt-auto">
                Agendar
              </button>
            </div>
          </div>
        ))}
      </div>
      {isDetailModalOpen && <DetailServices onClose={() => setIsDetailModalOpen(false)} />}

    </div>
  );
};

export default ServicesPage;
