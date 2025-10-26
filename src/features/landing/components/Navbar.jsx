import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';
import { useCart } from './CartContext';
import cartIcon from '../../../shared/images/cart.png';


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
                console.log('🔄 Navbar: Usuario actualizado:', parsedUser);
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
        navigate('/login');
    };

    // Función para alternar el menú desplegable de productos (comentada por ahora)
    // const toggleProductsDropdown = () => {
    //     setIsProductsDropdownOpen(!isProductsDropdownOpen);
    // };

    return (
        <nav className="bg-background p-2 shadow-lg">
            <div className="container mx-auto flex justify-between items-center flex-wrap">
                {/* Logo o Nombre de la Marca */}
                <div className="text-text-main text-2xl font-bold rounded-md flex items-center">
                    <Link to="/Landing" className="p-2 rounded-md transition-colors duration-300 text-primary hover:text-primary">
                        <h2 className='text-text-main'>CAP<span className='text-yellow-500'>EX</span></h2>
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
                    <Link to="/landing/servicios" className="text-text-main px-4 py-2 rounded-md transition-colors duration-300 w-full md:w-auto text-center md:text-center md:hover:bg-accent-light md:hover:text-primary ">
                        Servicios
                    </Link>
                    <Link to="/landing/catalogo" className="text-text-main px-4 py-2 rounded-md transition-colors duration-300 w-full md:w-auto text-center md:text-center md:hover:bg-accent-light md:hover:text-primary">
                        Productos
                    </Link>
                    <Link to="/landing/citas" className="text-text-main px-4 py-2 rounded-md transition-colors duration-300 w-full md:w-auto text-center md:text-center md:hover:bg-accent-light md:hover:text-primary">
                        Agendar Cita
                    </Link>
                </div>

                {/* Botones de Autenticación (a la derecha) */}
                <div className="hidden md:flex md:space-x-4 items-center relative" ref={profileRef}>
                    {/* Carrito */}
                    <Link to="/landing/cart" className="relative mr-2 group">
                    <img src={cartIcon} alt="Carrito" className="w-6 h-6" />
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-white text-black text-xs rounded-full px-0.5 py-0.3 ">{cart.reduce((sum, item) => sum + (item.cantidad || 1), 0)}</span>
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