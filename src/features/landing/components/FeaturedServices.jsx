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
  <section className="py-20 bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] relative overflow-hidden">
    {/* Elementos decorativos */}
    <div className="absolute top-20 right-20 w-40 h-40 bg-[#FACC15]/5 rounded-full blur-3xl"></div>
    <div className="absolute bottom-20 left-20 w-32 h-32 bg-[#FACC15]/10 rounded-full blur-2xl"></div>

    <div className="max-w-6xl mx-auto px-4 relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white font-montserrat mb-6">
          Nuestros <span className="text-[#FACC15]">servicios</span>
        </h2>
        <p className="text-xl text-white/80 max-w-3xl mx-auto font-lato">
          Servicios de alta calidad realizados por profesionales certificados
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {servicios.map((serv, idx) => (
          <div
            key={serv.id}
            className="group relative bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 overflow-hidden"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {/* Efecto de fondo al hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FACC15]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#FACC15] mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#1E1E1E" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036a2.121 2.121 0 01-3-3L16.732 3.732z" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-[#1E1E1E] mb-3 font-nunito group-hover:text-[#FACC15] transition-colors duration-300">
                {serv.name}
              </h3>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2 font-lato leading-relaxed">
                {serv.description}
              </p>

              <div className="mb-4">
                <span className="text-2xl font-bold text-[#FACC15] font-montserrat block mb-1">
                  {serv.price}
                </span>
                <span className="text-xs text-gray-500 font-lato">
                  {serv.category} • {serv.duration}
                </span>
              </div>

              <button className="w-full py-3 bg-[#FACC15] text-[#1E1E1E] font-semibold rounded-full hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg font-poppins">
                Agendar Cita
              </button>
            </div>

            {/* Elemento decorativo */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#FACC15]/20 rounded-full blur-xl group-hover:bg-[#FACC15]/30 transition-colors duration-500"></div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-16">
        <Link to="/landing/servicios">
          <button className="group relative px-10 py-4 bg-transparent border-2 border-[#FACC15] text-[#FACC15] font-bold rounded-full shadow-lg hover:shadow-[#FACC15]/50 transition-all duration-300 transform hover:scale-105 font-poppins overflow-hidden">
            <span className="relative">Ver todos los servicios</span>
            <div className="absolute inset-0 bg-[#FACC15] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-[#FACC15] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-[#1E1E1E] font-bold">Explorar Servicios</span>
            </div>
          </button>
        </Link>
      </div>
    </div>
  </section>
);

export default FeaturedServices; 