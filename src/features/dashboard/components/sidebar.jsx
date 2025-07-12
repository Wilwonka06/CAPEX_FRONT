// components/Sidebar.jsx
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({
    main: true,
    config: true,
    users: true,
    shoppings: true,
    services: true,
    sales: true
  });
  const [isLocked, setIsLocked] = useState(true);
  const location = useLocation();

  const menuGroups = [
    {
      id: 'main',
      name: 'Dashboard',
      icon: 'bi-speedometer2',
      path: '/'
    },
    {
      id: 'config',
      title: 'Configuración',
      icon: 'bi-gear-fill',
      items: [
        { name: 'Roles', icon: 'bi-shield-check', path: '/roles' },
      ]
    },
    {
      id: 'users',
      title: 'Gestión de Usuarios',
      icon: 'bi-people-fill',
      items: [
        { name: 'Usuarios', icon: 'bi-person-fill', path: '/usuarios' },
      ]
    },
    {
      id: 'shoppings',
      title: 'Gestión de Compras',
      icon: 'bi-cart-check-fill',
      items: [
        { name: 'Categorías de Productos', icon: 'bi-tags-fill', path: '/categorias-productos' },
        { name: 'Productos', icon: 'bi-box-seam-fill', path: '/productos' },
        { name: 'Proveedores', icon: 'bi-truck', path: '/proveedores' },
        { name: 'Compras', icon: 'bi-cart-plus-fill', path: '/compras' }
      ]
    },
    {
      id: 'services',
      title: 'Gestión de Servicios',
      icon: 'bi-tools',
      items: [
        { name: 'Categorías de Servicios', icon: 'bi-collection-fill', path: '/categorias-servicios' },
        { name: 'Servicios', icon: 'bi-scissors', path: '/servicios' },
        { name: 'Empleados', icon: 'bi-person-badge-fill', path: '/empleados' },
        { name: 'Agendamiento General', icon: 'bi-calendar-range-fill', path: '/programacion' }
      ]
    },
    {
      id: 'sales',
      title: 'Ventas',
      icon: 'bi-graph-up-arrow',
      items: [
        { name: 'Clientes', icon: 'bi-person-fill', path: '/clientes' },
        { name: 'Agendamiento de Citas', icon: 'bi-calendar-event-fill', path: '/citas' },
        { name: 'Pedidos de Productos', icon: 'bi-clipboard-check-fill', path: '/pedidos' },
        { name: 'Venta de Productos', icon: 'bi-bag-check-fill', path: '/ventas-productos' },
        { name: 'Venta de Servicios', icon: 'bi-bag-check-fill', path: '/ventas-servicios' }
      ]
    },
  ];

  const handleMouseEnter = () => {
    if (!isLocked && !isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isLocked && isExpanded) {
      setIsExpanded(false);
      setExpandedGroups({});
    }
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
    if (!isLocked) {
      setIsExpanded(false);
    }
  };

  const getGroupIdByPath = (pathname) => {
    for (const group of menuGroups) {
      if (group.items) {
        for (const item of group.items) {
          if (item.path === pathname) return group.id;
        }
      } else if (group.path === pathname) {
        return group.id;
      }
    }
    return null;
  };

  useEffect(() => {
    // Al cargar, abrir solo el grupo correspondiente a la ruta actual
    const currentGroup = getGroupIdByPath(location.pathname);
    setExpandedGroups(currentGroup ? { [currentGroup]: true } : {});
  }, [location.pathname]);

  // Mantener la categoría abierta si una opción está seleccionada
  useEffect(() => {
    const currentGroup = getGroupIdByPath(location.pathname);
    if (currentGroup) {
      setExpandedGroups(prev => ({ ...prev, [currentGroup]: true }));
    }
  }, [location.pathname]);

  // Guardar el grupo abierto al cerrar el sidebar
  useEffect(() => {
    if (!isExpanded && isLocked) {
      // Guardar en localStorage el grupo abierto
      const openGroup = Object.keys(expandedGroups).find(k => expandedGroups[k]);
      if (openGroup) {
        localStorage.setItem('sidebarOpenGroup', openGroup);
      }
    }
  }, [isExpanded, isLocked, expandedGroups]);

  // Al abrir el sidebar, restaurar el grupo abierto
  useEffect(() => {
    if ((isExpanded || isLocked) && Object.keys(expandedGroups).length === 0) {
      const lastOpen = localStorage.getItem('sidebarOpenGroup');
      if (lastOpen) {
        setExpandedGroups({ [lastOpen]: true });
      }
    }
  }, [isExpanded, isLocked]);

  const toggleGroup = (groupId) => {
    if (isExpanded || isLocked) {
      setExpandedGroups(prev => {
        // Si ya está abierto, ciérralo; si no, abre solo ese
        if (prev[groupId]) {
          return { ...prev, [groupId]: false };
        } else {
          return { [groupId]: true };
        }
      });
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div
      className={`bg-text-main shadow-lg transition-all duration-300 ease-in-out font-inter ${
        isExpanded || isLocked ? 'w-64' : 'w-16'
      } flex flex-col h-full`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="p-4 border-b border-accent/50 flex items-center justify-between">
        <div className="flex items-center">
          {(isExpanded || isLocked) ? (
            <span className="ml-3 font-semibold text-white text-3xl whitespace-nowrap">

              CAP<span className='text-yellow-700'>EX</span>
            </span>
          ) : (
            <span className=" font-bold text-white text-3xl bg-yellow-700 rounded-full w-10 h-10 flex items-center justify-center">
              C
            </span>
          )}
        </div>
        {(isExpanded || isLocked) && (
          <button
            onClick={toggleLock}
            className={`p-1 rounded transition-colors ${
              isLocked 
                ? 'text-white/80 hover:text-white' 
                : 'text-white/80 hover:text-white'
            }`}
            title={isLocked ? 'Desbloquear sidebar' : 'Bloquear sidebar'}
          >
            <i className={`bi ${isLocked ? 'bi-lock-fill' : 'bi-unlock'}`}></i>
          </button>
        )}
      </div>

      {/* Menu con scroll */}
      <nav
        className="flex-1 py-4 overflow-y-auto"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitScrollbar: { display: 'none' }
        }}
      >
        {menuGroups.map((group) => (
          <div key={group.id} className="mb-2">
            {/* Group Header - Solo mostrar si tiene items o si es un link directo */}
            {group.items ? (
              <div
                className={`flex items-center px-4 py-2 text-white/80 hover:bg-white/10 hover:text-white rounded-lg cursor-pointer transition-colors ${
                  (isExpanded || isLocked) ? 'justify-between' : 'justify-center'
                }`}
                onClick={() => toggleGroup(group.id)}
              >
                <div className="flex items-center">
                  <i className={`${group.icon} text-lg`}></i>
                  {(isExpanded || isLocked) && (
                    <span className="ml-3 text-sm font-medium whitespace-nowrap">
                      {group.title}
                    </span>
                  )}
                </div>
                {(isExpanded || isLocked) && (
                  <i className={`bi bi-chevron-${expandedGroups[group.id] ? 'up' : 'down'} text-xs`}></i>
                )}
              </div>
            ) : (
              // Para elementos sin subcategorías, mostrar directamente como link
              <Link
                to={group.path}
                className={`flex items-center px-4 py-2 cursor-pointer transition-colors no-underline ${
                  (isExpanded || isLocked) ? '' : 'justify-center'
                } ${
                  isActiveRoute(group.path)
                    ? 'bg-white/20 text-white rounded-xl'
                    : 'text-white/90 hover:bg-white/10 hover:text-white rounded-xl'
                }`}
                title={!(isExpanded || isLocked) ? group.name : ''}
              >
                <i className={`${group.icon} text-base`}></i>
                {(isExpanded || isLocked) && (
                  <span className="ml-3 text-xs whitespace-nowrap ">
                    {group.name}
                  </span>
                )}
              </Link>
            )}

            {/* Group Items - Solo mostrar si el grupo tiene items */}
            {group.items && (expandedGroups[group.id] || (!isExpanded && !isLocked)) && (
              <div className={`${(isExpanded || isLocked) ? 'ml-4' : ''}`}>
                {Array.isArray(group.items) && group.items.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className={`flex items-center px-4 py-2 cursor-pointer transition-colors no-underline ${
                      (isExpanded || isLocked) ? '' : 'justify-center'
                    } ${
                      isActiveRoute(item.path)
                        ? 'bg-white/20 text-white rounded-xl '
                        : 'text-white/90 hover:bg-white/10 hover:text-white rounded-xl'
                    }`}
                    title={!(isExpanded || isLocked) ? item.name : ''}
                  >
                    <i className={`${item.icon} text-base`}></i>
                    {(isExpanded || isLocked) && (
                      <span className="ml-3 text-sm whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;