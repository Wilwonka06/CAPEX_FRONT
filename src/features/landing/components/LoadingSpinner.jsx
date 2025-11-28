import PropTypes from 'prop-types';

/**
 * Componente de carga estándar para todas las páginas del landing
 * Basado en el diseño del catálogo de productos
 */
const LoadingSpinner = ({ message = 'Cargando...', subMessage = 'Estamos preparando lo mejor para ti' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center">
      <div className="text-center bg-white p-12 rounded-3xl shadow-xl border border-gray-100">
        <div className="relative mb-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FACC15]/20 border-t-[#FACC15] mx-auto"></div>
          <div 
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FACC15]/40 animate-spin mx-auto" 
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          ></div>
        </div>
        <h3 className="text-xl font-bold text-[#1E1E1E] mb-2 font-montserrat">{message}</h3>
        {subMessage && (
          <p className="text-gray-600 font-lato">{subMessage}</p>
        )}
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  subMessage: PropTypes.string,
};

export default LoadingSpinner;

