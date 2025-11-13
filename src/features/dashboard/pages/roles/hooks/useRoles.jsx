import { useState, createContext, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { rolesService } from '../API/rolesService';

const RolesContext = createContext();

// El hook ahora es más simple ya que la lógica compleja está en los servicios

export function RolesProvider({ children }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar roles al inicializar
  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const rolesData = await rolesService.getAll();
      setRoles(rolesData);
    } catch (err) {
      setError(err.message);
      console.error('Error al cargar roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const addRole = async (roleData) => {
    setLoading(true);
    try {
      const newRole = await rolesService.create(roleData);
      // Actualizar el estado local después de crear exitosamente
      setRoles(prevRoles => [...prevRoles, newRole]);
      return newRole;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editRole = async (updatedRole) => {
    setLoading(true);
    try {
      console.log('📤 Enviando rol a API:', updatedRole);
      const editedRole = await rolesService.update(updatedRole.id, updatedRole);
      console.log('📥 Respuesta de API:', editedRole);

      // Actualizar el estado local después de editar exitosamente
      setRoles(prevRoles => {
        const newRoles = prevRoles.map(role =>
          role.id === updatedRole.id ? editedRole : role
        );
        console.log('🔄 Estado local actualizado:', newRoles);
        return newRoles;
      });

      return editedRole;
    } catch (err) {
      console.error('❌ Error al editar rol:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await rolesService.delete(id);
      setRoles(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changeRoleStatus = async (id, status) => {
    setLoading(true);
    try {
      const updatedRole = await rolesService.changeStatus(id, status);
      // Actualizar el estado local después de cambiar estado exitosamente
      setRoles(prevRoles => 
        prevRoles.map(role => 
          role.id === id ? { ...role, estado: status } : role
        )
      );
      return updatedRole;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAvailablePrivileges = async () => {
    try {
      return await rolesService.getAvailablePrivileges();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getAvailablePermissions = async () => {
    try {
      return await rolesService.getAvailablePermissions();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <RolesContext.Provider value={{
      roles,
      loading,
      error,
      addRole,
      editRole,
      deleteRole,
      changeRoleStatus,
      getAvailablePrivileges,
      getAvailablePermissions,
      loadRoles,
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