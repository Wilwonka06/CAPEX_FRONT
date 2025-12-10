import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import DashboardProfileMenu from "./DashboardProfileMenu";
import ConfirmLogoutModal from "../../../shared/components/ConfirmLogoutModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/AuthContext";

const AdminNavbar = ({ title }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { logoutConfirmed, currentUser: authUser, setActiveRole } = useAuth();
  const profileRef = useRef();

  // Sincronizar con el contexto de autenticación
  useEffect(() => {
    setCurrentUser(authUser);
  }, [authUser]);

  // Cerrar el menú de perfil al hacer clic fuera
  useEffect(() => {
    if (!showProfileMenu) return;
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu]);

  return (
    <nav className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between">
      {/* Título del módulo */}
      <div className="flex-1">
        {title && <h1 className="text-xl font-bold text-gray-800">{title}</h1>}
      </div>
      <div className="flex items-center gap-4" ref={profileRef}>
        {/* Selector de rol activo */}
        {currentUser?.roles?.length > 0 && (
          <div className="flex items-center gap-2">
            {/* Indicador visual del rol seleccionado */}
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
              <i className="bi bi-shield-lock"></i>
              {(() => {
                const activeId =
                  currentUser.activeRoleId || currentUser.rol?.id_rol;
                const activeName =
                  (currentUser.roles || []).find((r) => r.id_rol === activeId)
                    ?.nombre || currentUser.rol?.nombre;
                return activeName || "—";
              })()}
            </span>
          </div>
        )}
        {currentUser && (
          <div className="relative">
            <button
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              onClick={() => setShowProfileMenu((v) => !v)}
              title={currentUser.nombre}
            >
              {currentUser.foto || currentUser.avatar ? (
                <img
                  src={currentUser.foto || currentUser.avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-text-main to-text-main flex items-center justify-center">
                  <i className="bi bi-person text-yellow-500 text-sm"></i>
                </div>
              )}
              <i
                className={`bi bi-chevron-${
                  showProfileMenu ? "up" : "down"
                } text-gray-500 transition-transform duration-200`}
              ></i>
            </button>
            {showProfileMenu && (
              <DashboardProfileMenu
                user={currentUser}
                onClose={() => setShowProfileMenu(false)}
                onLogout={() => {
                  setShowProfileMenu(false);
                  setShowLogoutModal(true);
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmación de logout */}
      <ConfirmLogoutModal
        isOpen={showLogoutModal}
        onClose={() => {
          if (!isLoggingOut) {
            setShowLogoutModal(false);
          }
        }}
        onConfirm={async () => {
          setIsLoggingOut(true);
          try {
            await logoutConfirmed();
          } catch (error) {
            console.error("Error al cerrar sesión:", error);
            setIsLoggingOut(false);
            setShowLogoutModal(false);
          }
        }}
        loading={isLoggingOut}
      />
    </nav>
  );
};

AdminNavbar.propTypes = {
  title: PropTypes.string,
};

export default AdminNavbar;