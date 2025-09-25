import { useState, useMemo, useEffect } from 'react';
import productsService from '../../../dashboard/pages/products/API/productsService';
import categoriesService from '../../../dashboard/pages/CatProducts/API/categoriesService';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import cartIcon from '../../../../shared/images/cart.png';
import { useCartToast } from '../../components/CartToastContext';

const formatNumber = (num) => new Intl.NumberFormat('es-CO').format(num);

const Catalogo = () => {
  // Estados para productos
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  // Estados para categorías
  const [activeCategories, setActiveCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const navigate = useNavigate();
  const { showCartToast } = useCartToast();

  // Cargar productos al montar
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await productsService.getAll({ limit: 100 }); // Cargar más productos para catálogo
        if (response.success) {
          setProducts(response.data || []);
        } else {
          setProductsError('Error al cargar productos');
        }
      } catch (error) {
        setProductsError('Error al cargar productos');
        console.error('Error loading products:', error);
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Cargar categorías activas
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoriesService.getActive();
        if (response.success) {
          setActiveCategories(response.data || []);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Categorías activas - ajustar según estructura de API
  const categoriasActivas = activeCategories.map(cat => cat.nombre);
  // Extraer valores únicos de especificaciones para filtros dinámicos
  const obtenerValoresUnicos = (concepto) => {
    const valores = [];
    products.forEach(product => {
      if (product.especificaciones) {
        product.especificaciones.forEach(esp => {
          if (esp.concepto === concepto && !valores.includes(esp.valor)) {
            valores.push(esp.valor);
          }
        });
      }
    });
    return valores;
  };

  // Obtener conceptos únicos de especificaciones
  const conceptosUnicos = useMemo(() => {
    const conceptos = new Set();
    products.forEach(product => {
      if (product.especificaciones) {
        product.especificaciones.forEach(esp => {
          conceptos.add(esp.concepto);
        });
      }
    });
    return Array.from(conceptos);
  }, [products]);

  // Rango de precio
  const precios = products.map(p => p.precio).filter(Boolean);
  const minPrecio = precios.length > 0 ? Math.floor(Math.min(...precios)) : 0;
  const maxPrecio = precios.length > 0 ? Math.ceil(Math.max(...precios)) : 1000;

  // Estado de filtros
  const [filtroCategoria, setFiltroCategoria] = useState([]);
  const [filtroTipoProducto, setFiltroTipoProducto] = useState([]);
  const [filtroEspecificaciones, setFiltroEspecificaciones] = useState({});
  const [filtroPrecio, setFiltroPrecio] = useState([minPrecio, maxPrecio]);
  const [busqueda, setBusqueda] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('nombre');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Filtrado
  const productosFiltrados = useMemo(() => {
    let filtrados = products.filter(p => {
      const coincideBusqueda = busqueda === '' || 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(busqueda.toLowerCase());
      
      const coincideCategoria = filtroCategoria.length === 0 || filtroCategoria.includes(p.categoria);
      const coincideTipoProducto = filtroTipoProducto.length === 0 || filtroTipoProducto.includes(p.tipoProducto);
      const coincidePrecio = p.precio >= filtroPrecio[0] && p.precio <= filtroPrecio[1];
      
      // Filtro de especificaciones
      let coincideEspecificaciones = true;
      Object.entries(filtroEspecificaciones).forEach(([concepto, valores]) => {
        if (valores.length > 0) {
          const tieneEspecificacion = p.especificaciones?.some(esp => 
            esp.concepto === concepto && valores.includes(esp.valor)
          );
          if (!tieneEspecificacion) coincideEspecificaciones = false;
        }
      });

      return coincideBusqueda && coincideCategoria && coincideTipoProducto && coincidePrecio && coincideEspecificaciones;
    });

    // Ordenamiento
    filtrados.sort((a, b) => {
      switch (ordenarPor) {
        case 'precio-asc':
          return a.precio - b.precio;
        case 'precio-desc':
          return b.precio - a.precio;
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'mas-recientes':
          return new Date(b.fechaRegistro) - new Date(a.fechaRegistro);
        default:
          return 0;
      }
    });

    return filtrados;
  }, [products, filtroCategoria, filtroTipoProducto, filtroEspecificaciones, filtroPrecio, busqueda, ordenarPor]);

  // Handlers
  const toggleFiltro = (valor, filtro, setFiltro) => {
    setFiltro(prev => prev.includes(valor) ? prev.filter(v => v !== valor) : [...prev, valor]);
  };

  const toggleEspecificacion = (concepto, valor) => {
    setFiltroEspecificaciones(prev => ({
      ...prev,
      [concepto]: prev[concepto]?.includes(valor) 
        ? prev[concepto].filter(v => v !== valor)
        : [...(prev[concepto] || []), valor]
    }));
  };
  
  const limpiarFiltros = () => {
    setFiltroCategoria([]);
    setFiltroTipoProducto([]);
    setFiltroEspecificaciones({});
    setFiltroPrecio([minPrecio, maxPrecio]);
    setBusqueda('');
    setOrdenarPor('nombre');
  };

  const getFiltrosActivos = () => {
    const activos = [];
    if (filtroCategoria.length > 0) activos.push(`${filtroCategoria.length} categoría(s)`);
    if (filtroTipoProducto.length > 0) activos.push(`${filtroTipoProducto.length} tipo(s)`);
    if (Object.values(filtroEspecificaciones).some(v => v.length > 0)) activos.push('Especificaciones');
    if (filtroPrecio[0] !== minPrecio || filtroPrecio[1] !== maxPrecio) activos.push('Precio');
    if (busqueda) activos.push('Búsqueda');
    return activos;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Migas de pan */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <span className="hover:underline cursor-pointer" onClick={() => window.location.href = '/landing'}>Home</span>
          <span className="mx-1">/</span>
          <span className="text-[#1E1E1E] font-semibold">Productos</span>
        </nav>
        <div className="max-w-7xl mx-auto px-2 py-4">
          <h1 className="text-4xl font-bold text-[#1E1E1E] mb-2">Catálogo de Productos</h1>
        </div>
        {/* Barra de herramientas */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACC15] focus:border-transparent"
            />
          </div>
          {/* Ordenamiento */}
          <select
            value={ordenarPor}
            onChange={e => setOrdenarPor(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACC15] focus:border-transparent bg-white"
          >
            <option value="nombre">Ordenar por nombre</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
            <option value="mas-recientes">Más recientes</option>
          </select>

          {/* Botón filtros móvil */}
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="lg:hidden flex items-center gap-2 px-4 py-3 bg-[#FACC15] text-[#1E1E1E] rounded-lg hover:bg-yellow-400 transition"
          >
            <FaFilter />
            Filtros
          </button>
        </div>

        {/* Filtros activos */}
        {getFiltrosActivos().length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {getFiltrosActivos().map((filtro, idx) => (
              <span key={idx} className="px-3 py-1 bg-[#FACC15] text-[#1E1E1E] text-sm rounded-full flex items-center gap-2">
                {filtro}
                <button onClick={limpiarFiltros} className="hover:bg-yellow-400 rounded-full p-1">
                  <FaTimes size={12} />
                </button>
              </span>
            ))}
            <button
              onClick={limpiarFiltros}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full hover:bg-gray-300 transition"
            >
              Limpiar todos
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros sidebar */}
          <aside className={`lg:w-80 ${mostrarFiltros ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#1E1E1E]">Filtros</h2>
                <button
                  onClick={() => setMostrarFiltros(false)}
                  className="lg:hidden text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Categoría */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-800">Categoría</h3>
                <div className="space-y-2">
                  {categoriasActivas.map(categoria => (
                    <label key={categoria} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filtroCategoria.includes(categoria)}
                        onChange={() => toggleFiltro(categoria, filtroCategoria, setFiltroCategoria)}
                        className="mr-3 text-[#FACC15] focus:ring-[#FACC15] rounded"
                      />
                      <span className="text-sm text-gray-700">{categoria}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tipo de Producto */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-800">Tipo de Producto</h3>
                <div className="space-y-2">
                  {['Extensiones', 'Cuidado Capilar'].map(tipo => (
                    <label key={tipo} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filtroTipoProducto.includes(tipo)}
                        onChange={() => toggleFiltro(tipo, filtroTipoProducto, setFiltroTipoProducto)}
                        className="mr-3 text-[#FACC15] focus:ring-[#FACC15] rounded"
                      />
                      <span className="text-sm text-gray-700">{tipo}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Especificaciones dinámicas */}
              {conceptosUnicos.map(concepto => {
                const valores = obtenerValoresUnicos(concepto);
                if (valores.length === 0) return null;
                
                return (
                  <div key={concepto} className="mb-6">
                    <h3 className="font-semibold mb-3 text-gray-800">{concepto}</h3>
                    <div className="space-y-2">
                      {valores.slice(0, 5).map(valor => (
                        <label key={valor} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filtroEspecificaciones[concepto]?.includes(valor) || false}
                            onChange={() => toggleEspecificacion(concepto, valor)}
                            className="mr-3 text-[#FACC15] focus:ring-[#FACC15] rounded"
                          />
                          <span className="text-sm text-gray-700">{valor}</span>
                        </label>
                      ))}
                      {valores.length > 5 && (
                        <span className="text-xs text-gray-500">+{valores.length - 5} más</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Rango de Precio */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-800">Rango de Precio</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex flex-col w-1/2">
                      <label className="text-xs text-gray-500 mb-1 ml-1">Desde</label>
                      <input
                        type="number"
                        value={filtroPrecio[0]}
                        onChange={e => setFiltroPrecio([parseInt(e.target.value), filtroPrecio[1]])}
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder="Mín"
                      />
                    </div>
                    <div className="flex flex-col w-1/2">
                      <label className="text-xs text-gray-500 mb-1 ml-1">Hasta</label>
                      <input
                        type="number"
                        value={filtroPrecio[1]}
                        onChange={e => setFiltroPrecio([filtroPrecio[0], parseInt(e.target.value)])}
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder="Máx"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Grid de productos */}
          <main className="flex-1">
            {/* Contador de resultados */}
            <div className="mb-6">
              <p className="text-gray-600">
                Mostrando <span className="font-semibold text-[#FACC15]">{productosFiltrados.length}</span> de{' '}
                <span className="font-semibold">{products.length}</span> productos
              </p>
            </div>

            {/* Grid responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {productosFiltrados.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-[#1E1E1E] mb-2">No se encontraron productos</h3>
                  <p className="text-gray-600 mb-4">Intenta ajustar tus filtros de búsqueda</p>
                  <button
                    onClick={limpiarFiltros}
                    className="px-6 py-2 bg-[#FACC15] text-[#1E1E1E] rounded-lg hover:bg-yellow-400 transition"
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                productosFiltrados.map(prod => (
                  <div
                    key={prod.id}
                    className="flex flex-col cursor-pointer group transition-all"
                    onClick={() => navigate(`/landing/productos/${prod.id}`)}
                  >
                    {/* Imagen ocupa todo el ancho superior, sin perder calidad */}
                    <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={prod.fotos && prod.fotos.length > 0 ? prod.fotos[0] : prod.foto}
                        alt={prod.nombre}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    {/* Info */}
                    <div className="p-5 flex flex-col gap-2 flex-1 justify-between">
                      <h3 className="font-semibold text-lg text-[#1E1E1E] mb-1 truncate group-hover:text-[#FACC15] transition-colors">{prod.nombre}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-[#FACC15]">${formatNumber(prod.precio)}</span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            showCartToast(prod);
                          }}
                          className="ml-2 bg-[#FACC15] rounded-full p-2 shadow hover:bg-yellow-400 transition flex items-center justify-center"
                          title="Agregar al carrito"
                        >
                          <img src={cartIcon} alt="Carrito" className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Catalogo; 