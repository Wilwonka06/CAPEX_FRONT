import React, { useState } from "react";

const ProductSelector = ({ selectedProducts, onProductsChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProductForQuantity, setSelectedProductForQuantity] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const availableProducts = [
    { id: 1, name: "Shampoo", price: 15000, category: "Cuidado Capilar" },
    { id: 2, name: "Tratamiento", price: 25000, category: "Tratamientos" },
    { id: 3, name: "Acondicionador", price: 12000, category: "Cuidado Capilar" },
    { id: 4, name: "Mascarilla", price: 18000, category: "Tratamientos" },
    { id: 5, name: "Aceite Capilar", price: 20000, category: "Aceites" }
  ];

  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (product) => {
    const isAlreadySelected = selectedProducts.some(p => p.id === product.id);
    if (!isAlreadySelected) {
      setSelectedProductForQuantity(product);
      setQuantity(1);
      setShowQuantityModal(true);
    }
    setSearchTerm("");
    setIsOpen(false);
  };

  const confirmProductSelection = () => {
    if (selectedProductForQuantity && quantity > 0) {
      const productWithQuantity = { 
        ...selectedProductForQuantity, 
        quantity,
        subtotal: selectedProductForQuantity.price * quantity,
        uniqueId: Date.now()
      };
      
      onProductsChange([...selectedProducts, productWithQuantity]);
      setShowQuantityModal(false);
      setSelectedProductForQuantity(null);
      setQuantity(1);
    }
  };

  const cancelProductSelection = () => {
    setShowQuantityModal(false);
    setSelectedProductForQuantity(null);
    setQuantity(1);
  };

  const removeProduct = (uniqueId) => {
    onProductsChange(selectedProducts.filter(p => p.uniqueId !== uniqueId));
  };

  const isFormValid = quantity > 0;
  const totalProducts = selectedProducts.reduce((total, product) => total + product.subtotal, 0);

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
            placeholder="Buscar productos..."
          />
          <i className="bi bi-search absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {/* Dropdown de productos */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => handleProductSelect(product)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
            >
              <div className="flex justify-between">
                <span>{product.name}</span>
                <span className="text-gray-600">${product.price}</span>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="px-3 py-2 text-gray-500 text-sm">
              No se encontraron productos
            </div>
          )}
        </div>
      )}

      {/* Modal para cantidad y detalles del producto */}
      {showQuantityModal && selectedProductForQuantity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-in flex flex-col border border-gray-200">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
              <div>
                <h2 className="text-xl font-bold text-accent m-0">Detalles del Producto</h2>
              </div>
              <button
                onClick={cancelProductSelection}
                className="text-gray-400 hover:text-black text-xl font-bold"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            
            {/* Contenido */}
            <div className="p-8 bg-white">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-black mb-1">Producto</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                    {selectedProductForQuantity.name}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-black mb-1">Categoría</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                    {selectedProductForQuantity.category}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-black mb-1">Precio unitario</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                    ${selectedProductForQuantity.price}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-black mb-1">
                    Cantidad <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                      min="1"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <label className="block text-xs font-medium text-black mb-1">Subtotal</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm font-bold text-green-600">
                    ${(selectedProductForQuantity.price * quantity).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={cancelProductSelection}
                  className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmProductSelection}
                  disabled={!isFormValid}
                  className={`px-4 py-2 rounded-md text-white ${isFormValid ? 'bg-accent hover:bg-accent-dark' : 'bg-gray-300 cursor-not-allowed'} transition-colors`}
                >
                  Agregar Producto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de productos seleccionados - SIEMPRE VISIBLE */}
      <div className="mt-4">
        <h4 className="text-xs font-medium mb-2">Lista de Productos:</h4>
        <div className="border border-gray-300 rounded-md overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Categoría</th>
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Producto</th>
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Cantidad</th>
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Subtotal</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {selectedProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-2 py-4 text-center text-gray-500">
                    No hay productos seleccionados
                  </td>
                </tr>
              ) : (
                selectedProducts.map((product) => (
                  <tr key={product.uniqueId} className="border-t hover:bg-gray-50">
                    <td className="px-2 py-2 border-r">{product.category}</td>
                    <td className="px-2 py-2 border-r">{product.name}</td>
                    <td className="px-2 py-2 border-r text-center">{product.quantity}</td>
                    <td className="px-2 py-2 border-r">${product.subtotal?.toLocaleString()}</td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => removeProduct(product.uniqueId)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar producto"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Total de productos */}
        <div className="mt-2 text-sm bg-green-50 p-2 rounded-md border border-green-100">
          <span className="font-medium">TOTAL DE PRODUCTOS: </span>
          <span className="font-bold text-green-600">
            ${totalProducts.toLocaleString()}
          </span>
        </div>
      </div>
      {/* Overlay para cerrar dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default ProductSelector;