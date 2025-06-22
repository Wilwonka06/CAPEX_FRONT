// components/Sidebar.jsx
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isLocked, setIsLocked] = useState(false);
  const location = useLocation();

  const menuGroups = [
    {
      id: 'main',
      title: 'Principal',
      icon: 'bi-speedometer2',
      items: [
        { name: 'Dashboard', icon: 'bi-speedometer2', path: '/' }
      ]
    },
    {
      id: 'users',
      title: 'Gestión de Usuarios',
      icon: 'bi-people',
      items: [
        { name: 'Usuarios', icon: 'bi-person', path: '/usuarios' },
        { name: 'Roles', icon: 'bi-shield-check', path: '/roles' },
        { name: 'Empleados', icon: 'bi-person-badge', path: '/empleados' }
      ]
    },
    {
      id: 'contacts',
      title: 'Contactos',
      icon: 'bi-person-lines-fill',
      items: [
        { name: 'Clientes', icon: 'bi-person-heart', path: '/clientes' },
        { name: 'Proveedores', icon: 'bi-truck', path: '/proveedores' }
      ]
    },
    {
      id: 'products',
      title: 'Productos',
      icon: 'bi-box-seam',
      items: [
        { name: 'Categorías de Productos', icon: 'bi-tags', path: '/categorias-productos' },
        { name: 'Productos', icon: 'bi-box', path: '/productos' },
        { name: 'Compras', icon: 'bi-cart-plus', path: '/compras' }
      ]
    },
    {
      id: 'services',
      title: 'Servicios',
      icon: 'bi-gear',
      items: [
        { name: 'Categorías de Servicios', icon: 'bi-collection', path: '/categorias-servicios' },
        { name: 'Servicios', icon: 'bi-tools', path: '/servicios' },
        { name: 'Agendamiento de Citas', icon: 'bi-calendar-check', path: '/citas' }
      ]
    },
    {
      id: 'sales',
      title: 'Ventas',
      icon: 'bi-graph-up',
      items: [
        { name: 'Pedidos de Productos', icon: 'bi-clipboard-check', path: '/pedidos' },
        { name: 'Venta de Productos', icon: 'bi-bag-check', path: '/ventas-productos' }
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
      className={`bg-white shadow-lg transition-all duration-300 ease-in-out ${
        isExpanded || isLocked ? 'w-64' : 'w-16'
      } flex flex-col h-full`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <i className="bi bi-asterisk text-white text-sm"></i>
          </div>
          {(isExpanded || isLocked) && (
            <span className="ml-3 font-semibold text-gray-800 whitespace-nowrap">
              Mi Sistema
            </span>
          )}
        </div>
        {(isExpanded || isLocked) && (
          <button
            onClick={toggleLock}
            className={`p-1 rounded transition-colors ${
              isLocked 
                ? 'text-orange-500 hover:text-orange-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title={isLocked ? 'Desbloquear sidebar' : 'Bloquear sidebar'}
          >
            <i className={`bi ${isLocked ? 'bi-lock-fill' : 'bi-unlock'}`}></i>
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuGroups.map((group) => (
          <div key={group.id} className="mb-2">
            {/* Group Header */}
            <div
              className={`flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors ${
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

            {/* Group Items */}
            {(expandedGroups[group.id] || (!isExpanded && !isLocked)) && (
              <div className={`${(isExpanded || isLocked) ? 'ml-4' : ''}`}>
                {group.items.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className={`flex items-center px-4 py-2 cursor-pointer transition-colors no-underline ${
                      (isExpanded || isLocked) ? '' : 'justify-center'
                    } ${
                      isActiveRoute(item.path)
                        ? 'bg-blue-100 text-blue-600 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
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

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <Link
          to="/configuracion"
          className={`flex items-center text-gray-600 hover:bg-gray-50 p-2 rounded cursor-pointer transition-colors no-underline ${
            (isExpanded || isLocked) ? '' : 'justify-center'
          }`}
        >
          <i className="bi bi-gear text-lg"></i>
          {(isExpanded || isLocked) && (
            <span className="ml-3 text-sm whitespace-nowrap">Configuración</span>
          )}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;