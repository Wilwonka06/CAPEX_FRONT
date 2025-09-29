import React from 'react';
import PropTypes from 'prop-types';

const SearchRole = ({ searchTerm, onSearchChange, placeholder = "Buscar roles..." }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i className="bi bi-search text-gray-400"></i>
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder={placeholder}
        value={searchTerm}
        onChange={onSearchChange}
      />
    </div>
  );
};

SearchRole.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export default SearchRole;
