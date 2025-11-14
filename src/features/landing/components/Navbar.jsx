import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';
import { useCart } from './CartContext';
import cartIcon from '../../../shared/images/cart.png';
import logo from '../../../shared/images/Logo.png';


const Navbar = () => {
    // Estado para controlar la visibilidad del menú móvil
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const navigate = useNavigate();
    const profileRef = useRef();

    const { cart } = useCart();

    // Función para alternar el menú móvil
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Escuchar cambios en localStorage (login/logout) y evento personalizado
    useEffect(() => {
        const handleUserChange = () => {
            try {
                const user = localStorage.getItem('currentUser');
                const parsedUser = user ? JSON.parse(user) : null;
                console.log('🔄 Navbar: Usuario actualizado:', parsedUser?.nombre || 'No autenticado');
                setCurrentUser(parsedUser);
            } catch (error) {
                console.warn('Error parsing currentUser from localStorage:', error);
                setCurrentUser(null);
            }
        };

        // Verificar estado inicial
        handleUserChange();

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

    // Verificar el rol del usuario de forma segura (comentado por ahora)
    // const userRole = currentUser?.rol || currentUser?.roleName || '';
    // const isClient = typeof userRole === 'string' && userRole.toLowerCase() === 'cliente';
    // const isAdmin = typeof userRole === 'string' && userRole.toLowerCase() === 'administrador';
    // const isEmployee = typeof userRole === 'string' && userRole.toLowerCase() === 'empleado';

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        window.dispatchEvent(new Event('user-auth-changed'));
        setShowProfile(false);
        navigate('/iniciar-sesion');
    };

    // Función para alternar el menú desplegable de productos (comentada por ahora)
    // const toggleProductsDropdown = () => {
    //     setIsProductsDropdownOpen(!isProductsDropdownOpen);
    // };

    return (
        <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/landing" className="flex items-center space-x-2 group">
                            <img src={logo} alt="CAPEX Logo" className="h-10 w-10 transition-transform duration-300 group-hover:scale-110" />
                            <span className="text-2xl font-bold font-montserrat">
                                <span className="text-[#1E1E1E]">CAP</span>
                                <span className="text-[#FACC15]">EX</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/landing/servicios"
                            className="text-gray-700 hover:text-[#FACC15] px-3 py-2 text-sm font-medium transition-all duration-300 relative group"
                        >
                            Servicios
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FACC15] transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link
                            to="/landing/catalogo"
                            className="text-gray-700 hover:text-[#FACC15] px-3 py-2 text-sm font-medium transition-all duration-300 relative group"
                        >
                            Productos
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FACC15] transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link
                            to="/landing/citas"
                            className="text-gray-700 hover:text-[#FACC15] px-3 py-2 text-sm font-medium transition-all duration-300 relative group"
                        >
                            Agendar Cita
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FACC15] transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    </div>

                    {/* Right side - Cart & Auth */}
                    <div className="hidden md:flex items-center space-x-4" ref={profileRef}>
                        {/* Cart */}
                        <Link to="/landing/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-all duration-300 group">
                            <img src={cartIcon} alt="Carrito" className="w-6 h-6 min-w-[24px] min-h-[24px] transition-transform duration-300 group-hover:scale-110" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#FACC15] text-[#1E1E1E] text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-lg">
                                    {cart.reduce((sum, item) => sum + (item.cantidad || 1), 0)}
                                </span>
                            )}
                        </Link>

                        {/* Auth */}
                        {currentUser ? (
                            <div className="relative">
                                <button
                                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:ring-offset-2"
                                    onClick={() => setShowProfile(v => !v)}
                                    title={currentUser.nombre}
                                >
                                    {currentUser.foto || currentUser.avatar ? (
                                        <img
                                            src={currentUser.foto || currentUser.avatar}
                                            alt="avatar"
                                            className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FACC15] to-yellow-400 flex items-center justify-center">
                                            <i className="bi bi-person text-white text-sm"></i>
                                        </div>
                                    )}
                                    <i className={`bi bi-chevron-${showProfile ? 'up' : 'down'} text-gray-500 transition-transform duration-200`}></i>
                                </button>
                                {showProfile && (
                                    <ProfileMenu
                                        user={currentUser}
                                        onClose={() => setShowProfile(false)}
                                        onLogout={handleLogout}
                                        showOrdersOption={true}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/iniciar-sesion"
                                    className="text-gray-700 hover:text-[#FACC15] px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-gray-50"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    to="/registrarse"
                                    className="bg-[#FACC15] text-[#1E1E1E] px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-md text-gray-700 hover:text-[#FACC15] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FACC15] transition-all duration-300"
                        >
                            <span className="sr-only">Abrir menú principal</span>
                            <div className="w-6 h-6 flex flex-col justify-center items-center">
                                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md rounded-lg mt-2 shadow-lg border border-gray-100">
                        <Link
                            to="/landing/servicios"
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#FACC15] hover:bg-gray-50 rounded-md transition-all duration-200"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Servicios
                        </Link>
                        <Link
                            to="/landing/catalogo"
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#FACC15] hover:bg-gray-50 rounded-md transition-all duration-200"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Productos
                        </Link>
                        <Link
                            to="/landing/citas"
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#FACC15] hover:bg-gray-50 rounded-md transition-all duration-200"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Agendar Cita
                        </Link>

                        {/* Mobile Cart & Auth */}
                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <div className="flex items-center justify-between">
                                <Link
                                    to="/landing/cart"
                                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-all duration-200"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <div className="relative">
                                        <img src={cartIcon} alt="Carrito" className="w-6 h-6 min-w-[24px] min-h-[24px]" />
                                        {cart.length > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-[#FACC15] text-[#1E1E1E] text-xs font-bold rounded-full min-w-[18px] h-4 flex items-center justify-center">
                                                {cart.reduce((sum, item) => sum + (item.cantidad || 1), 0)}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-gray-700 font-medium">Carrito</span>
                                </Link>

                                {currentUser ? (
                                    <button
                                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-all duration-200 w-full text-left"
                                        onClick={() => {
                                            setShowProfile(v => !v);
                                            setIsMobileMenuOpen(false);
                                        }}
                                    >
                                        {currentUser.foto || currentUser.avatar ? (
                                            <img
                                                src={currentUser.foto || currentUser.avatar}
                                                alt="avatar"
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FACC15] to-yellow-400 flex items-center justify-center">
                                                <i className="bi bi-person text-white text-sm"></i>
                                            </div>
                                        )}
                                        <span className="text-gray-700 font-medium">{currentUser.nombre}</span>
                                    </button>
                                ) : (
                                    <div className="flex flex-col space-y-2">
                                        <Link
                                            to="/iniciar-sesion"
                                            className="block w-full text-center text-gray-700 hover:text-[#FACC15] px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Iniciar Sesión
                                        </Link>
                                        <Link
                                            to="/registrarse"
                                            className="block w-full text-center bg-[#FACC15] text-[#1E1E1E] px-4 py-2 rounded-full font-semibold hover:bg-yellow-400 transition-all duration-300"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Registrarse
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;