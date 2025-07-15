import React from 'react';

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
  <section className="py-16 bg-white">
    <div className="max-w-5xl mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-[#1E1E1E]">
        ¿Por qué elegir <span className="text-[#FACC15]">CAPEX</span>?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {beneficios.map((b, idx) => (
          <div key={idx} className="flex flex-col items-center text-center p-6 bg-[#1E1E1E] rounded-2xl border border-[#FACC15] shadow-lg hover:shadow-2xl transition-all">
            <div className="mb-4">{b.icon}</div>
            <span className="text-lg font-semibold text-white">{b.texto}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default BenefitsSection;