import React, { useState, useMemo } from 'react';
import { useProducts } from '../../../dashboard/pages/products/hooks/useProducts';

// Datos de ejemplo para categorías y colores
const categorias = ['Electrónica', 'Ropa', 'Hogar'];
const colores = ['Rojo', 'Azul', 'Verde', 'Negro'];

const Products = () => {
  // Hook global de productos
  const { products } = useProducts();

  // Agregamos propiedades de ejemplo a los productos para el catálogo
  const productosConExtras = products.map((p, i) => ({
    ...p,
    categoria: categorias[i % categorias.length],
    color: colores[i % colores.length],
    imagen: p.foto || `https://picsum.photos/seed/${p.id}/300/200`,
  }));

  // Estado de filtros
  const [filtroCategoria, setFiltroCategoria] = useState([]);
  const [filtroColor, setFiltroColor] = useState([]);
  const [filtroPrecio, setFiltroPrecio] = useState([0, 500]);

  // Opciones seleccionadas
  const opcionesSeleccionadas = [
    ...filtroCategoria.map(c => ({ tipo: 'Categoría', valor: c })),
    ...filtroColor.map(c => ({ tipo: 'Color', valor: c })),
    ...(filtroPrecio[0] > 0 || filtroPrecio[1] < 500 ? [{ tipo: 'Precio', valor: `$${filtroPrecio[0]} - $${filtroPrecio[1]}` }] : [])
  ];

  // Filtrado real de productos
  const productosFiltrados = useMemo(() => {
    return productosConExtras.filter(p =>
      (filtroCategoria.length === 0 || filtroCategoria.includes(p.categoria)) &&
      (filtroColor.length === 0 || filtroColor.includes(p.color)) &&
      p.precio >= filtroPrecio[0] && p.precio <= filtroPrecio[1]
    );
  }, [productosConExtras, filtroCategoria, filtroColor, filtroPrecio]);

  // Handlers de filtros
  const toggleCategoria = (cat) => {
    setFiltroCategoria(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };
  const toggleColor = (col) => {
    setFiltroColor(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
  };
  const handlePrecio = (e, idx) => {
    const val = Number(e.target.value);
    setFiltroPrecio(prev => idx === 0 ? [val, prev[1]] : [prev[0], val]);
  };
  const quitarOpcion = (tipo, valor) => {
    if (tipo === 'Categoría') setFiltroCategoria(prev => prev.filter(c => c !== valor));
    if (tipo === 'Color') setFiltroColor(prev => prev.filter(c => c !== valor));
    if (tipo === 'Precio') setFiltroPrecio([0, 500]);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar de filtros */}
      <aside className="w-64 bg-white border-r p-6 hidden md:block">
        <h2 className="text-lg font-bold mb-4">Filtrar por</h2>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Categoría</h3>
          {categorias.map(cat => (
            <label key={cat} className="flex items-center mb-1 cursor-pointer">
              <input type="checkbox" checked={filtroCategoria.includes(cat)} onChange={() => toggleCategoria(cat)} className="mr-2" />
              {cat}
            </label>
          ))}
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Color</h3>
          {colores.map(col => (
            <label key={col} className="flex items-center mb-1 cursor-pointer">
              <input type="checkbox" checked={filtroColor.includes(col)} onChange={() => toggleColor(col)} className="mr-2" />
              {col}
            </label>
          ))}
        </div>
        <div>
          <h3 className="font-semibold mb-2">Precio</h3>
          <div className="flex items-center gap-2">
            <input type="number" min={0} max={filtroPrecio[1]} value={filtroPrecio[0]} onChange={e => handlePrecio(e, 0)} className="w-16 border rounded px-1 py-0.5 text-xs" />
            <span>-</span>
            <input type="number" min={filtroPrecio[0]} max={500} value={filtroPrecio[1]} onChange={e => handlePrecio(e, 1)} className="w-16 border rounded px-1 py-0.5 text-xs" />
          </div>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Opciones seleccionadas */}
        <div className="mb-6 flex flex-wrap gap-2">
          {opcionesSeleccionadas.map((op, i) => (
            <span key={i} className="bg-primary text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
              {op.tipo}: {op.valor}
              <button onClick={() => quitarOpcion(op.tipo, op.valor)} className="ml-1 text-white hover:text-red-200">×</button>
            </span>
          ))}
        </div>
        {/* Grid de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productosFiltrados.length === 0 && (
            <div className="col-span-full text-center text-gray-500">No hay productos que coincidan con los filtros.</div>
          )}
          {productosFiltrados.map(prod => (
            <div key={prod.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
              <img src={prod.imagen} alt={prod.nombre} className="w-full h-40 object-cover rounded mb-3" />
              <h3 className="text-lg font-semibold mb-1 text-center">{prod.nombre}</h3>
              <span className="text-primary font-bold text-xl mb-2">${prod.precio}</span>
              <button className="bg-primary text-white px-4 py-1.5 rounded hover:bg-primary-dark transition text-sm w-full">Agregar al carrito</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Products;
