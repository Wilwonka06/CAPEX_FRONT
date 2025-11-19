import { useState, useMemo, useEffect, useRef } from 'react';
import productsService from '../../../dashboard/pages/products/API/productsService';
import categoriesService from '../../../dashboard/pages/CatProducts/API/categoriesService';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import cartIcon from '../../../../shared/images/cart.png';
import { useCartToast } from '../../components/CartToastContext';
import { useCart } from '../../components/CartContext';
import { formatNumber } from '../../../../shared/utils/formatters';
import Footer from '../../../../shared/components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';

// Imagen por defecto para productos sin imagen (similar a usuarios)
const getDefaultProductImage = (productName = "Product") => {
  const name = encodeURIComponent(productName || "Product");
  return `https://ui-avatars.com/api/?name=${name}&background=9C5B2B&color=fff&size=256&bold=true`;
};

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
  const { addToCart } = useCart();
  const addingToCartRef = useRef(new Set()); // Rastrear productos que se están agregando

  // Cargar productos al montar
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await productsService.getAll({ limit: 100 });
        if (response.success) {
          console.log('Productos cargados:', response.data);
          // Filtrar productos de categorías activas
          const activeProducts = (response.data || []).filter(product => {
            // Si el producto tiene una categoría y está inactiva, no mostrarlo
            if (product.categoriaObj && product.categoriaObj.estado === 'inactivo') {
              return false;
            }
            return true;
          });
          setProducts(activeProducts);
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
          console.log('Categorías cargadas:', response.data);
          // Filtrar solo categorías activas
          const active = (response.data || []).filter(cat => 
            cat.estado === 'activo' || cat.estado === 'Activo'
          );
          setActiveCategories(active);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        // No bloquear la UI si las categorías fallan
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Categorías activas - nombres únicos de los productos
  const categoriasActivas = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.categoria).filter(Boolean))];
    return uniqueCategories;
  }, [products]);

  // Extraer valores únicos de especificaciones para filtros dinámicos
  const obtenerValoresUnicos = (concepto) => {
    const valores = new Set();
    products.forEach(product => {
      if (product.especificaciones) {
        product.especificaciones.forEach(esp => {
          if (esp.concepto === concepto && esp.valor) {
            valores.add(esp.valor);
          }
        });
      }
    });
    return Array.from(valores);
  };

  // Obtener conceptos únicos de especificaciones
  const conceptosUnicos = useMemo(() => {
    const conceptos = new Set();
    products.forEach(product => {
      if (product.especificaciones) {
        product.especificaciones.forEach(esp => {
          if (esp.concepto) {
            conceptos.add(esp.concepto);
          }
        });
      }
    });
    return Array.from(conceptos);
  }, [products]);

  // Tipos de producto únicos
  const tiposProducto = useMemo(() => {
    const tipos = new Set(products.map(p => p.tipoProducto).filter(Boolean));
    return Array.from(tipos);
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

  // Actualizar rango de precio cuando cambien los productos
  useEffect(() => {
    if (precios.length > 0) {
      setFiltroPrecio([minPrecio, maxPrecio]);
    }
  }, [minPrecio, maxPrecio]);

  // Filtrado
  const productosFiltrados = useMemo(() => {
    let filtrados = products.filter(p => {
      const coincideBusqueda = busqueda === '' || 
        p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
      
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

  // Estados de carga mejorados
  if (productsLoading) {
    return <LoadingSpinner message="Cargando productos..." subMessage="Estamos preparando lo mejor para ti" />;
  }

  if (productsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl border border-gray-100 max-w-md">
          <div className="text-8xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 font-montserrat">Error al cargar productos</h2>
          <p className="text-gray-600 mb-8 font-lato">{productsError}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#FACC15] text-[#1E1E1E] font-bold rounded-full hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Reintentar
            </button>
            <button
              onClick={() => window.location.href = '/landing'}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all duration-300"
            >
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Header mejorado */}
      <div className="bg-gradient-to-r from-[#1E1E1E] to-[#2A2A2A] text-white py-16 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#FACC15]/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-[#FACC15]/20 rounded-full blur-lg animate-bounce"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Migas de pan */}
          <nav className="text-sm text-white/70 mb-6 flex items-center gap-2">
            <span className="hover:text-[#FACC15] cursor-pointer transition-colors" onClick={() => window.location.href = '/landing'}>Home</span>
            <span className="mx-2">/</span>
            <span className="text-[#FACC15] font-semibold">Productos</span>
          </nav>

          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 font-montserrat bg-gradient-to-r from-white via-[#FACC15] to-white bg-clip-text text-transparent">
              Catálogo de Productos
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto font-lato leading-relaxed">
              Descubre nuestra colección exclusiva de productos de belleza premium.
              Calidad excepcional para realzar tu belleza natural.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Barra de herramientas mejorada */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-300 text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Ordenamiento */}
            <div className="relative">
              <select
                value={ordenarPor}
                onChange={e => setOrdenarPor(e.target.value)}
                className="appearance-none px-6 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-transparent bg-white pr-10 hover:border-[#FACC15] transition-all duration-300 text-gray-700"
              >
                <option value="nombre">Ordenar por nombre</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="mas-recientes">Más recientes</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Botón filtros móvil */}
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="lg:hidden flex items-center gap-3 px-6 py-4 bg-[#FACC15] text-[#1E1E1E] rounded-xl hover:bg-yellow-400 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              <FaFilter className="text-lg" />
              Filtros
            </button>
          </div>
        </div>

        {/* Filtros activos mejorados */}
        {getFiltrosActivos().length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-8">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">Filtros activos:</span>
              {getFiltrosActivos().map((filtro, idx) => (
                <span key={idx} className="inline-flex items-center gap-2 px-4 py-2 bg-[#FACC15] text-[#1E1E1E] text-sm font-medium rounded-full shadow-sm hover:shadow-md transition-all duration-200">
                  {filtro}
                  <button
                    onClick={limpiarFiltros}
                    className="hover:bg-yellow-400 rounded-full p-1 transition-colors duration-200"
                    title="Remover filtro"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              ))}
              <button
                onClick={limpiarFiltros}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-200 transition-all duration-200 border border-gray-200"
              >
                <FaTimes size={12} />
                Limpiar todos
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros sidebar mejorados */}
          <aside className={`lg:w-80 ${mostrarFiltros ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4 border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-[#1E1E1E] font-montserrat">Filtros</h2>
                  <p className="text-sm text-gray-500 mt-1">Refina tu búsqueda</p>
                </div>
                <button
                  onClick={() => setMostrarFiltros(false)}
                  className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  title="Cerrar filtros"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Categoría */}
              {categoriasActivas.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#FACC15] rounded-full"></span>
                    Categoría
                  </h3>
                  <div className="space-y-3">
                    {categoriasActivas.map(categoria => (
                      <label key={categoria} className="flex items-center cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
                        <input
                          type="checkbox"
                          checked={filtroCategoria.includes(categoria)}
                          onChange={() => toggleFiltro(categoria, filtroCategoria, setFiltroCategoria)}
                          className="mr-3 text-[#FACC15] focus:ring-[#FACC15] rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-[#FACC15] transition-colors duration-200 font-medium">
                          {categoria}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Especificaciones dinámicas */}
              {conceptosUnicos.map(concepto => {
                const valores = obtenerValoresUnicos(concepto);
                if (valores.length === 0) return null;

                return (
                  <div key={concepto} className="mb-8">
                    <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#FACC15] rounded-full"></span>
                      {concepto}
                    </h3>
                    <div className="space-y-3">
                      {valores.slice(0, 5).map(valor => (
                        <label key={valor} className="flex items-center cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
                          <input
                            type="checkbox"
                            checked={filtroEspecificaciones[concepto]?.includes(valor) || false}
                            onChange={() => toggleEspecificacion(concepto, valor)}
                            className="mr-3 text-[#FACC15] focus:ring-[#FACC15] rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-[#FACC15] transition-colors duration-200 font-medium">
                            {valor}
                          </span>
                        </label>
                      ))}
                      {valores.length > 5 && (
                        <div className="text-xs text-[#FACC15] font-medium mt-2 px-2">
                          +{valores.length - 5} opciones más disponibles
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Rango de Precio */}
              <div className="mb-8">
                <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#FACC15] rounded-full"></span>
                  Rango de Precio
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Desde</label>
                      <input
                        type="number"
                        value={filtroPrecio[0]}
                        onChange={e => setFiltroPrecio([parseInt(e.target.value) || 0, filtroPrecio[1]])}
                        className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FACC15] focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Hasta</label>
                      <input
                        type="number"
                        value={filtroPrecio[1]}
                        onChange={e => setFiltroPrecio([filtroPrecio[0], parseInt(e.target.value) || 0])}
                        className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FACC15] focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 text-sm"
                        placeholder="1000000"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 px-2">
                    Rango: ${formatNumber(filtroPrecio[0])} - ${formatNumber(filtroPrecio[1])}
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

            {/* Grid responsivo mejorado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {productosFiltrados.length === 0 ? (
                <div className="col-span-full">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
                    <div className="text-8xl mb-6">🔍</div>
                    <h3 className="text-2xl font-bold text-[#1E1E1E] mb-4 font-montserrat">No se encontraron productos</h3>
                    <p className="text-gray-600 mb-8 text-lg">Intenta ajustar tus filtros de búsqueda para encontrar más opciones</p>
                    <button
                      onClick={limpiarFiltros}
                      className="px-8 py-3 bg-[#FACC15] text-[#1E1E1E] font-bold rounded-full hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              ) : (
                productosFiltrados.map((prod, idx) => (
                  <div
                    key={prod.id}
                    className="group relative bg-white selection: shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/landing/productos/${prod.id}`)}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Badge de oferta (opcional) */}
                    {prod.precio < 100000 && (
                      <div className="absolute top-4 left-4 z-10 bg-[#FACC15] text-[#1E1E1E] px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        ¡Oferta!
                      </div>
                    )}

                    {/* Imagen con overlay */}
                    <div className="relative w-full aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={
                          (prod.fotos && prod.fotos.length > 0 && prod.fotos[0])
                            ? prod.fotos[0]
                            : (prod.foto || prod.imagen || getDefaultProductImage(prod.nombre))
                        }
                        alt={prod.nombre}
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = getDefaultProductImage(prod.nombre);
                        }}
                      />
                      {/* Overlay al hover */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Botón de agregar al carrito */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          // Prevenir múltiples clics
                          if (addingToCartRef.current.has(prod.id)) {
                            return;
                          }
                          addingToCartRef.current.add(prod.id);
                          addToCart(prod, 1);
                          showCartToast(prod);
                          // Permitir agregar de nuevo después de 1 segundo
                          setTimeout(() => {
                            addingToCartRef.current.delete(prod.id);
                          }, 1000);
                        }}
                        className="absolute bottom-4 right-4 bg-[#FACC15] text-[#1E1E1E] rounded-full p-3 shadow-lg hover:bg-yellow-400 transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Agregar al carrito"
                        disabled={addingToCartRef.current.has(prod.id)}
                      >
                        <img src={cartIcon} alt="Carrito" className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Info del producto */}
                    <div className="p-6 flex flex-col gap-3">
                      <h3 className="font-bold text-lg text-[#1E1E1E] group-hover:text-[#FACC15] transition-colors duration-300 line-clamp-2 font-nunito leading-tight">
                        {prod.nombre}
                      </h3>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-2xl font-bold text-[#FACC15] font-montserrat">
                          ${formatNumber(prod.precio)}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {prod.categoria || 'General'}
                        </span>
                      </div>
                    </div>

                    {/* Elemento decorativo */}
                    <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-[#FACC15]/10 rounded-full blur-lg group-hover:bg-[#FACC15]/20 transition-colors duration-500"></div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Catalogo;