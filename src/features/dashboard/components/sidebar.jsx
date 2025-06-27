// components/Sidebar.jsx
import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    main: false,
    users: false,
    contacts: false,
    products: false,
    services: false,
    sales: false
  });
  const [isLocked, setIsLocked] = useState(false);
  const location = useLocation();

  const menuGroups = [
    {
      id: 'main',
      name: 'Dashboard', 
      icon: 'bi-speedometer2', 
      path: '/'
      
    },
    {
      id: 'users',
      title: 'Gestión de Usuarios',
      icon: 'bi-people',
      items: [
        { name: 'Usuarios', icon: 'bi-person', path: '/usuarios' },
      ]
    },
    {
      id: 'shoppings',
      title: 'Gestión de Compras',
      icon: 'bi-box-seam',
      items: [
        { name: 'Categorías de Productos', icon: 'bi-tags', path: '/categorias-productos' },
        { name: 'Productos', icon: 'bi-box', path: '/productos' },
        { name: 'Proveedores', icon: 'bi-truck', path: '/proveedores' },
        { name: 'Compras', icon: 'bi-cart-plus', path: '/compras' }
      ]
    },
    {
      id: 'services',
      title: 'Gestión de Servicios',
      icon: 'bi-gear',
      items: [
        { name: 'Categorías de Servicios', icon: 'bi-collection', path: '/categorias-servicios' },
        { name: 'Servicios', icon: 'bi-tools', path: '/servicios' },
        { name: 'Empleados', icon: 'bi-person-badge', path: '/empleados' },
        { name: 'Agendamiento de Citas', icon: 'bi-calendar-check', path: '/programacion' }
      ]
    },
    {
      id: 'sales',
      title: 'Ventas',
      icon: 'bi-graph-up',
      items: [
        { name: 'Clientes', icon: 'bi-person-heart', path: '/clientes' },
        { name: 'Pedidos de Productos', icon: 'bi-clipboard-check', path: '/pedidos' },
        { name: 'Venta de Productos', icon: 'bi-bag-check', path: '/ventas-productos' },
        { name: 'Venta de Servicios', icon: '', path: '/ventas-servicios' }
      ]
    },
    {
      id: 'config',
      title: 'configuración',
      icon: 'bi-people',
      items: [
        { name: 'Roles', icon: 'bi-shield-check', path: '/roles' },
      ]
    }

  ];

  const handleMouseEnter = () => {
    if (!isLocked) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isLocked) {
      setIsExpanded(false);
      setExpandedGroups({});
    }
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
    if (!isLocked) {
      setIsExpanded(true);
    }
  };

  const toggleGroup = (groupId) => {
    if (isExpanded || isLocked) {
      setExpandedGroups(prev => ({
        ...prev,
        [groupId]: !prev[groupId]
      }));
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div
      className={`bg-background shadow-lg transition-all duration-300 ease-in-out ${
        isExpanded || isLocked ? 'w-64' : 'w-16'
      } flex flex-col h-full`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="p-4 border-b border-accent/50 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="bi bi-shop text-background text-sm"></i>
          </div>
          {(isExpanded || isLocked) && (
            <span className="ml-3 font-semibold text-text-main whitespace-nowrap">
              CAPEX
            </span>
          )}
        </div>
        {(isExpanded || isLocked) && (
          <button
            onClick={toggleLock}
            className={`p-1 rounded transition-colors ${
              isLocked 
                ? 'text-primary hover:text-primary-dark' 
                : 'text-accent hover:text-primary'
            }`}
            title={isLocked ? 'Desbloquear sidebar' : 'Bloquear sidebar'}
          >
            <i className={`bi ${isLocked ? 'bi-lock-fill' : 'bi-unlock'}`}></i>
          </button>
        )}
      </div>

      {/* Menu con scroll */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent">
        {menuGroups.map((group) => (
          <div key={group.id} className="mb-2">
            {/* Group Header */}
            <div
              className={`flex items-center px-4 py-2 text-text-main/80 hover:bg-accent-light/30 cursor-pointer transition-colors ${
                (isExpanded || isLocked) ? 'justify-between' : 'justify-center'
              }`}
              onClick={() => toggleGroup(group.id)}
            >
              <div className="flex items-center">
                <i className={`${group.icon} text-lg`}></i>
                {(isExpanded || isLocked) && (
                  <span className="ml-3 text-sm font-medium whitespace-nowrap">
                    {group.title || group.name}
                  </span>
                )}
              </div>
              {(isExpanded || isLocked) && group.items && (
                <i className={`bi bi-chevron-${expandedGroups[group.id] ? 'up' : 'down'} text-xs`}></i>
              )}
            </div>

            {/* Group Items o Link directo */}
            {group.items ? (
              (expandedGroups[group.id] || (!isExpanded && !isLocked)) && (
                <div className={`${(isExpanded || isLocked) ? 'ml-4' : ''}`}>
                  {Array.isArray(group.items) && group.items.map((item, index) => (
                    <Link
                      key={index}
                      to={item.path}
                      className={`flex items-center px-4 py-2 cursor-pointer transition-colors no-underline ${
                        (isExpanded || isLocked) ? '' : 'justify-center'
                      } ${
                        isActiveRoute(item.path)
                          ? 'bg-accent-light/50 text-primary-dark border-r-2 border-primary'
                          : 'text-text-main/90 hover:bg-accent-light/40 hover:text-primary-dark'
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
              )
            ) : (
              <Link
                to={group.path}
                className={`flex items-center px-4 py-2 cursor-pointer transition-colors no-underline ${
                  (isExpanded || isLocked) ? '' : 'justify-center'
                } ${
                  isActiveRoute(group.path)
                    ? 'bg-accent-light/50 text-primary-dark border-r-2 border-primary'
                    : 'text-text-main/90 hover:bg-accent-light/40 hover:text-primary-dark'
                }`}
                title={!(isExpanded || isLocked) ? group.name : ''}
              >
                <i className={`${group.icon} text-base`}></i>
                {(isExpanded || isLocked) && (
                  <span className="ml-3 text-sm whitespace-nowrap">
                    {group.name}
                  </span>
                )}
              </Link>
            )}
          </div>
        ))}
      </nav>
      {/* Footer fijo */}
      <div className="p-4 border-t  flex items-center justify-center">
        <button className="w-full text-main py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
          <i className="bi bi-box-arrow-right text-base"></i>
          {(isExpanded || isLocked) && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;