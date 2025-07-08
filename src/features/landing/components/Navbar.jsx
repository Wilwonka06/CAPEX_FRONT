import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
    // Estado para controlar el dropdown del perfil
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    
    // Simular usuario autenticado (esto se reemplazará con la lógica real de autenticación)
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [user] = useState({
        name: 'María García',
        email: 'maria@ejemplo.com',
        avatar: null // URL de la imagen de perfil
    });

    // Función para alternar el menú móvil
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Función para alternar el dropdown del perfil
    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    // Función para cerrar sesión
    const handleLogout = () => {
        setIsAuthenticated(false);
        setIsProfileDropdownOpen(false);
        // Aquí iría la lógica real de cerrar sesión
    };

    return (
        <nav className="bg-white p-4">
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
                    <Link to="servicespage" className="text-text-main px-4 py-2 rounded-md transition-colors duration-300 w-full md:w-auto text-center md:text-center md:hover:bg-accent-light md:hover:text-primary">
                        Servicios
                    </Link>
                    
                    <Link to="/landing/productos" className="text-text-main px-4 py-2 rounded-md transition-colors duration-300 w-full md:w-auto text-center md:text-center md:hover:bg-accent-light md:hover:text-primary">
                        Productos
                    </Link>
                    
                    <Link to="/citas" className="text-text-main px-4 py-2 rounded-md transition-colors duration-300 w-full md:w-auto text-center md:text-center md:hover:bg-accent-light md:hover:text-primary">
                        Citas
                    </Link>
                </div>

                {/* Botones de Autenticación o Perfil de Usuario (a la derecha) */}
                <div className="hidden md:flex md:space-x-4 items-center">
                    {!isAuthenticated ? (
                        <>
                            <Link to="/registro" className="bg-accent text-text-main px-6 py-2 rounded-full font-semibold transition-colors duration-300 shadow-md hover:bg-accent-light">
                                Registrarse
                            </Link>
                            <Link to="/dashboard" className="bg-primary-dark text-white px-6 py-2 rounded-full font-semibold transition-colors duration-300 shadow-md hover:bg-primary">
                                Iniciar Sesión
                            </Link>
                        </>
                    ) : (
                        <div className="relative">
                            {/* Botón del perfil */}
                            <button
                                onClick={toggleProfileDropdown}
                                className="flex items-center space-x-2 bg-accent-light hover:bg-accent text-text-main px-4 py-2 rounded-full font-medium transition-colors duration-300 shadow-md"
                            >
                                {user.avatar ? (
                                    <img 
                                        src={user.avatar} 
                                        alt="Perfil" 
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="hidden lg:block">{user.name}</span>
                                <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}></i>
                            </button>

                            {/* Dropdown del perfil */}
                            {isProfileDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-accent-light py-2 z-50">
                                    <div className="px-4 py-2 border-b border-accent-light">
                                        <p className="text-sm font-medium text-text-main">{user.name}</p>
                                        <p className="text-xs text-text-main/60">{user.email}</p>
                                    </div>
                                    <Link 
                                        to="/perfil" 
                                        className="block px-4 py-2 text-sm text-text-main hover:bg-accent-light transition-colors duration-200"
                                        onClick={() => setIsProfileDropdownOpen(false)}
                                    >
                                        <i className="fas fa-user mr-2"></i>
                                        Mi Perfil
                                    </Link>
                                    <Link 
                                        to="/configuracion" 
                                        className="block px-4 py-2 text-sm text-text-main hover:bg-accent-light transition-colors duration-200"
                                        onClick={() => setIsProfileDropdownOpen(false)}
                                    >
                                        <i className="fas fa-cog mr-2"></i>
                                        Configuración
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                                    >
                                        <i className="fas fa-sign-out-alt mr-2"></i>
                                        Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

