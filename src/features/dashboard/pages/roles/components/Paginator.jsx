import React from 'react';

const Paginator = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
      >
        <i className="bi bi-chevron-left text-sm"></i>
      </button>
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-md ${currentPage === page
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
      >
        <i className="bi bi-chevron-right text-sm"></i>
      </button>
    </div>
  );
};

export default Paginator;