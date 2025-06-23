import React from "react";

const SearchCategory = ({ searchTerm, handleSearch }) => {
  return (
    <div className="relative flex-grow mr-4">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <i className="bi bi-search text-gray-400"></i>
      </div>
      <input 
        type="text" 
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5" 
        placeholder="Buscar categorías..." 
        value={searchTerm}
        onChange={handleSearch}
      />
    </div>
  );
};

export default SearchCategory;