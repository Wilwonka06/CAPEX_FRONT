import React, { useState } from 'react';

// Imágenes de ejemplo (puedes reemplazar por URLs reales)
const transformaciones = [
  {
    antes: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=400&h=400&facepad=2',
    despues: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=400&h=400&facepad=2',
    descripcion: 'Extensión lacia natural, resultado brillante y saludable.'
  },
  {
    antes: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=400&h=400&facepad=2',
    despues: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=facearea&w=400&h=400&facepad=2',
    descripcion: 'Transformación con extensiones rubias premium.'
  },
  {
    antes: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=facearea&w=400&h=400&facepad=2',
    despues: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=400&h=400&facepad=2',
    descripcion: 'Cabello con volumen y color vibrante.'
  },
];

const TransformationsCarousel = () => {
  const [index, setIndex] = useState(0);
  const total = transformaciones.length;

  const prev = () => setIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  const next = () => setIndex((prev) => (prev === total - 1 ? 0 : prev + 1));

  const actual = transformaciones[index];

  return (
    <section className="py-16 bg-[#1E1E1E]">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-white font-montserrat">
          Transformaciones <span className="text-[#FACC15]">reales</span>
        </h2>
        <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 bg-[#232323] rounded-2xl p-8 shadow-lg border border-[#FACC15]">
          {/* Antes */}
          <div className="flex flex-col items-center">
            <span className="text-[#FACC15] font-semibold mb-2 font-nunito">Antes</span>
            <img src={actual.antes} alt="Antes" className="w-40 h-40 object-cover rounded-xl border-4 border-[#FACC15] mb-2" />
          </div>
          {/* Flechas */}
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#FACC15] text-[#1E1E1E] rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-yellow-400 transition-all z-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#FACC15] text-[#1E1E1E] rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-yellow-400 transition-all z-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          {/* Después */}
          <div className="flex flex-col items-center">
            <span className="text-[#FACC15] font-semibold mb-2 font-nunito">Después</span>
            <img src={actual.despues} alt="Después" className="w-40 h-40 object-cover rounded-xl border-4 border-[#FACC15] mb-2" />
          </div>
        </div>
        <p className="text-center text-white mt-6 text-lg font-medium font-lato">{actual.descripcion}</p>
        {/* Indicadores */}
        <div className="flex justify-center gap-2 mt-4">
          {transformaciones.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-3 h-3 rounded-full border-2 ${i === index ? 'bg-[#FACC15] border-[#FACC15]' : 'bg-[#232323] border-[#FACC15]'}`}
              aria-label={`Ir a transformación ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransformationsCarousel; 