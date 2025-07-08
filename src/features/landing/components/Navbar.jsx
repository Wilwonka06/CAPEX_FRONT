import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';

// Asegúrate de que los colores personalizados estén configurados en tu tailwind.config.js
// Ejemplo de configuración en tailwind.config.js:
// module.exports = {
//   theme: {
//     extend: {
//       colors: {
//         'primary': '#A0522D',
//         'primary-dark': '#4B2A2A',
//         'accent': '#D2B48C',
//         'accent-light': '#F7DAA2',
//         'background': '#FFF8F0',
//         'text-main': '#1E1E1E',
//       },
//     },
//   },
//   plugins: [],
// };

const Navbar = () => {
    // Estado para controlar la visibilidad del menú móvil
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // Estado para controlar el menú desplegable de productos
    const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
    const { cart } = useCart();
    const totalItems = cart.reduce((sum, item) => sum + (item.cantidad || 1), 0);

    // Función para alternar el menú móvil
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Función para alternar el menú desplegable de productos
    const toggleProductsDropdown = () => {
        setIsProductsDropdownOpen(!isProductsDropdownOpen);
    };

    return (
        <nav className="bg-background p-2 shadow-lg">
            <div className="container mx-auto flex justify-between items-center flex-wrap">
                {/* Logo o Nombre de la Marca */}
                <div className="text-text-main text-2xl font-bold rounded-md flex items-center">
                    {/* Imagen de ejemplo - reemplaza con tu logo real */}
                    <img src="https://placehold.co/32x32/D2B48C/1E1E1E?text=M" alt="Logo" className="rounded-full mr-2" />
                    <Link to="/" className="p-2 rounded-md transition-colors duration-300 text-primary hover:text-primary">
                        CAPEX
                    </Link>
                </div>

                {/* Botón de Hamburguesa para Móvil */}
                <button
                    id="mobile-menu-button"
                    className="text-text-main md:hidden focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-2"
                    onClick={toggleMobileMenu}
                >
                    <i className="fas fa-bars text-2xl"></i>
                </button>

                {/* Menú de Navegación Centrado (visible en desktop, oculto por defecto en móvil) */}
                <div
                    id="navigation-menu"
                    className={`${isMobileMenuOpen ? 'flex flex-col' : 'hidden'} md:flex md:flex-row md:space-x-8 mt-4 md:mt-0 w-full md:w-auto items-center justify-center`}
                >
                    <Link to="/landing/servicespage" className="text-text-main px-4 py-2 rounded-md transition-colors duration-300 w-full md:w-auto text-center md:text-center md:hover:bg-accent-light md:hover:text-primary ">
                        Servicios
                    </Link>
                    
                    {/* Menú desplegable de Productos */}
                    <div className="relative w-full md:w-auto">
                        <button
                            onClick={toggleProductsDropdown}
                            className="text-text-main px-4 py-2 rounded-md transition-colors duration-300 w-full md:w-auto text-center md:text-center md:hover:bg-accent-light md:hover:text-primary  flex items-center justify-center gap-2"
                        >
                        Productos
                            <svg 
                                className={`w-4 h-4 transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        
                        {/* Dropdown de Productos */}
                        <div className={`${isProductsDropdownOpen ? 'block' : 'hidden'} absolute left-0 right-0 md:left-auto md:right-auto md:min-w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1`}>
                            
                            <Link 
                                to="/landing/extensiones" 
                                className="block px-4 py-2 text-text-main hover:bg-accent-light hover:text-primary transition-colors duration-200  text-sm"
                                onClick={() => setIsProductsDropdownOpen(false)}
                            >
                                Extensiones
                            </Link>
                            <Link 
                                to="/landing/cuidado-capilar" 
                                className="block px-4 py-2 text-text-main hover:bg-accent-light hover:text-primary transition-colors duration-200  text-sm"
                                onClick={() => setIsProductsDropdownOpen(false)}
                            >
                                Cuidado Capilar
                    </Link>
                        </div>
                    </div>
                    
                    <Link to="/citas" className="text-text-main px-4 py-2 rounded-md transition-colors duration-300 w-full md:w-auto text-center md:text-center md:hover:bg-accent-light md:hover:text-primary ">
                        Citas
                    </Link>
                </div>

                {/* Botones de Autenticación o Perfil de Usuario (a la derecha) */}
                <div className="hidden md:flex md:space-x-4 items-center">
                    <Link to="/landing/mis-pedidos" className="px-4 py-2 font-semibold duration-300 flex items-center gap-2">
                        <span className="material-icons">assignment</span>
                        <span className="hidden lg:inline">Mis pedidos</span>
                    </Link>
                    <Link to="/landing/cart" className="px-4 py-2 font-semibold duration-300 flex items-center gap-2 relative">
                        <span className="material-icons">shopping_cart</span>
                        {totalItems > 0 && (
                          <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold shadow">{totalItems}</span>
                        )}
                    </Link>
                    <Link to="/dashboard" className="bg-primary-dark text-white px-6 py-2 rounded-full font-semibold duration-300 shadow-md hover:bg-primary ">
                        Iniciar Sesión
                    </Link>
                </div>
                {/* Botón carrito en móvil */}
                <div className="md:hidden flex items-center mt-4 w-full justify-end">
                    <Link to="/landing/mis-pedidos" className="px-4 py-2 font-semibold duration-300 flex items-center gap-2">
                        <span className="material-icons">assignment</span>
                    </Link>
                    <Link to="/landing/cart" className="px-4 py-2 font-semibold duration-300 flex items-center gap-2 relative">
                        <span className="material-icons">shopping_cart</span>
                        {totalItems > 0 && (
                          <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold shadow">{totalItems}</span>
                        )}
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

