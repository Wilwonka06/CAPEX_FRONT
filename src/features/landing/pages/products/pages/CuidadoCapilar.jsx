import { useState, useMemo } from 'react';
import { useProducts } from '../../../../dashboard/pages/products/hooks/useProducts';
import { useCategories } from '../../../../dashboard/pages/CatProducts/hooks/useCategories';
import { useNavigate } from 'react-router-dom';

const obtenerTiposCabelloUnicos = (productos) => {
  return [...new Set(productos.map(p => p.tipoCabelloIdeal).filter(Boolean))];
};

const CuidadoCapilar = () => {
  const { products } = useProducts();
  const { categories } = useCategories();
  const navigate = useNavigate();
  
  // Solo productos de cuidado capilar
  const productosCuidado = products.filter(p => p.tipoProducto === 'Cuidado Capilar');

  // Categorías activas
  const categoriasActivas = categories.filter(cat => cat.isActive).map(cat => cat.name);
  
  // Tipos de cabello únicos
  const tiposCabelloUnicos = obtenerTiposCabelloUnicos(productosCuidado);

  // Rango de tamaño (ml)
  const tamanios = productosCuidado.map(p => p.volumen).filter(Boolean);
  const minTamanio = tamanios.length > 0 ? Math.floor(Math.min(...tamanios)) : 0;
  const maxTamanio = tamanios.length > 0 ? Math.ceil(Math.max(...tamanios)) : 1000;

  // Rango de precio
  const precios = productosCuidado.map(p => p.precio).filter(Boolean);
  const minPrecio = precios.length > 0 ? Math.floor(Math.min(...precios)) : 0;
  const maxPrecio = precios.length > 0 ? Math.ceil(Math.max(...precios)) : 1000;

  // Estado de filtros
  const [filtroCategoria, setFiltroCategoria] = useState([]);
  const [filtroTipoCabello, setFiltroTipoCabello] = useState([]);
  const [filtroTamanio, setFiltroTamanio] = useState([minTamanio, maxTamanio]);
  const [filtroPrecio, setFiltroPrecio] = useState([minPrecio, maxPrecio]);
  const [busqueda, setBusqueda] = useState('');

  // Filtrado
  const productosFiltrados = useMemo(() => {
    return productosCuidado.filter(p => {
      const coincideBusqueda = busqueda === '' || p.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = filtroCategoria.length === 0 || filtroCategoria.includes(p.categoria);
      const coincideTipoCabello = filtroTipoCabello.length === 0 || filtroTipoCabello.includes(p.tipoCabelloIdeal);
      const coincideTamanio = p.volumen >= filtroTamanio[0] && p.volumen <= filtroTamanio[1];
      const coincidePrecio = p.precio >= filtroPrecio[0] && p.precio <= filtroPrecio[1];
      return coincideBusqueda && coincideCategoria && coincideTipoCabello && coincideTamanio && coincidePrecio;
    });
  }, [productosCuidado, filtroCategoria, filtroTipoCabello, filtroTamanio, filtroPrecio, busqueda]);

  // Calcular número de productos por categoría
  const productosPorCategoria = categoriasActivas.reduce((acc, cat) => {
    acc[cat] = productosCuidado.filter(p => {
      const coincideBusqueda = busqueda === '' || p.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideTipoCabello = filtroTipoCabello.length === 0 || filtroTipoCabello.includes(p.tipoCabelloIdeal);
      const coincideTamanio = p.volumen >= filtroTamanio[0] && p.volumen <= filtroTamanio[1];
      const coincidePrecio = p.precio >= filtroPrecio[0] && p.precio <= filtroPrecio[1];
      return coincideBusqueda && coincideTipoCabello && coincideTamanio && coincidePrecio && p.categoria === cat;
    }).length;
    return acc;
  }, {});

  // Handlers
  const toggleFiltro = (valor, filtro, setFiltro) => {
    setFiltro(prev => prev.includes(valor) ? prev.filter(v => v !== valor) : [...prev, valor]);
  };
  
  const limpiarFiltros = () => {
    setFiltroCategoria([]);
    setFiltroTipoCabello([]);
    setFiltroTamanio([minTamanio, maxTamanio]);
    setFiltroPrecio([minPrecio, maxPrecio]);
    setBusqueda('');
  };

  return (
    <div className="min-h-screen p-6 bg-white">
      <h1 className="text-2xl font-bold mb-6 text-primary font-montserrat">Catálogo de Cuidado Capilar</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filtros */}
        <aside className="w-full md:w-64 bg-white border border-gray-200 rounded-lg p-6 mb-6 md:mb-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-text-main">Filtrar por</h2>
            <button onClick={limpiarFiltros} className="text-xs bg-accent text-primary font-semibold px-3 py-1 rounded hover:bg-accent-light transition">Limpiar</button>
          </div>
          
          {/* Categoría */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-text-main">Categoría</h3>
            <div className="space-y-2">
              {categoriasActivas.map(categoria => (
                <label key={categoria} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtroCategoria.includes(categoria)}
                    onChange={() => toggleFiltro(categoria, filtroCategoria, setFiltroCategoria)}
                    className="mr-2 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-text-main">{categoria}</span>
                  <span className="ml-auto text-xs text-gray-500">({productosPorCategoria[categoria] || 0})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tipo de Cabello Ideal */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-text-main">Tipo de Cabello Ideal</h3>
            <div className="flex flex-wrap gap-2">
              {tiposCabelloUnicos.map(tipo => (
                <button
                  key={tipo}
                  onClick={() => toggleFiltro(tipo, filtroTipoCabello, setFiltroTipoCabello)}
                  className={`px-3 py-1 rounded-full border text-xs ${filtroTipoCabello.includes(tipo) ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-text-main border-gray-300'}`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          {/* Tamaño (ml) */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-text-main">Tamaño (ml)</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={minTamanio}
                max={filtroTamanio[1]}
                value={filtroTamanio[0]}
                onChange={e => setFiltroTamanio([Number(e.target.value), filtroTamanio[1]])}
                className="w-20 px-2 py-1 border rounded text-sm"
              />
              <span>-</span>
              <input
                type="number"
                min={filtroTamanio[0]}
                max={maxTamanio}
                value={filtroTamanio[1]}
                onChange={e => setFiltroTamanio([filtroTamanio[0], Number(e.target.value)])}
                className="w-20 px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>

          {/* Precio */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-text-main">Precio</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={minPrecio}
                max={filtroPrecio[1]}
                value={filtroPrecio[0]}
                onChange={e => setFiltroPrecio([Number(e.target.value), filtroPrecio[1]])}
                className="w-20 px-2 py-1 border rounded text-sm"
              />
              <span>-</span>
              <input
                type="number"
                min={filtroPrecio[0]}
                max={maxPrecio}
                value={filtroPrecio[1]}
                onChange={e => setFiltroPrecio([filtroPrecio[0], Number(e.target.value)])}
                className="w-20 px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>
        </aside>

        {/* Grid de productos */}
        <main className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <input
              type="text"
              placeholder="Buscar productos de cuidado capilar..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {productosFiltrados.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-12">
                <p className="text-lg">No hay productos de cuidado capilar que coincidan con los filtros.</p>
                <p className="text-sm">Intenta ajustar tus criterios de búsqueda.</p>
              </div>
            )}
            
            {productosFiltrados.map(prod => (
              <div
                key={prod.id}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => navigate(`/landing/productos/${prod.id}`)}
              >
                {/* Imagen del producto */}
                <div className="w-full h-48 bg-white flex items-center justify-center rounded-lg mb-3">
                  <img
                    src={prod.fotos && prod.fotos.length > 0 ? prod.fotos[0] : (prod.foto || prod.imagen)}
                    alt={prod.nombre}
                    className="object-contain max-h-full max-w-full p-4"
                  />
                </div>
                
                {/* Información del producto */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 line-clamp-2">{prod.nombre}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-primary font-bold text-xl">${prod.precio}</span>
                    <span className="text-sm text-text-main">{prod.cantidad} disponibles</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                    <span>Categoría: {prod.categoria}</span>
                    {prod.especificaciones && prod.especificaciones.length > 0 && (
                      prod.especificaciones.slice(0, 2).map((esp, idx) => (
                        <span key={idx}>{esp.concepto}: {esp.valor}</span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CuidadoCapilar; 