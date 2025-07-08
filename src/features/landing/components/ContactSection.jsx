import { FaMapMarkerAlt, FaClock, FaPhoneAlt } from 'react-icons/fa';

const ContactSection = () => (
  <section className="py-12 px-4 bg-gray-900">
    <h2 className="text-3xl font-bold text-center mb-8 text-white">Contacto y Ubicación</h2>
    <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto items-center">
      {/* Columna de texto a la izquierda */}
      <div className="flex-1 flex flex-col justify-center gap-6 bg-gray-800 rounded-lg p-8 shadow text-white">
        {/* Dirección */}
        <div className="flex items-start gap-4 bg-gray-900 rounded-lg p-4 border-l-4 border-indigo-500 shadow-sm">
          <FaMapMarkerAlt className="text-indigo-400 text-2xl mt-1" />
          <div>
            <div className="text-sm uppercase tracking-wider text-indigo-300 font-semibold mb-1">Dirección</div>
            <div className="font-bold text-lg">Cl. 47 #43 - 128, La Candelaria, Medellín, Antioquia</div>
          </div>
        </div>
        {/* Horario */}
        <div className="flex items-start gap-4 bg-gray-900 rounded-lg p-4 border-l-4 border-indigo-500 shadow-sm">
          <FaClock className="text-indigo-400 text-2xl mt-1" />
          <div>
            <div className="text-sm uppercase tracking-wider text-indigo-300 font-semibold mb-1">Horario</div>
            <ul className="ml-2 mt-1 text-sm">
              <li>Lunes: 9:30 a. m. - 6:40 p. m.</li>
              <li>Martes: 9:30 a. m. - 6:40 p. m.</li>
              <li>Miércoles: 9:30 a. m. - 6:40 p. m.</li>
              <li>Jueves: 9:30 a. m. - 5:00 p. m.</li>
              <li>Viernes: 9:30 a. m. - 6:40 p. m.</li>
              <li>Sábado: 9:30 a. m. - 6:40 p. m.</li>
              <li>Domingo: <span className="text-red-400 font-semibold">CERRADO</span></li>
            </ul>
          </div>
        </div>
        {/* Teléfono */}
        <div className="flex items-start gap-4 bg-gray-900 rounded-lg p-4 border-l-4 border-indigo-500 shadow-sm">
          <FaPhoneAlt className="text-indigo-400 text-2xl mt-1" />
          <div>
            <div className="text-sm uppercase tracking-wider text-indigo-300 font-semibold mb-1">Teléfono</div>
            <div className="font-bold text-lg text-indigo-200">321 5956758</div>
          </div>
        </div>
      </div>
      {/* Columna de mapa a la derecha */}
      <div className="flex-1 min-h-[300px] w-full max-w-md rounded-lg overflow-hidden shadow-lg">
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