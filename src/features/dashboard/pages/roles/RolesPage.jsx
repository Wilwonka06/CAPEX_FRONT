import { useState, useEffect } from "react";
import RolesTable from "./components/RolesTable";
import Search from '../../../../shared/Search';
import Paginator from '../../../../shared/Paginator';
import CreateRoles from "./components/CreateRole";
import { useRoles } from "./hooks/useRoles";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';

const RolesPage = () => {
  const { roles, addRole, editRole, deleteRole } = useRoles();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { setTitle } = useOutletContext();

  useEffect(() => {
    setTitle('Gestión de Roles');
    return () => setTitle('');
  }, [setTitle]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredRoles = roles.filter(
    (role) =>
      (role.name || role.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.description || role.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.estado || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRole = (newRole, privileges) => {
    try {
      addRole({ ...newRole, privileges });
      toast.success('Rol creado exitosamente', { position: 'top-right' });
    } catch {
      toast.error('Error al crear el rol', { position: 'top-right' });
    }
  };

  const handleEditRole = (updatedRole) => {
    try {
      editRole(updatedRole);
      toast.success('Rol actualizado exitosamente', { position: 'top-right' });
    } catch {
      toast.error('Error al actualizar el rol', { position: 'top-right' });
    }
  };

  const handleDeleteRole = async (roleId) => {
    const role = roles.find(r => r.id === roleId);
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar el rol "${role?.name || role?.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        deleteRole(roleId);
        toast.success('Rol eliminado exitosamente', { position: 'top-right' });
      } catch {
        toast.error('Error al eliminar el rol', { position: 'top-right' });
      }
    }
  };

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoles = filteredRoles.slice(startIndex, startIndex + itemsPerPage)
    .map(role => ({
      ...role,
      name: role.name ?? role.nombre ?? '',
    }));

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Search searchTerm={searchTerm} handleSearch={handleSearch} />
              <>
                <button
                  className="px-4 py-2 rounded-md bg-text-main text-white font-semibold hover:bg-primary-dark transition flex items-center text-sm"
                  onClick={() => setIsCreateOpen(true)}
                >
                  <i className="bi bi-plus-circle mr-2"></i>
                  Crear rol
                </button>
                <CreateRoles
                  isOpen={isCreateOpen}
                  onClose={() => setIsCreateOpen(false)}
                  onCreate={handleCreateRole}
                  roles={roles}
                />
              </>
            </div>
            <RolesTable 
              roles={paginatedRoles}
              onEdit={handleEditRole}
              onDelete={handleDeleteRole}
            />
            {totalPages > 1 && (
              <Paginator 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            )}
            <div className="mt-4 text-center">
              {/* <p className="text-sm text-gray-600">
                Mostrando {Math.min(filteredRoles.length, startIndex + 1)} a {Math.min(filteredRoles.length, startIndex + itemsPerPage)} de {filteredRoles.length} roles.
              </p> */}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default RolesPage;