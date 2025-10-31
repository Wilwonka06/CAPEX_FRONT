import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FeaturedProducts from './FeaturedProducts';
import ContactSection from './ContactSection';
import FeaturedServices from './FeaturedServices';
import BenefitsSection from './BenefitsSection';
import imagenLanding from '../../../shared/images/imagenLanding.jpg';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="overflow-x-hidden">
      {/* Sección Principal de Bienvenida */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img
          src={imagenLanding}
          alt="Fondo principal"
          className="absolute inset-0 w-full h-full object-cover z-0 scale-105 animate-pulse"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70 z-10"></div>

        {/* Elementos decorativos */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#FACC15]/10 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-[#FACC15]/20 rounded-full blur-lg animate-pulse"></div>

        <div className={`relative z-20 flex flex-col items-center text-center text-white px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-[#FACC15]/20 backdrop-blur-sm rounded-full text-[#FACC15] text-sm font-medium mb-4 border border-[#FACC15]/30">
              ✨ Tu belleza, nuestra pasión
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl font-montserrat bg-gradient-to-r from-white via-[#FACC15] to-white bg-clip-text text-transparent">
            CAPEX
          </h1>

          <p className="text-xl md:text-2xl font-medium max-w-3xl drop-shadow-lg font-lato mb-8 leading-relaxed">
            Transforma tu imagen con nuestros productos premium y servicios profesionales.
            <span className="text-[#FACC15] font-semibold"> Calidad excepcional</span> para realzar tu belleza natural.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link to="/landing/catalogo">
              <button className="group relative px-8 py-4 bg-[#FACC15] text-[#1E1E1E] font-bold rounded-full shadow-2xl hover:shadow-[#FACC15]/50 transition-all duration-300 transform hover:scale-105 font-poppins overflow-hidden">
                <span className="relative z-10">Explorar Productos</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#FACC15] to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </Link>

            <Link to="/landing/servicios">
              <button className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full backdrop-blur-sm hover:bg-white/10 hover:border-[#FACC15] transition-all duration-300 transform hover:scale-105 font-poppins">
                Nuestros Servicios
              </button>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-[#FACC15] rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Beneficios Mejorada */}
      <BenefitsSection />

      {/* Sección de Servicios Destacados */}
      <FeaturedServices />

      {/* Sección de Productos Destacados */}
      <FeaturedProducts />

      {/* Sección de Estadísticas */}
      <section className="py-16 bg-gradient-to-r from-[#1E1E1E] to-[#2A2A2A]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold text-[#FACC15] mb-2 group-hover:scale-110 transition-transform duration-300">500+</div>
              <div className="text-white/80 font-medium">Clientes Satisfechos</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold text-[#FACC15] mb-2 group-hover:scale-110 transition-transform duration-300">50+</div>
              <div className="text-white/80 font-medium">Productos Premium</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold text-[#FACC15] mb-2 group-hover:scale-110 transition-transform duration-300">10+</div>
              <div className="text-white/80 font-medium">Años de Experiencia</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold text-[#FACC15] mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
              <div className="text-white/80 font-medium">Atención Personalizada</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Contacto */}
      <ContactSection />

      {/* Footer */}
      <footer className="bg-[#1E1E1E] text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-[#FACC15] mb-4 font-montserrat">CAPEX</h3>
              <p className="text-white/80 mb-4 font-lato">
                Tu destino para productos de belleza premium y servicios profesionales.
                Transformamos tu imagen con calidad y pasión.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-[#FACC15] hover:text-yellow-400 transition-colors">
                  <i className="bi bi-facebook text-xl"></i>
                </a>
                <a href="#" className="text-[#FACC15] hover:text-yellow-400 transition-colors">
                  <i className="bi bi-instagram text-xl"></i>
                </a>
                <a href="#" className="text-[#FACC15] hover:text-yellow-400 transition-colors">
                  <i className="bi bi-whatsapp text-xl"></i>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-white/80">
                <li><Link to="/landing/catalogo" className="hover:text-[#FACC15] transition-colors">Productos</Link></li>
                <li><Link to="/landing/servicios" className="hover:text-[#FACC15] transition-colors">Servicios</Link></li>
                <li><Link to="/landing" className="hover:text-[#FACC15] transition-colors">Sobre Nosotros</Link></li>
                <li><Link to="/landing" className="hover:text-[#FACC15] transition-colors">Contacto</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Atención al Cliente</h4>
              <ul className="space-y-2 text-white/80">
                <li>📞 321 5956758</li>
                <li>📧 info@capex.com</li>
                <li>📍 Medellín, Colombia</li>
                <li>🕒 Lun-Sáb: 9:30-18:40</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-white/60 text-sm">
              © 2025 CAPEX. Todos los derechos reservados. |
              <span className="text-[#FACC15]"> Hecho con ❤️ para tu belleza</span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;