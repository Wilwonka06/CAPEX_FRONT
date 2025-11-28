import { useAuth } from '../../../shared/contexts/AuthContext';
import { Link } from 'react-router-dom';

const AccessCards = () => {
  const { currentUser, hasPrivilege } = useAuth();

  // Mapeo de módulos con sus rutas e iconos
  const moduleMap = {
    'Clientes': { path: '/dashboard/clientes', icon: 'bi-person', color: 'bg-text-main' },
    'Citas': { path: '/dashboard/citas', icon: 'bi-calendar-event', color: 'bg-text-main' },
    'Pedidos': { path: '/dashboard/pedidos', icon: 'bi-clipboard-check', color: 'bg-text-main' },
    'Ventas': { path: '/dashboard/ventas-servicios', icon: 'bi-bag-check', color: 'bg-text-main' }, // Venta de servicios (también incluye productos)
    'Venta de Productos': { path: '/dashboard/ventas-productos', icon: 'bi-bag-check', color: 'bg-text-main' }, // Venta de productos únicamente
    'Productos': { path: '/dashboard/productos', icon: 'bi-box-seam', color: 'bg-text-main' },
    'Compras': { path: '/dashboard/compras', icon: 'bi-cart-plus', color: 'bg-text-main' },
    'Proveedores': { path: '/dashboard/proveedores', icon: 'bi-truck', color: 'bg-text-main' },
    'Categorías de Productos': { path: '/dashboard/categorias-productos', icon: 'bi-collection', color: 'bg-text-main' },
    'Categorías de Servicios': { path: '/dashboard/categorias-servicios', icon: 'bi-collection', color: 'bg-text-main' },
    'Servicios': { path: '/dashboard/servicios', icon: 'bi-scissors', color: 'bg-text-main' },
    'Empleados': { path: '/dashboard/empleados', icon: 'bi-person-badge', color: 'bg-text-main' },
    'Programación': { path: '/dashboard/programacion', icon: 'bi-calendar-week', color: 'bg-text-main' },
    'Usuarios': { path: '/dashboard/usuarios', icon: 'bi-people', color: 'bg-text-main' }
  };

  // Obtener módulos a los que el usuario tiene acceso
  const getAccessibleModules = () => {
    if (!currentUser || !currentUser.privileges) {
      return [];
    }

    const accessibleModules = [];
    
    // Verificar cada módulo
    Object.keys(moduleMap).forEach(moduleName => {
      if (hasPrivilege(moduleName, 'Visualizar')) {
        accessibleModules.push({
          name: moduleName,
          ...moduleMap[moduleName]
        });
      }
    });

    return accessibleModules;
  };

  const accessibleModules = getAccessibleModules();

  if (accessibleModules.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sin acceso a módulos</h2>
          <p className="text-gray-600">
            No tienes permisos para acceder a ningún módulo del sistema.
            Contacta a un administrador para obtener los permisos necesarios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Bienvenido al Sistema CAPEX
          </h1>
          <p className="text-gray-600">
            Selecciona un módulo para comenzar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {accessibleModules.map((module, index) => (
            <Link
              key={index}
              to={module.path}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-gray-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`${module.color} w-16 h-16 rounded-full flex items-center justify-center mb-4`}>
                  <i className={`${module.icon} text-yellow-500 text-2xl`}></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {module.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Haz clic para acceder
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccessCards;

