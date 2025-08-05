import { useState, createContext, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

const initialRoles = [
  {
    id: 1,
    name: 'Administrador',
    description: 'Acceso total a todas las funciones del sistema.',
    estado: 'Activo',
    privileges: {},
  },
  {
    id: 2,
    name: 'Vendedor',
    description: 'Puede gestionar ventas y clientes.',
    estado: 'Activo',
    privileges: {},
  },
  {
    id: 3,
    name: 'Invitado',
    description: 'Acceso limitado solo a consulta.',
    estado: 'Inactivo',
    privileges: {},
  },
];

const RolesContext = createContext();

const getStoredRoles = () => {
  try {
    const stored = localStorage.getItem('roles');
    return stored ? JSON.parse(stored) : initialRoles;
  } catch (error) {
    console.error('Error al cargar roles del localStorage:', error);
    return initialRoles;
  }
};

const saveRolesToStorage = (roles) => {
  try {
    localStorage.setItem('roles', JSON.stringify(roles));
  } catch (error) {
    console.error('Error al guardar roles en localStorage:', error);
  }
};

export function RolesProvider({ children }) {
  const [roles, setRoles] = useState(getStoredRoles);

  useEffect(() => {
    saveRolesToStorage(roles);
  }, [roles]);

  const addRole = (role) => {
    const newRole = {
      ...role,
      id: Date.now(),
      estado: role.estado || 'Activo',
    };
    setRoles(prev => [newRole, ...prev]);
  };

  const editRole = (updatedRole) => {
    setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
  };

  const deleteRole = (id) => {
    setRoles(prev => prev.filter(r => r.id !== id));
  };

  return (
    <RolesContext.Provider value={{
      roles,
      addRole,
      editRole,
      deleteRole,
      setRoles
    }}>
      {children}
    </RolesContext.Provider>
  );
}

RolesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useRoles() {
  const context = useContext(RolesContext);
  if (!context) throw new Error('useRoles debe usarse dentro de RolesProvider');
  return context;
} 