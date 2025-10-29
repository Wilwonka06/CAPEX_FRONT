// components/Sidebar.jsx
import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import logo from '../../../shared/images/Logo.png';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Inicializa expandedGroups vacío y actualízalo en useEffect
  const [expandedGroups, setExpandedGroups] = useState({});
  const [loadingData] = useState(false); // Añadido para evitar error
  const location = useLocation();

  // Función para verificar si el usuario tiene permisos para un módulo
  const hasPermission = (module, action = 'Visualizar') => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || !user.privileges) {
      if (module === 'Dashboard') return true; 
      return false;
    }
    // Verificar si el módulo existe y si la acción específica es true
    return user.privileges[module] && user.privileges[module][action];
  };

  // Función para filtrar los menús según los permisos del usuario
  const getFilteredMenuGroups = () => {
    // Define TODOS los grupos y sus ítems con su 'module' asociado
    const allMenuGroups = [
      {
        id: 'main',
        name: 'Dashboard',
        icon: 'bi-speedometer2',
        path: '/dashboard', // Asegura la consistencia con las rutas de Dashboard
        module: 'Dashboard' // Módulo asociado para permisos
      },
      {
        id: 'config',
        title: 'Configuración',
        icon: 'bi-gear-fill',
        module: 'Gestión de Usuarios',
        items: [
          { name: 'Roles', icon: 'bi-shield', path: '/dashboard/roles', module: 'Gestión de Usuarios' },
        ]
      },
      {
        id: 'users',
        title: 'Gestión de Usuarios',
        icon: 'bi-people-fill',
        module: 'Gestión de Usuarios',
        items: [
          { name: 'Usuarios', icon: 'bi-person', path: '/dashboard/usuarios', module: 'Gestión de Usuarios' },
        ]
      },
      {
        id: 'purchases',
        title: 'Gestión de Compras',
        icon: 'bi-cart-check-fill',
        module: 'Gestión de Compras',
        items: [
          { name: 'Categorías de Productos', icon: 'bi-tags-fill', path: '/dashboard/categorias-productos', module: 'Gestión de Compras' },
          { name: 'Productos', icon: 'bi-box-seam-fill', path: '/dashboard/productos', module: 'Gestión de Compras' },
          { name: 'Proveedores', icon: 'bi-truck-front-fill', path: '/dashboard/proveedores', module: 'Gestión de Compras' },
          { name: 'Compras', icon: 'bi-receipt-cutoff', path: '/dashboard/compras', module: 'Gestión de Compras' }
        ]
      },
      {
        id: 'services',
        title: 'Gestión de Servicios',
        icon: 'bi-tools',
        module: 'Gestión de Servicios',
        items: [
          { name: 'Categorías de Servicios', icon: 'bi-collection', path: '/dashboard/categorias-servicios', module: 'Gestión de Servicios' },
          { name: 'Servicios', icon: 'bi-scissors', path: '/dashboard/servicios', module: 'Gestión de Servicios' },
          { name: 'Empleados', icon: 'bi-person-badge', path: '/dashboard/empleados', module: 'Gestión de Servicios' },
          { name: 'Agendamiento General', icon: 'bi-calendar-week', path: '/dashboard/programacion', module: 'Gestión de Servicios' }
        ]
      },
      {
        id: 'sales',
        title: 'Gestión de Ventas',
        icon: 'bi-graph-up-arrow',
        module: 'Ventas',
        items: [
          { name: 'Clientes', icon: 'bi-person-lines', path: '/dashboard/clientes', module: 'Ventas' },
          { name: 'Agendamiento de Citas', icon: 'bi-calendar-event', path: '/dashboard/citas', module: 'Ventas' },
          { name: 'Pedidos de Productos', icon: 'bi-clipboard-check', path: '/dashboard/pedidos', module: 'Ventas' },
          { name: 'Venta de Productos', icon: 'bi-bag-check', path: '/dashboard/ventas-productos', module: 'Ventas' },
          { name: 'Venta de Servicios', icon: 'bi-bag-check', path: '/dashboard/ventas-servicios', module: 'Ventas' }
        ]
      }
    ];

    // Filtrar grupos y sus ítems si el usuario no tiene privilegios de Admin
    return allMenuGroups.filter(group => {
      // Si el grupo es Dashboard, siempre es visible
      if (group.id === 'main') return true;

      // Si el grupo tiene sub-items, verificar si al menos uno de sus items tiene permisos
      if (group.items) {
        const hasAnyItemPermission = group.items.some(item => hasPermission(item.module, 'Visualizar'));
        return hasAnyItemPermission;
      }
      // Si es un grupo sin sub-items (como Dashboard, pero ya lo manejamos), verificar permisos directos
      return hasPermission(group.module, 'Visualizar');
    }).map(group => {
      // Si el grupo tiene items, filtrar solo los que tienen permisos de Visualizar
      if (group.items) {
        return {
          ...group,
          items: group.items.filter(item => hasPermission(item.module, 'Visualizar'))
        };
      }
      return group;
    });
  };

  // Usar memoización o useCallback si getFilteredMenuGroups es costoso
  const menuGroups = React.useMemo(() => getFilteredMenuGroups(), [location.pathname, localStorage.getItem('currentUser')]); // Re-calcular si la ubicación o el usuario cambian

  // useEffect para abrir el grupo correspondiente a la ruta actual al montar o cuando cambian location o menuGroups
  useEffect(() => {
    const expanded = {};
    menuGroups.forEach(group => {
      if (group.items && group.items.some(item => isActiveRoute(item.path))) {
        expanded[group.id] = true;
      }
    });
    setExpandedGroups(expanded);
    // eslint-disable-next-line
  }, [location.pathname, menuGroups.length]);

  // Elimina onMouseEnter y onMouseLeave del contenedor principal
  // Elimina las funciones handleMouseEnter y handleMouseLeave (ya no se usan)

  // Función para encontrar el ID del grupo padre de una ruta
  const getGroupIdByPath = (pathname) => {
    for (const group of menuGroups) {
      if (group.path === pathname) return group.id; // Si es un link directo
      if (group.items) {
        for (const item of group.items) {
          if (item.path === pathname) return group.id;
        }
      }
    }
    return null;
  };

  // Efecto para expandir el grupo de la ruta actual al cargar o cambiar de ruta
  useEffect(() => {
    const currentGroup = getGroupIdByPath(location.pathname);
    if (currentGroup) {
      // Solo expandir si se permite la expansión automática
      if (isExpanded) { // Si está expandido por hover, mantener/abrir grupo activo
         setExpandedGroups(prev => ({ ...prev, [currentGroup]: true }));
      }
    }
  }, [location.pathname, isExpanded]); // Depende de location, isExpanded

  // Función para abrir un grupo específico sin cerrar otros
  const openGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: true
    }));
  };


  const isActiveRoute = (path) => {
    // Ajustar para que si la ruta es '/' y el sidebar no está expandido/bloqueado, no se marque
    // Esto es para que el icono del dashboard no se vea "activo" cuando el sidebar está minimizado
    // y no hay una ruta activa específica dentro de él.
    if (path === '/dashboard' && location.pathname === '/') return true; // Dashboard es el index del layout
    return location.pathname === path;
  };

  return (
    <div
      className={`bg-text-main shadow-lg transition-all duration-300 ease-in-out font-inter text-white ${
        isExpanded ? 'w-64' : 'w-16'
      } flex flex-col h-full cursor-pointer`}
      onClick={() => !isExpanded && setIsExpanded(true)}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          {(isExpanded) ? (
            <span className="m-3 font-semibold flex items-center justify-center">
              <img src={logo} alt="Logo" className=" w-29 h-29 object-contain" />
            </span>
          ) : (
            // Logo circular para el estado colapsado
            <span className=" w-10 h-10 flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            </span>
          )}
        </div>
        {/* En el header, elimina el botón de candado y deja solo el botón de flechas */}
        <button
          onClick={() => setIsExpanded(prev => !prev)}
          className="p-1 rounded transition-colors text-background/80 hover:text-background focus:outline-none"
          title={isExpanded ? 'Colapsar menú' : 'Expandir menú'}
        >
        </button>
      </div>

      {/* Menu con scroll */}
      <nav
        className="flex-1 py-4 overflow-y-auto text-white"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitScrollbar: { display: 'none' }
        }}
      >
        {loadingData ? (
          <div className="text-white/70 text-center py-4">Cargando menú...</div>
        ) : (
          menuGroups.map((group) => (
            <div key={group.id} className="mb-2">
              {/* Group Header o Link directo */}
              {group.items ? (
                <div
                  className={`flex items-center px-4 py-3 cursor-pointer transition-colors rounded-lg relative ${
                    (isExpanded) ? 'justify-between' : 'justify-center'
                  } ${
                    group.items.some(item => isActiveRoute(item.path))
                      ? ' bg-yellow-500/10 text-yellow-500 rounded-lg font-bold shadow-sm' // Grupo activo
                      : 'text-background/80 hover:bg-background/10 hover:text-background'
                  }`}
                  onClick={() => (isExpanded) && openGroup(group.id)}
                >
                  <div className="flex items-center">
                    <i className={`${group.icon} text-xl`}></i>
                    {(isExpanded) && (
                      <span className="ml-3 text-sm font-medium whitespace-nowrap">
                        {group.title}
                      </span>
                    )}
                  </div>
                  {(isExpanded) && group.items.length > 0 && (
                    <i className={`bi bi-chevron-${expandedGroups[group.id] ? 'up' : 'down'} text-xs`}></i>
                  )}
                </div>
              ) : (
                <Link
                  to={group.path}
                  className={`flex items-center px-4 py-3 cursor-pointer transition-colors no-underline ${
                    (isExpanded) ? '' : 'justify-center'
                  } ${
                    isActiveRoute(group.path)
                      ? 'border-l-4  bg-background/10'
                      : 'text-background/90 hover:bg-background/10 hover:text-background rounded-xl'
                  }`}
                  title={!(isExpanded) ? group.name : ''}
                >
                  <i className={`${group.icon} text-lg`}></i>
                  {(isExpanded) && (
                    <span className="ml-3 text-sm whitespace-nowrap ">
                      {group.name}
                    </span>
                  )}
                </Link>
              )}

              {/* Group Items - Solo mostrar si el sidebar está expandido o bloqueado */}
              {(group.items && (isExpanded)) && (
                <div
                  className={`ml-4 overflow-hidden transition-all duration-300 ease-in-out ${expandedGroups[group.id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  style={{ willChange: 'max-height, opacity' }}
                >
                  {Array.isArray(group.items) && group.items.map((item, index) => (
                    hasPermission(item.module, 'Visualizar') && (
                      <Link
                        key={index}
                        to={item.path}
                        className={`flex items-center px-4 py-3 cursor-pointer transition-colors no-underline relative ${
                          isActiveRoute(item.path)
                            ? 'text-yellow-500 bg-background/17 font-semibold rounded-lg shadow' // Amarillo fuerte y arqueado
                            : 'text-background/90 hover:bg-background/10 hover:text-background rounded-xl'
                        }`}
                        title={item.name}
                      >
                        <i className={`${item.icon} text-lg`}></i>
                        <span className="ml-3 text-sm whitespace-nowrap">
                          {item.name}
                        </span>
                      </Link>
                    )
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </nav>
      {/* Botón de cerrar solo cuando está expandido */}
      {isExpanded && (
        <div className="p-2 ">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className="w-full flex items-center pl-2 py-2 rounded-lg transition-colors text-background/80 hover:text-background hover:bg-background/10 focus:outline-none"
            title="Cerrar menú"
          >
            <i className="bi bi-x-lg text-xl mr-2"></i>
            <span className="text-sm font-medium">Cerrar</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;