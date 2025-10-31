const beneficios = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FACC15" className="w-10 h-10 mx-auto">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9zm0 0v-4.5m0 0c-1.5 0-2.25-1.5-2.25-3s.75-3 2.25-3 2.25 1.5 2.25 3-.75 3-2.25 3z" />
      </svg>
    ),
    texto: '100% cabello humano',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FACC15" className="w-10 h-10 mx-auto">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
    texto: 'Suavidad y durabilidad garantizada',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FACC15" className="w-10 h-10 mx-auto">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    texto: 'Entregas rápidas y seguras',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FACC15" className="w-10 h-10 mx-auto">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
    texto: 'Asesoría personalizada',
  },
];

const BenefitsSection = () => (
  <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden">
    {/* Elementos decorativos */}
    <div className="absolute top-10 left-10 w-20 h-20 bg-[#FACC15]/10 rounded-full blur-xl"></div>
    <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#FACC15]/5 rounded-full blur-2xl"></div>

    <div className="max-w-6xl mx-auto px-4 relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-[#1E1E1E] font-montserrat mb-6">
          ¿Por qué elegir <span className="text-[#FACC15]">CAPEX</span>?
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto font-lato">
          Descubre por qué miles de clientes confían en nosotros para realzar su belleza natural
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {beneficios.map((b, idx) => (
          <div
            key={idx}
            className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
          >
            {/* Efecto de fondo al hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FACC15]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10">
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                {b.icon}
              </div>
              <span className="text-lg font-semibold text-[#1E1E1E] font-nunito group-hover:text-[#FACC15] transition-colors duration-300">
                {b.texto}
              </span>
            </div>

            {/* Elemento decorativo */}
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-[#FACC15]/10 rounded-full blur-lg group-hover:bg-[#FACC15]/20 transition-colors duration-500"></div>
          </div>
        ))}
      </div>

      {/* Call to action adicional */}
      <div className="text-center mt-16">
        <p className="text-gray-600 mb-6 text-lg">
          ¿Listo para transformar tu imagen?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-[#FACC15] text-[#1E1E1E] font-bold rounded-full hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg">
            Comienza Ahora
          </button>
          <button className="px-8 py-3 border-2 border-[#FACC15] text-[#FACC15] font-semibold rounded-full hover:bg-[#FACC15] hover:text-[#1E1E1E] transition-all duration-300">
            Más Información
          </button>
        </div>
      </div>
    </div>
  </section>
);

export default BenefitsSection;