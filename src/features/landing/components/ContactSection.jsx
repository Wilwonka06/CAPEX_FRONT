import { FaMapMarkerAlt, FaClock, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';

const direccion = 'Cl. 47 #43 - 128, La Candelaria, Medellín, Antioquia';
const telefono = '321 5956758';
const whatsappLink = 'https://wa.me/573215956758?text=Hola%20quiero%20más%20información%20sobre%20extensiones%20y%20servicios';
const mapsLink = 'https://goo.gl/maps/6Qw6Qw6Qw6Qw6Qw6A';

const ContactSection = () => (
  <section className="py-16 px-4 bg-[#1E1E1E]">
    <h2 className="text-3xl font-bold text-center mb-10 text-white font-montserrat">
      Contáctanos y <span className="text-[#FACC15]">visítanos</span>
    </h2>
    <div className="flex flex-col md:flex-row gap-10 max-w-5xl mx-auto items-center">
      {/* Columna de texto a la izquierda */}
      <div className="flex-1 flex flex-col justify-center gap-8 bg-[#232323] rounded-2xl p-8 shadow-lg border text-white">
        {/* Dirección */}
        <div className="flex items-start gap-4">
          <FaMapMarkerAlt className="text-[#FACC15] text-2xl mt-1" />
          <div>
            <div className="text-xs uppercase tracking-wider text-[#FACC15] font-semibold mb-1 font-nunito">Dirección</div>
            <div className="font-bold text-lg mb-1 font-lato">{direccion}</div>
            <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="text-[#FACC15] underline text-sm hover:text-yellow-400 transition font-lato">Ver en Google Maps</a>
          </div>
        </div>
        {/* Horario */}
        <div className="flex items-start gap-4">
          <FaClock className="text-[#FACC15] text-2xl mt-1" />
          <div>
            <div className="text-xs uppercase tracking-wider text-[#FACC15] font-semibold mb-1 font-nunito">Horario</div>
            <ul className="ml-2 mt-1 text-sm font-lato">
              <li>Lunes a Miércoles: 9:30 a. m. - 6:40 p. m.</li>
              <li>Jueves: 9:30 a. m. - 5:00 p. m.</li>
              <li>Viernes y Sábado: 9:30 a. m. - 6:40 p. m.</li>
              <li>Domingo: <span className="text-red-400 font-semibold">CERRADO</span></li>
            </ul>
          </div>
        </div>
        {/* Teléfono y WhatsApp */}
        <div className="flex items-start gap-4">
          <FaPhoneAlt className="text-[#FACC15] text-2xl mt-1" />
          <div>
            <div className="text-xs uppercase tracking-wider text-[#FACC15] font-semibold mb-1 font-nunito">Teléfono</div>
            <div className="font-bold text-lg text-white mb-2 font-lato">{telefono}</div>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#FACC15] text-[#1E1E1E] font-semibold px-4 py-2 rounded-full shadow hover:bg-yellow-400 transition-all text-sm font-poppins">
              <FaWhatsapp className="text-xl" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
      {/* Columna de mapa a la derecha */}
      <div className="flex-1 min-h-[300px] w-full max-w-md rounded-2xl overflow-hidden shadow-lg">
        <iframe
          title="Ubicación"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.1414228156036!2d-75.5650838!3d6.245086699999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e44291c415d59af%3A0xe4b83cb2caa41fa1!2sExtensiones%20astrid%20parias!5e0!3m2!1ses-419!2sco!4v1751560166126!5m2!1ses-419!2sco"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  </section>
);

export default ContactSection; 