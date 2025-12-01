import PropTypes from 'prop-types';

const Paginator = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage, 
  totalItems,
  showInfo = false 
}) => {
  // Si solo hay una página, no mostrar el paginador
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 3; // Número de páginas a mostrar a cada lado de la página actual
    const pages = [];

    // Si hay pocas páginas (7 o menos), mostrar todas
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Siempre mostrar la primera página
    pages.push(1);

    // Calcular el rango alrededor de la página actual
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    // Si hay un gap entre la página 1 y el inicio del rango, agregar "..."
    if (start > 2) {
      pages.push('...');
    }

    // Agregar páginas del rango (excluyendo 1 y totalPages que ya se manejan)
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Si hay un gap entre el final del rango y la última página, agregar "..."
    if (end < totalPages - 1) {
      pages.push('...');
    }

    // Siempre mostrar la última página
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  // Calcular información de items si se proporciona
  const startItem = itemsPerPage && totalItems ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = itemsPerPage && totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  // Si showInfo está activado, usar layout con información
  if (showInfo && itemsPerPage && totalItems) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 mt-4 gap-4">
        {/* Información de items */}
        <div className="w-full sm:w-auto">
          <p className="text-sm text-gray-700 text-center sm:text-left">
            Mostrando <span className="font-medium">{startItem}</span> a{' '}
            <span className="font-medium">{endItem}</span> de{' '}
            <span className="font-medium">{totalItems}</span> resultados
          </p>
        </div>
        
        {/* Controles de paginación */}
        <div className="flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* Botón Anterior */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página anterior"
            >
              <span className="sr-only">Anterior</span>
              <i className="bi bi-chevron-left"></i>
            </button>

            {/* Páginas */}
            {getVisiblePages().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={page === '...'}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  page === currentPage
                    ? 'z-10 bg-yellow-600 border-yellow-600 shadow-md transform scale-105 text-white'
                    : page === '...'
                    ? 'border-gray-300 bg-white text-gray-700 cursor-default'
                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Botón Siguiente */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página siguiente"
            >
              <span className="sr-only">Siguiente</span>
              <i className="bi bi-chevron-right"></i>
            </button>
          </nav>
        </div>
      </div>
    );
  }

  // Layout simple (por defecto)
  return (
    <div className="flex justify-center items-center gap-1 mt-8">
      {/* Botón Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-colors"
        aria-label="Página anterior"
      >
        ‹
      </button>

      {/* Páginas */}
      {getVisiblePages().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`flex items-center justify-center w-8 h-8 rounded border transition-colors ${
            page === currentPage
              ? 'bg-yellow-600 border-yellow-600 shadow-md transform scale-105 text-white shadow-sm'
              : page === '...'
              ? 'border-transparent bg-transparent text-gray-500 cursor-default'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Botón Siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-colors"
        aria-label="Página siguiente"
      >
        ›
      </button>
    </div>
  );
};

Paginator.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  itemsPerPage: PropTypes.number,
  totalItems: PropTypes.number,
  showInfo: PropTypes.bool,
};

export default Paginator;
