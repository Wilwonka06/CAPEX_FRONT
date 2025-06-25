import React, { useState } from "react";

const ProductSelector = ({ selectedProducts, onProductsChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [quantities, setQuantities] = useState({});

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
    const quantity = quantities[product.id] || 1;
    const productWithQuantity = { 
      ...product, 
      quantity,
      subtotal: product.price * quantity,
      uniqueId: Date.now()
    };
    
    const isAlreadySelected = selectedProducts.some(p => p.id === product.id);
    if (!isAlreadySelected) {
      onProductsChange([...selectedProducts, productWithQuantity]);
    }
    setSearchTerm("");
    setIsOpen(false);
  };

  const removeProduct = (uniqueId) => {
    onProductsChange(selectedProducts.filter(p => p.uniqueId !== uniqueId));
  };

  const updateQuantity = (uniqueId, newQuantity) => {
    const updatedQuantity = Math.max(1, newQuantity);
    onProductsChange(selectedProducts.map(p => 
      p.uniqueId === uniqueId ? { 
        ...p, 
        quantity: updatedQuantity,
        subtotal: p.price * updatedQuantity
      } : p
    ));
  };

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
            className="w-full border rounded px-3 py-1 text-sm"
            placeholder="Buscar productos..."
          />
          <i className="bi bi-search absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {/* Dropdown de productos */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-40 overflow-y-auto">
          {filteredProducts.map(product => (
            <div key={product.id} className="border-b last:border-b-0">
              <div className="px-3 py-2 hover:bg-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm">{product.name}</span>
                      <span className="text-gray-600 text-sm">${product.price}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">Cantidad:</span>
                    <input
                      type="number"
                      min="1"
                      value={quantities[product.id] || 1}
                      onChange={(e) => setQuantities(prev => ({
                        ...prev,
                        [product.id]: parseInt(e.target.value) || 1
                      }))}
                      className="w-16 border rounded px-2 py-1 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <button
                    onClick={() => handleProductSelect(product)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                  >
                    Agregar
                  </button>
                </div>
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

      {/* Lista de productos seleccionados - SIEMPRE VISIBLE */}
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Lista de Productos:</h4>
        <div className="border rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left border-r">Categoría</th>
                <th className="px-2 py-2 text-left border-r">Producto</th>
                <th className="px-2 py-2 text-left border-r">Cantidad</th>
                <th className="px-2 py-2 text-left border-r">Subtotal</th>
                <th className="px-2 py-2 text-left">Acciones</th>
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
                  <tr key={product.uniqueId} className="border-t">
                    <td className="px-2 py-2 border-r">{product.category}</td>
                    <td className="px-2 py-2 border-r">{product.name}</td>
                    <td className="px-2 py-2 border-r text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => updateQuantity(product.uniqueId, product.quantity - 1)}
                          className="w-5 h-5 border rounded flex items-center justify-center hover:bg-gray-100 text-xs"
                        >
                          -
                        </button>
                        <span className="mx-2">{product.quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.uniqueId, product.quantity + 1)}
                          className="w-5 h-5 border rounded flex items-center justify-center hover:bg-gray-100 text-xs"
                        >
                          +
                        </button>
                      </div>
                    </td>
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
        <div className="mt-2 text-sm bg-green-50 p-2 rounded">
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