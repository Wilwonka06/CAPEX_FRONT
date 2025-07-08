import { FaGem, FaHandshake, FaHeart } from 'react-icons/fa';

const benefits = [
  {
    icon: <FaGem className="text-6xl text-primary" />,
    title: "Productos de Calidad",
    description: "Ofrecemos solo productos premium de las mejores marcas, garantizando resultados excepcionales y durabilidad."
  },
  {
    icon: <FaHandshake className="text-6xl text-primary" />,
    title: "Servicios Profesionales",
    description: "Nuestro equipo de expertos está certificado y cuenta con años de experiencia en el sector de la belleza."
  },
  {
    icon: <FaHeart className="text-6xl text-primary" />,
    title: "Atención Personalizada",
    description: "Cada cliente es único. Te brindamos asesoría personalizada para encontrar la solución perfecta para ti."
  }
];

const BenefitsSection = () => (
  <section className="py-16 px-4 bg-white">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-primary-dark mb-4">¿Por qué elegirnos?</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">   
          Descubre las ventajas que nos hacen únicos en el mercado de la belleza
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-2 shadow-lg hover:shadow-xl border border-gray-200"
          >
            <div className="flex justify-center mb-6">
              {benefit.icon}
            </div>
            <h3 className="text-2xl font-bold text-primary-dark mb-4">
              {benefit.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default BenefitsSection;