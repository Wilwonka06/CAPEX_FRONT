import React from 'react'; // Keep React import
import FeaturedProducts from './FeaturedProducts'; // Assuming these components are in the same directory or correct relative path
import ContactSection from './ContactSection';
import BenefitsSection from './BenefitsSection';
import imagenLanding from '../../../shared/images/imagenLanding.jpg'; // Path to your landing image

const Home = () => (
  <main>
    {/* Sección Principal de Bienvenida */}
    <section className="relative h-screen flex items-center justify-center">
      <img
        src={imagenLanding}
        alt="Fondo principal"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="absolute inset-0 bg-black opacity-60 z-10"></div> {/* Overlay for transparency */}
      <div className="relative z-20 flex flex-col items-center text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">CAPEX</h1> {/* Using CAPEX as per Sidebar logo */}
        <p className="text-lg md:text-2xl font-medium max-w-2xl drop-shadow">Bienvenido a nuestra plataforma. Desarrolla tus habilidades y descubre nuestros productos y servicios.</p>
      </div>
    </section>

    {/* Sección de Beneficios (asumida como parte de la landing structure) */}
    <BenefitsSection />

    {/* Sección de Productos Destacados */}
    <FeaturedProducts />

    {/* Sección de Contacto */}
    <ContactSection />
  </main>
);

export default Home;