import { useState } from "react";

const ProductDetail = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-box text-white text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-primary">Detalles del Producto</h2>
        </div>

        <div className="space-y-6">
          {/* Imagen del producto */}
          <div className="text-center">
            <img
              src={product.foto}
              alt={product.nombre}
              className="w-32 h-32 object-cover rounded-lg mx-auto border-2 border-gray-200"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">ID del Producto</label>
              <div className="px-3 py-2 border border-accent rounded-md bg-background text-text-main font-mono text-sm">
                #{product.id}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-2">Fecha de Registro</label>
              <div className="px-3 py-2 border border-accent rounded-md bg-background text-text-main">
                {product.fechaRegistro}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">Nombre</label>
              <div className="px-3 py-2 border border-accent rounded-md bg-background text-text-main font-medium">
                {product.nombre}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-2">Tipo de Producto</label>
              <div className="px-3 py-2 border border-accent rounded-md bg-background text-text-main">
                {product.tipoProducto}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-2">Categoría</label>
              <div className="px-3 py-2 border border-accent rounded-md bg-background text-text-main">
                {product.categoria}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-2">Color</label>
              <div className="px-3 py-2 border border-accent rounded-md bg-background text-text-main">
                {product.color}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-2">Precio</label>
              <div className="px-3 py-2 border border-accent rounded-md bg-background text-text-main font-semibold text-green-600">
                ${product.precio?.toFixed(2)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-2">Stock Disponible</label>
              <div className="px-3 py-2 border border-accent rounded-md bg-background text-text-main">
                {product.cantidad} unidades
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-2">Descripción</label>
            <div className="px-3 py-2 border border-accent rounded-md bg-background text-text-main min-h-[60px]">
              {product.descripcion}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            className="px-4 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary-dark transition"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div >
  );
};

export default ProductDetail; 