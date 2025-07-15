import { Link, useNavigate } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';
import { useCart } from './CartContext';
import { FaShoppingCart } from 'react-icons/fa';
import React, { useState, useRef, useEffect } from 'react';

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
        <nav>
            <div className="hidden md:flex md:space-x-4 items-center relative" ref={profileRef}>
                {/* Carrito */}
                <Link to="/landing/cart" className="relative mr-2 group">
                    <FaShoppingCart className="text-2xl text-primary group-hover:text-primary-dark transition" />
                    {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow">
                            {cart.reduce((sum, item) => sum + (item.cantidad || 1), 0)}
                        </span>
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
        </nav>
    );
};

export default Navbar;