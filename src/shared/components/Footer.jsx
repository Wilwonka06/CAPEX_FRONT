import { Link } from 'react-router-dom';

const Footer = () => {
  return (
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
              <a
                href="https://www.facebook.com/Astridpariass/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FACC15] hover:text-yellow-400 transition-colors"
                aria-label="Facebook"
              >
                <i className="bi bi-facebook text-xl"></i>
              </a>
              <a
                href="https://www.instagram.com/extensiones_astrid_parias?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FACC15] hover:text-yellow-400 transition-colors"
                aria-label="Instagram"
              >
                <i className="bi bi-instagram text-xl"></i>
              </a>
              <a
                href="https://wa.me/573215956758"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FACC15] hover:text-yellow-400 transition-colors"
                aria-label="WhatsApp"
              >
                <i className="bi bi-whatsapp text-xl"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-white/80">
              <li><Link to="/landing" className="hover:text-[#FACC15] transition-colors">Inicio</Link></li>
              <li><Link to="/landing/catalogo" className="hover:text-[#FACC15] transition-colors">Productos</Link></li>
              <li><Link to="/landing/servicios" className="hover:text-[#FACC15] transition-colors">Servicios</Link></li>
              <li><Link to="/landing" className="hover:text-[#FACC15] transition-colors">Sobre Nosotros</Link></li>
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
  );
};

export default Footer;