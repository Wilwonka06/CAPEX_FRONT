import PropTypes from 'prop-types';

const Paginator = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage, 
  totalItems,
  showInfo = false 
}) => {
  // Si solo hay una página o menos, no mostrar el paginador
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2; 
    const pages = [];

    // Si hay 7 o menos páginas, mostrar todas
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Siempre mostrar la primera página
    pages.push(1);

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    // Agregar elipsis si hay un gap
    if (start > 2) {
      pages.push('...');
    }

    // Agregar páginas del rango
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Agregar elipsis si hay un gap al final
    if (end < totalPages - 1) {
      pages.push('...');
    }

    // Siempre mostrar la última página
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page) => {
    if (typeof page === 'number' && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const startItem = itemsPerPage && totalItems ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = itemsPerPage && totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : null;
  const hasInfo = showInfo && startItem !== null && endItem !== null;

  return (
    <div className="w-full px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 sm:px-6 mt-4 bg-white rounded-b-lg gap-3">
      {/* Información de resultados */}
      {hasInfo && (
        <div className="text-sm text-gray-700">
          Mostrando <span className="font-medium text-gray-900">{startItem}</span> a{' '}
          <span className="font-medium text-gray-900">{endItem}</span> de{' '}
          <span className="font-medium text-gray-900">{totalItems}</span> resultados
        </div>
      )}

      {/* Controles de paginación */}
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        {/* Botón Anterior */}
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          aria-label="Página anterior"
        >
          <i className="bi bi-chevron-left text-xs"></i>
        </button>

        {/* Números de página */}
        {getVisiblePages().map((page, index) => (
          <button
            type="button"
            key={`page-${index}-${page}`}
            onClick={() => handlePageClick(page)}
            disabled={page === '...'}
            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary ${
              page === currentPage
                ? 'z-10 bg-yellow-50 border-yellow-500 text-yellow-700 font-bold'
                : page === '...'
                ? 'bg-white border-gray-300 text-gray-700 cursor-default'
                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Botón Siguiente */}
        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          aria-label="Página siguiente"
        >
          <i className="bi bi-chevron-right text-xs"></i>
        </button>
      </nav>
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
