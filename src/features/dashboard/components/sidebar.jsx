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

  // Función para verificar si el usuario tiene permisos para un módulo
  const hasPermission = (module, action = 'Visualizar') => {
    // Esto es una simulación. En un caso real, deberías cargar los permisos del usuario logueado.
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || !user.privileges) {
      // Si no hay usuario o privilegios, por defecto no tiene permiso para nada excepto Dashboard
      if (module === 'Dashboard') return true; // Dashboard es siempre visible
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
        module: 'Gestión de Usuarios', // O un módulo específico para configuración si lo tienes
        items: [
          { name: 'Roles', icon: 'bi-shield-check', path: '/dashboard/roles', module: 'Gestión de Usuarios' },
        ]
      },
      {
        id: 'users',
        title: 'Gestión de Usuarios',
        icon: 'bi-people-fill',
        module: 'Gestión de Usuarios',
        items: [
          { name: 'Usuarios', icon: 'bi-person-fill', path: '/dashboard/usuarios', module: 'Gestión de Usuarios' },
        ]
      },
      {
        id: 'shoppings',
        title: 'Gestión de Compras',
        icon: 'bi-cart-check-fill',
        module: 'Gestión de Compras',
        items: [
          { name: 'Categorías de Productos', icon: 'bi-tags-fill', path: '/dashboard/categorias-productos', module: 'Gestión de Compras' },
          { name: 'Productos', icon: 'bi-box-seam-fill', path: '/dashboard/productos', module: 'Gestión de Compras' },
          { name: 'Proveedores', icon: 'bi-truck', path: '/dashboard/proveedores', module: 'Gestión de Compras' },
          { name: 'Compras', icon: 'bi-cart-plus-fill', path: '/dashboard/compras', module: 'Gestión de Compras' }
        ]
      },
      {
        id: 'services',
        title: 'Gestión de Servicios',
        icon: 'bi-tools',
        module: 'Gestión de Servicios',
        items: [
          { name: 'Categorías de Servicios', icon: 'bi-collection-fill', path: '/dashboard/categorias-servicios', module: 'Gestión de Servicios' },
          { name: 'Servicios', icon: 'bi-scissors', path: '/dashboard/servicios', module: 'Gestión de Servicios' },
          { name: 'Empleados', icon: 'bi-person-badge-fill', path: '/dashboard/empleados', module: 'Gestión de Servicios' },
          { name: 'Agendamiento General', icon: 'bi-calendar-range-fill', path: '/dashboard/programacion', module: 'Gestión de Servicios' }
        ]
      },
      {
        id: 'sales',
        title: 'Ventas',
        icon: 'bi-graph-up-arrow',
        module: 'Ventas',
        items: [
          { name: 'Clientes', icon: 'bi-person-fill', path: '/dashboard/clientes', module: 'Ventas' },
          { name: 'Agendamiento de Citas', icon: 'bi-calendar-event-fill', path: '/dashboard/citas', module: 'Ventas' },
          { name: 'Pedidos de Productos', icon: 'bi-clipboard-check-fill', path: '/dashboard/pedidos', module: 'Ventas' },
          { name: 'Venta de Productos', icon: 'bi-bag-check-fill', path: '/dashboard/ventas-productos', module: 'Ventas' },
          { name: 'Venta de Servicios', icon: 'bi-bag-check-fill', path: '/dashboard/ventas-servicios', module: 'Ventas' }
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

  const handleMouseEnter = () => {
    if (!isLocked && !isExpanded) { // Solo expandir si no está bloqueado y no está ya expandido
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isLocked && isExpanded) { // Solo contraer si no está bloqueado y está expandido
      setIsExpanded(false);
      // Colapsar todos los grupos si el sidebar se contrae automáticamente
      setExpandedGroups({});
    }
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
    if (isLocked) { // Si se va a desbloquear, contraer si no está expandido por hover
      setIsExpanded(false);
      setExpandedGroups({}); // Colapsar todos los grupos al desbloquear
    } else { // Si se va a bloquear, expandir para mostrar el contenido
      setIsExpanded(true);
    }
  };

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
      // Solo expandir si no está ya bloqueado y se permite la expansión automática
      // O si está bloqueado y queremos que siempre muestre el grupo activo
      if (isLocked || isExpanded) { // Si está bloqueado o expandido por hover, mantener/abrir grupo activo
         setExpandedGroups(prev => ({ ...prev, [currentGroup]: true }));
      }
    }
  }, [location.pathname, isLocked, isExpanded]); // Depende de location, isLocked, isExpanded

  // Manejar el estado de expansión de grupos
  const toggleGroup = (groupId) => {
    // Solo permitir el toggle si el sidebar está expandido (por hover o bloqueo)
    if (isExpanded || isLocked) {
      setExpandedGroups(prev => {
        // Si el grupo ya está abierto, lo cierra. Si no, lo abre y cierra los demás.
        const newState = {};
        if (!prev[groupId]) { // Si no estaba abierto, ábrelo
          newState[groupId] = true;
        }
        return newState;
      });
    }
  };


  const isActiveRoute = (path) => {
    // Ajustar para que si la ruta es '/' y el sidebar no está expandido/bloqueado, no se marque
    // Esto es para que el icono del dashboard no se vea "activo" cuando el sidebar está minimizado
    // y no hay una ruta activa específica dentro de él.
    if (path === '/dashboard' && location.pathname === '/') return true; // Dashboard es el index del layout
    return location.pathname === path;
  };

  // Función de Logout ( Placeholder )
  const handleLogout = () => {
    // Aquí puedes limpiar localStorage, redirigir al login, etc.
    localStorage.removeItem('currentUser'); // Eliminar información del usuario
    // Redirigir al login o a la página principal
    window.location.href = '/'; // O usar useNavigate() si está disponible
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
            <span className="ml-3 font-semibold text-background text-3xl whitespace-nowrap">
              CAP<span className='text-yellow-700'>EX</span>
            </span>
          ) : (
            // Icono más pequeño para el estado colapsado
            <span className="font-bold text-white text-3xl bg-yellow-700 rounded-full w-10 h-10 flex items-center justify-center">
              C
            </span>
          )}
        </div>
        {(isExpanded || isLocked) && (
          <button
            onClick={toggleLock}
            className={`p-1 rounded transition-colors ${
              isLocked
                ? 'text-background/80 hover:text-background'
                : 'text-background/80 hover:text-background'
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
        {loadingData ? (
          <div className="text-white/70 text-center py-4">Cargando menú...</div>
        ) : (
          menuGroups.map((group) => (
            <div key={group.id} className="mb-2">
              {/* Group Header o Link directo */}
              {group.items ? (
                <div
                  className={`flex items-center px-4 py-2 text-background/80 hover:bg-background/10 hover:text-background rounded-lg cursor-pointer transition-colors ${
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
                  {(isExpanded || isLocked) && group.items.length > 0 && ( // Solo mostrar chevron si hay items para expandir/contraer
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
                      ? 'bg-background/20 text-background rounded-xl'
                      : 'text-background/90 hover:bg-background/10 hover:text-background rounded-xl'
                  }`}
                  title={!(isExpanded || isLocked) ? group.name : ''}
                >
                  <i className={`${group.icon} text-base`}></i>
                  {(isExpanded || isLocked) && (
                    <span className="ml-3 text-sm whitespace-nowrap ">
                      {group.name}
                    </span>
                  )}
                </Link>
              )}

              {/* Group Items - Solo mostrar si el grupo tiene items Y está expandido (o si el sidebar está minimizado y debe mostrar iconos) */}
              {group.items && (expandedGroups[group.id] || (!isExpanded && !isLocked)) && (
                <div className={`${(isExpanded || isLocked) ? 'ml-4' : ''}`}>
                  {Array.isArray(group.items) && group.items.map((item, index) => (
                    // Asegurarse de que el ítem tenga permiso para ser mostrado
                    hasPermission(item.module, 'Visualizar') && (
                      <Link
                        key={index}
                        to={item.path}
                        className={`flex items-center px-4 py-2 cursor-pointer transition-colors no-underline ${
                          (isExpanded || isLocked) ? '' : 'justify-center'
                        } ${
                          isActiveRoute(item.path)
                            ? 'bg-background/20 text-background rounded-xl '
                            : 'text-background/90 hover:bg-background/10 hover:text-background rounded-xl'
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
                    )
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </nav>

      {/* Footer fijo */}
      <div className="p-4 border-t border-accent/50 flex items-center justify-center">
        <button className="w-full text-background py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-background/10"
                onClick={handleLogout}>
          <i className="bi bi-box-arrow-right text-base"></i>
          {(isExpanded || isLocked) && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;