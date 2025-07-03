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

    // Función para alternar el menú móvil
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="bg-background p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center flex-wrap">
                {/* Logo o Nombre de la Marca */}
                <div className="text-text-main text-2xl font-bold rounded-md flex items-center">
                    {/* Imagen de ejemplo - reemplaza con tu logo real */}
                    <img src="https://placehold.co/32x32/D2B48C/1E1E1E?text=M" alt="Logo" className="rounded-full mr-2" />
                    <Link to="/landing" className="p-2 rounded-md transition-colors duration-300 text-primary hover:text-primary">
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
                    <Link to="/landing/servicespage" className="text-text-main px-4 py-2 rounded-md transition-colors duration-300 w-full md:w-auto text-center md:text-center md:hover:bg-accent-light md:hover:text-primary">
                        Servicios
                    </Link>
                    
                    <Link to="/landing/productos" className="text-text-main px-4 py-2 rounded-md transition-colors duration-300 w-full md:w-auto text-center md:text-center md:hover:bg-accent-light md:hover:text-primary">
                        Productos
                    </Link>
                    
                    <Link to="/citas" className="text-text-main px-4 py-2 rounded-md transition-colors duration-300 w-full md:w-auto text-center md:text-center md:hover:bg-accent-light md:hover:text-primary">
                        Citas
                    </Link>
                </div>

                {/* Botones de Autenticación (a la derecha) */}
                <div className="hidden md:flex md:space-x-4 items-center">
                    <Link to="/dashboard" className="bg-primary-dark text-white px-6 py-2 rounded-full font-semibold transition-colors duration-300 shadow-md hover:bg-primary">
                        Iniciar Sesión
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

