// components/Sidebar.jsx
import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import logo from '../../../shared/images/Logo.png';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [loadingData] = useState(false);
  const location = useLocation();
  const { hasPrivilege, currentUser } = useAuth();

  // ✅ CORREGIDO: Usar el contexto de autenticación para verificar privilegios
  // Esto asegura que los Administradores tengan acceso a todos los módulos
  const hasPermission = (module, action = 'Visualizar') => {
    return hasPrivilege(module, action);
  };

  // ✅ CORREGIDO: Usuarios ahora está en Configuración
  const getFilteredMenuGroups = () => {
    const allMenuGroups = [
      {
        id: 'main',
        name: 'Dashboard',
        title: 'Dashboard',
        icon: 'bi-speedometer2',
        path: '/dashboard',
        module: 'Dashboard'
      },
      {
        id: 'config',
        title: 'Configuración',
        icon: 'bi-gear-fill',
        module: 'Gestión de Usuarios',
        items: [
          { name: 'Roles', icon: 'bi-shield', path: '/dashboard/roles', module: 'Gestión de Usuarios' },
          { name: 'Usuarios', icon: 'bi-person', path: '/dashboard/usuarios', module: 'Gestión de Usuarios' }
        ]
      },
      {
        id: 'purchases',
        title: 'Gestión de Compras',
        icon: 'bi-cart-check-fill',
        module: 'Gestión de Compras',
        items: [
          { name: 'Categorías de Productos', icon: 'bi-tags-fill', path: '/dashboard/categorias-productos', module: 'Categorías de Productos' },
          { name: 'Productos', icon: 'bi-box-seam-fill', path: '/dashboard/productos', module: 'Productos' },
          { name: 'Proveedores', icon: 'bi-truck-front-fill', path: '/dashboard/proveedores', module: 'Proveedores' },
          { name: 'Compras', icon: 'bi-receipt-cutoff', path: '/dashboard/compras', module: 'Compras' }
        ]
      },
      {
        id: 'services',
        title: 'Gestión de Servicios',
        icon: 'bi-tools',
        module: 'Gestión de Servicios',
        items: [
          { name: 'Categorías de Servicios', icon: 'bi-collection', path: '/dashboard/categorias-servicios', module: 'Categorías de Servicios' },
          { name: 'Servicios', icon: 'bi-scissors', path: '/dashboard/servicios', module: 'Servicios' },
          { name: 'Empleados', icon: 'bi-person-badge', path: '/dashboard/empleados', module: 'Empleados' },
          { name: 'Programación de Empleados', icon: 'bi-calendar-week', path: '/dashboard/programacion', module: 'Programación' }
        ]
      },
      {
        id: 'sales',
        title: 'Gestión de Ventas',
        icon: 'bi-graph-up-arrow',
        module: 'Ventas',
        items: [
          { name: 'Clientes', icon: 'bi-person', path: '/dashboard/clientes', module: 'Clientes' },
          { name: 'Agendamiento de Citas', icon: 'bi-calendar-event', path: '/dashboard/citas', module: 'Citas' },
          { name: 'Pedidos de Productos', icon: 'bi-clipboard-check', path: '/dashboard/pedidos', module: 'Pedidos' },
          { name: 'Venta de Productos', icon: 'bi-bag-check', path: '/dashboard/ventas-productos', module: 'Venta de Productos' },
          { name: 'Venta de Servicios', icon: 'bi-bag-check', path: '/dashboard/ventas-servicios', module: 'Ventas' }
        ]
      }
    ];

    return allMenuGroups.filter(group => {
      if (group.id === 'main') return true;

      if (group.items) {
        const hasAnyItemPermission = group.items.some(item => hasPermission(item.module, 'Visualizar'));
        return hasAnyItemPermission;
      }
      return hasPermission(group.module, 'Visualizar');
    }).map(group => {
      if (group.items) {
        return {
          ...group,
          items: group.items.filter(item => hasPermission(item.module, 'Visualizar'))
        };
      }
      return group;
    });
  };

  // ✅ CORREGIDO: Actualizar cuando cambien los privilegios del usuario
  const menuGroups = React.useMemo(() => getFilteredMenuGroups(), [location.pathname, currentUser?.privileges, currentUser?.rol]);

  useEffect(() => {
    const expanded = {};
    menuGroups.forEach(group => {
      if (group.items && group.items.some(item => isActiveRoute(item.path))) {
        expanded[group.id] = true;
      }
    });
    setExpandedGroups(expanded);
  }, [location.pathname, menuGroups.length]);

  const getGroupIdByPath = (pathname) => {
    for (const group of menuGroups) {
      if (group.path === pathname) return group.id;
      if (group.items) {
        for (const item of group.items) {
          if (item.path === pathname) return group.id;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    const currentGroup = getGroupIdByPath(location.pathname);
    if (currentGroup && isExpanded) {
      setExpandedGroups(prev => ({ ...prev, [currentGroup]: true }));
    }
  }, [location.pathname, isExpanded]);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const isActiveRoute = (path) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
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
            <span className="font-semibold flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
            </span>
          ) : (
            <span className="w-10 h-10 flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            </span>
          )}
        </div>
        {isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 rounded-lg transition-colors text-background/80 hover:text-background hover:bg-background/10 focus:outline-none"
            title="Colapsar menú"
          >
            <i className="bi bi-chevron-left text-lg"></i>
          </button>
        )}
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
              {group.items ? (
                <div
                  className={`flex items-center px-4 py-3 cursor-pointer transition-colors rounded-lg relative ${
                    (isExpanded) ? 'justify-between' : 'justify-center'
                  } ${
                    expandedGroups[group.id]
                      ? 'bg-yellow-500/10 text-yellow-500 rounded-lg font-bold shadow-sm'
                      : 'text-background/80 hover:bg-background/10 hover:text-background'
                  }`}
                  onClick={() => (isExpanded) && toggleGroup(group.id)}
                  title={!(isExpanded) ? group.title : ''}
                >
                  <div className="flex items-center">
                    <i className={`${group.icon} text-sm`}></i>
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
                      ? 'border-l-4 border-yellow-500 bg-yellow-500/10 text-yellow-500 font-semibold'
                      : 'text-background/90 hover:bg-background/10 hover:text-background rounded-xl'
                  }`}
                  title={!(isExpanded) ? group.name : ''}
                >
                  <i className={`${group.icon} text-sm`}></i>
                  {(isExpanded) && (
                    <span className="ml-3 text-sm whitespace-nowrap ">
                      {group.name}
                    </span>
                  )}
                </Link>
              )}

              {(group.items && (isExpanded)) && (
                <div
                  className={`ml-4 overflow-hidden transition-all duration-500 ease-in-out ${expandedGroups[group.id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  style={{ willChange: 'max-height, opacity' }}
                >
                  {Array.isArray(group.items) && group.items.map((item, index) => (
                    hasPermission(item.module, 'Visualizar') && (
                      <Link
                        key={index}
                        to={item.path}
                        className={`flex items-center px-4 py-3 cursor-pointer transition-colors no-underline relative ${
                          isActiveRoute(item.path)
                            ? 'text-yellow-500 bg-yellow-500/10 font-semibold rounded-lg shadow border-l-2 border-yellow-500'
                            : 'text-background/90 hover:bg-background/10 hover:text-background rounded-xl'
                        }`}
                        title={item.name}
                      >
                        <i className={`${item.icon} text-sm`}></i>
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
    </div>
  );
};

export default Sidebar;