import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';

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
    const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('currentUser')));
    const [showProfile, setShowProfile] = useState(false);
    const navigate = useNavigate();
    const profileRef = useRef();

    // Función para alternar el menú móvil
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Escuchar cambios en localStorage (login/logout) y evento personalizado
    useEffect(() => {
        const handleUserChange = () => {
            setCurrentUser(JSON.parse(localStorage.getItem('currentUser')));
        };
        window.addEventListener('user-auth-changed', handleUserChange);
        window.addEventListener('storage', handleUserChange);
        return () => {
            window.removeEventListener('user-auth-changed', handleUserChange);
            window.removeEventListener('storage', handleUserChange);
        };
    }, []);

    // Cerrar el menú de perfil al hacer clic fuera
    useEffect(() => {
        if (!showProfile) return;
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfile(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showProfile]);

    // Verificar si el usuario logueado es cliente
    const isClient = Array.isArray(currentUser?.roles)
      ? currentUser.roles.includes('Cliente')
      : currentUser?.rol?.toLowerCase() === 'cliente' || currentUser?.roles === 'Cliente';

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        window.dispatchEvent(new Event('user-auth-changed'));
        setShowProfile(false);
        navigate('/login');
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
                    
                    <Link to="/dashboard/productos" className="text-text-main px-4 py-2 rounded-md transition-colors duration-300 w-full md:w-auto text-center md:text-center md:hover:bg-accent-light md:hover:text-primary">
                        Productos
                    </Link>
                    
                    {isClient && (
                        <Link to="/landing/citas-cliente" className="text-text-main px-4 py-2 rounded-md transition-colors duration-300 w-full md:w-auto text-center md:text-center md:hover:bg-accent-light md:hover:text-primary">
                            Citas
                        </Link>
                    )}
                </div>

                {/* Botones de Autenticación (a la derecha) */}
                <div className="hidden md:flex md:space-x-4 items-center relative" ref={profileRef}>
                    {currentUser ? (
                        <>
                            <button
                                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:ring-2 hover:ring-primary focus:outline-none"
                                onClick={() => setShowProfile(v => !v)}
                                title={currentUser.nombre}
                            >
                                {currentUser.foto || currentUser.avatar ? (
                                    <img src={currentUser.foto || currentUser.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <i className="bi bi-person text-2xl"></i>
                                )}
                            </button>
                            {showProfile && (
                                <ProfileMenu
                                    user={currentUser}
                                    onClose={() => setShowProfile(false)}
                                    onLogout={handleLogout}
                                />
                            )}
                        </>
                    ) : (
                        <Link to="/login" className="bg-primary-dark text-white px-6 py-2 rounded-full font-semibold transition-colors duration-300 shadow-md hover:bg-primary">
                            Iniciar Sesión
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

