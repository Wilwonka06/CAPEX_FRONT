import { useState, useMemo } from 'react';
import { useProducts } from '../../../../dashboard/pages/products/hooks/useProducts';
import { useNavigate } from 'react-router-dom';

const obtenerColoresUnicos = (productos) => {
  const coloresUnicos = [...new Set(productos.map(p => p.color).filter(Boolean))];
  return coloresUnicos.map(color => ({ nombre: color }));
};

const obtenerTexturasUnicas = (productos) => {
  return [...new Set(productos.map(p => p.textura).filter(Boolean))];
};

const obtenerOrigenesUnicos = (productos) => {
  return [...new Set(productos.map(p => p.origen).filter(Boolean))];
};

const Extensiones = () => {
  const { products } = useProducts();
  const navigate = useNavigate();
  // Solo extensiones
  const extensiones = products.filter(p => p.tipoProducto === 'Extensiones');

  // Filtros únicos
  const coloresUnicos = obtenerColoresUnicos(extensiones);
  const texturasUnicas = obtenerTexturasUnicas(extensiones);
  const origenesUnicos = obtenerOrigenesUnicos(extensiones);

  // Rango de largo (metros)
  const largos = extensiones.map(p => p.tamanio).filter(Boolean);
  const minLargo = largos.length > 0 ? Math.max(1, Math.floor(Math.min(...largos))) : 1;
  const maxLargo = largos.length > 0 ? Math.ceil(Math.max(...largos)) : 10;

  // Rango de precio
  const precios = extensiones.map(p => p.precio).filter(Boolean);
  const minPrecio = precios.length > 0 ? Math.floor(Math.min(...precios)) : 0;
  const maxPrecio = precios.length > 0 ? Math.ceil(Math.max(...precios)) : 1000;

  // Estado de filtros
  const [filtroColor, setFiltroColor] = useState([]);
  const [filtroTextura, setFiltroTextura] = useState([]);
  const [filtroOrigen, setFiltroOrigen] = useState([]);
  const [filtroLargo, setFiltroLargo] = useState([minLargo, maxLargo]);
  const [filtroPrecio, setFiltroPrecio] = useState([minPrecio, maxPrecio]);
  const [busqueda, setBusqueda] = useState('');

  // Filtrado
  const extensionesFiltradas = useMemo(() => {
    return extensiones.filter(p => {
      const coincideBusqueda = busqueda === '' || p.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideColor = filtroColor.length === 0 || filtroColor.includes(p.color);
      const coincideTextura = filtroTextura.length === 0 || filtroTextura.includes(p.textura);
      const coincideOrigen = filtroOrigen.length === 0 || filtroOrigen.includes(p.origen);
      const coincideLargo = p.tamanio >= filtroLargo[0] && p.tamanio <= filtroLargo[1];
      const coincidePrecio = p.precio >= filtroPrecio[0] && p.precio <= filtroPrecio[1];
      return coincideBusqueda && coincideColor && coincideTextura && coincideOrigen && coincideLargo && coincidePrecio;
    });
  }, [extensiones, filtroColor, filtroTextura, filtroOrigen, filtroLargo, filtroPrecio, busqueda]);

  // Handlers
  const toggleFiltro = (valor, filtro, setFiltro) => {
    setFiltro(prev => prev.includes(valor) ? prev.filter(v => v !== valor) : [...prev, valor]);
  };
  const limpiarFiltros = () => {
    setFiltroColor([]);
    setFiltroTextura([]);
    setFiltroOrigen([]);
    setFiltroLargo([minLargo, maxLargo]);
    setFiltroPrecio([minPrecio, maxPrecio]);
    setBusqueda('');
  };

  return (
    <div className="min-h-screen p-6 bg-white">
      <h1 className="text-2xl font-bold mb-6 text-primary font-montserrat">Catálogo de Extensiones</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filtros */}
        <aside className="w-full md:w-64 bg-white border border-gray-200 rounded-lg p-6 mb-6 md:mb-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-text-main">Filtrar por</h2>
            <button onClick={limpiarFiltros} className="text-xs bg-accent text-primary font-semibold px-3 py-1 rounded hover:bg-accent-light transition">Limpiar</button>
          </div>
          {/* Color */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-text-main">Color</h3>
            <div className="flex flex-wrap gap-2">
              {coloresUnicos.map(color => (
                <button
                  key={color.nombre}
                  onClick={() => toggleFiltro(color.nombre, filtroColor, setFiltroColor)}
                  className={`px-3 py-1 rounded-full border text-xs ${filtroColor.includes(color.nombre) ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-text-main border-gray-300'}`}
                >
                  {color.nombre}
                </button>
              ))}
            </div>
          </div>
          {/* Largo (metros) */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-text-main">Largo (mtr)</h3>
              <span className="relative group cursor-pointer">
                <i className="bi bi-info-circle text-primary"></i>
                <span className="absolute left-6 top-0 z-10 w-64 bg-white border border-gray-300 rounded shadow-lg p-2 text-xs text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Nuestras extensiones se miden en metros de cabello tejido. 1 metro equivale aproximadamente a 39 pulgadas.
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={minLargo}
                max={filtroLargo[1]}
                value={filtroLargo[0]}
                onChange={e => setFiltroLargo([Number(e.target.value), filtroLargo[1]])}
                className="w-20 px-2 py-1 border rounded text-sm"
              />
              <span>-</span>
              <input
                type="number"
                min={filtroLargo[0]}
                max={maxLargo}
                value={filtroLargo[1]}
                onChange={e => setFiltroLargo([filtroLargo[0], Number(e.target.value)])}
                className="w-20 px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>
          {/* Textura */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-text-main">Textura</h3>
            <div className="flex flex-wrap gap-2">
              {texturasUnicas.map(textura => (
                <button
                  key={textura}
                  onClick={() => toggleFiltro(textura, filtroTextura, setFiltroTextura)}
                  className={`px-3 py-1 rounded-full border text-xs ${filtroTextura.includes(textura) ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-text-main border-gray-300'}`}
                >
                  {textura}
                </button>
              ))}
            </div>
          </div>
          {/* Origen */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-text-main">Origen</h3>
            <div className="flex flex-wrap gap-2">
              {origenesUnicos.map(origen => (
                <button
                  key={origen}
                  onClick={() => toggleFiltro(origen, filtroOrigen, setFiltroOrigen)}
                  className={`px-3 py-1 rounded-full border text-xs ${filtroOrigen.includes(origen) ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-text-main border-gray-300'}`}
                >
                  {origen}
                </button>
              ))}
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
              placeholder="Buscar extensiones..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {extensionesFiltradas.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-12">
                <p className="text-lg">No hay extensiones que coincidan con los filtros.</p>
                <p className="text-sm">Intenta ajustar tus criterios de búsqueda.</p>
              </div>
            )}
            {extensionesFiltradas.map(prod => (
              <div
                key={prod.id}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col hover:shadow-lg transition-shadow duration-200 cursor-pointer relative"
                onClick={() => navigate(`/landing/productos/${prod.id}`)}
              >
                {/* Badge Pieza Única */}
                <span className="absolute top-2 right-2 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow font-roboto">Pieza Única</span>
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
                    {prod.especificaciones && prod.especificaciones.length > 0 ? (
                      prod.especificaciones.slice(0, 3).map((esp, idx) => (
                        <span key={idx}>{esp.concepto}: {esp.valor}</span>
                      ))
                    ) : (
                      <>
                        <span>Color: {prod.color}</span>
                    <span>Largo: {prod.tamanio}m</span>
                      </>
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

export default Extensiones; 