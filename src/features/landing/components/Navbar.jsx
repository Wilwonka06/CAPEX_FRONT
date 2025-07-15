import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';
import { useCart } from './CartContext';
import { FaShoppingCart } from 'react-icons/fa';


const Navbar = () => {
    // Estado para controlar la visibilidad del menú móvil
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('currentUser')));
    const [showProfile, setShowProfile] = useState(false);
    const navigate = useNavigate();
    const profileRef = useRef();

    // Estado para controlar el menú desplegable de productos
    const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
    const { cart } = useCart();

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
    }

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
                    <Link to="/landing/catalogo" className="text-text-main px-4 py-2 rounded-md transition-colors duration-300 w-full md:w-auto text-center md:text-center md:hover:bg-accent-light md:hover:text-primary">
                        Productos
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
                    {isClient && (
                        <Link to="/landing/citas-cliente" className="text-text-main px-4 py-2 rounded-md transition-colors duration-300 w-full md:w-auto text-center md:text-center md:hover:bg-accent-light md:hover:text-primary">
                            Citas
                        </Link>
                    )}
                </div>

                {/* Botones de Autenticación (a la derecha) */}
                <div className="hidden md:flex md:space-x-4 items-center relative" ref={profileRef}>
                    {/* Carrito */}
                    <Link to="/landing/cart" className="relative mr-2 group">
                        <FaShoppingCart className="text-2xl text-primary group-hover:text-primary-dark transition" />
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow">{cart.reduce((sum, item) => sum + (item.cantidad || 1), 0)}</span>
                        )}
                    </Link>
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
                                    showOrdersOption={true}
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

