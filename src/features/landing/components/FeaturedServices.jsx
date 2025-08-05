import React from 'react';
import { Link } from 'react-router-dom';

const servicios = [
  {
    id: 1,
    name: 'Corte de cabello',
    category: 'Peluquería',
    duration: '30 min',
    price: '$25.000',
    description: 'Corte clásico para hombre o mujer',
    estado: 'Activo',
  },
  {
    id: 2,
    name: 'Manicura Completa',
    category: 'Uñas',
    duration: '45 min',
    price: '$35.000',
    description: 'Manicura profesional con esmaltado',
    estado: 'Activo',
  },
  {
    id: 4,
    name: 'Depilación Láser',
    category: 'Estética',
    duration: '20 min',
    price: '$150.000',
    description: 'Depilación láser definitiva',
    estado: 'Activo',
  },
  {
    id: 5,
    name: 'Limpieza Facial',
    category: 'Cuidado Facial',
    duration: '50 min',
    price: '$60.000',
    description: 'Limpieza profunda de cutis',
    estado: 'Activo',
  },
];

const FeaturedServices = () => (
  <section className="py-16 bg-white">
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-[#1E1E1E] font-montserrat">
        Nuestros <span className="text-[#FACC15]">servicios</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {servicios.map((serv) => (
          <div
            key={serv.id}
            className="bg-[#1E1E1E] rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-[#FACC15] hover:shadow-2xl transition-all"
          >
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#FACC15] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#1E1E1E" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036a2.121 2.121 0 01-3-3L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 font-nunito">{serv.name}</h3>
            <p className="text-sm text-gray-300 mb-2 line-clamp-2 font-lato">{serv.description}</p>
            <span className="text-[#FACC15] font-bold text-lg mb-1 block font-montserrat">{serv.price}</span>
            <span className="text-xs text-gray-400 mb-2 font-lato">{serv.category} • {serv.duration}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-10">
        <Link to="/landing/servicios">
          <button className="bg-[#FACC15] text-[#1E1E1E] font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-yellow-400 transition-all text-lg font-poppins">
            Ver todos los servicios
          </button>
        </Link>
      </div>
    </div>
  </section>
);

export default FeaturedServices; 