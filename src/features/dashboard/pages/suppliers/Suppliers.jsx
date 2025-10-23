import { useState, useEffect } from "react";
import SuppliersTable from "./components/SuppliersTable";
import CreateSupplier from "./components/CreateSupplier";
import EditSupplier from "./components/EditSupplier";
import SupplierDetail from "./components/SupplierDetail";
import Search from "../../../../shared/Search";
import Paginator from "../../../../shared/Paginator";
import suppliersService from "./API/suppliersService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const { setTitle } = useOutletContext();

  useEffect(() => {
    setTitle('Gestión de Proveedores');
    return () => setTitle('');
  }, [setTitle]);

  // Cargar proveedores al montar el componente
  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await suppliersService.getAll();
      setSuppliers(data);
    } catch (error) {
      toast.error(error.message || 'Error al cargar los proveedores', { 
        position: 'top-right' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar proveedores por término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSuppliers(suppliers);
      return;
    }
    const lowerTerm = searchTerm.toLowerCase();
    setFilteredSuppliers(
      suppliers.filter(supplier =>
        (supplier.nit && supplier.nit.toLowerCase().includes(lowerTerm)) ||
        (supplier.nombre && supplier.nombre.toLowerCase().includes(lowerTerm)) ||
        (supplier.contacto && supplier.contacto.toLowerCase().includes(lowerTerm)) ||
        (supplier.direccion && supplier.direccion.toLowerCase().includes(lowerTerm)) ||
        (supplier.telefono && supplier.telefono.toLowerCase().includes(lowerTerm)) ||
        (supplier.correo && supplier.correo.toLowerCase().includes(lowerTerm)) ||
        (supplier.tipo && supplier.tipo.toLowerCase().includes(lowerTerm)) ||
        (supplier.isActive ? 'activo' : 'inactivo').includes(lowerTerm)
      )
    );
  }, [searchTerm, suppliers]);

  // Paginación
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);

  // Resetear página al cambiar el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Crear proveedor
  const handleCreateSupplier = async (newSupplier) => {
    try {
      // Limpiar el teléfono para que solo tenga + y números
      const cleanedSupplier = {
        ...newSupplier,
        telefono: newSupplier.telefono.replace(/-/g, '')
      };
      const createdSupplier = await suppliersService.create(cleanedSupplier);
      setSuppliers(prev => [...prev, createdSupplier]);
      toast.success('Proveedor creado exitosamente', { position: 'top-right' });
    } catch (error) {
      toast.error(error.message || 'Error al crear el proveedor', { 
        position: 'top-right' 
      });
    }
  };

  // Editar proveedor
  const handleEditSupplier = async (updatedSupplier) => {
    try {
      const updated = await suppliersService.update(updatedSupplier.id, updatedSupplier);
      setSuppliers(prev => 
        prev.map(s => s.id === updated.id ? updated : s)
      );
      // Cerrar el modal y limpiar el estado
      setShowEditModal(false);
      setSelectedSupplier(null);
      toast.success('Proveedor actualizado exitosamente', { position: 'top-right' });
    } catch (error) {
      toast.error(error.message || 'Error al actualizar el proveedor', { 
        position: 'top-right' 
      });
    }
  };

  // Eliminar proveedor
  const handleDeleteSupplier = async (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar el proveedor "${supplier?.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await suppliersService.delete(supplierId);
        setSuppliers(prev => prev.filter(s => s.id !== supplierId));
        toast.success('Proveedor eliminado exitosamente', { position: 'top-right' });
      } catch (error) {
        toast.error(error.message || 'Error al eliminar el proveedor', { 
          position: 'top-right' 
        });
      }
    }
  };

  // Cambiar estado del proveedor
  const handleStatusChange = async (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    const newStatus = !supplier.isActive;
    
    const result = await Swal.fire({
      title: '¿Confirmar cambio de estado?',
      text: `¿Estás seguro de que deseas cambiar el estado de "${supplier?.nombre}" a ${newStatus ? 'Activo' : 'Inactivo'}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const updated = await suppliersService.toggleStatus(supplierId, newStatus);
        setSuppliers(prev => 
          prev.map(s => s.id === updated.id ? updated : s)
        );
        setSelectedSupplier(null);
        toast.success(`Estado cambiado a ${newStatus ? 'Activo' : 'Inactivo'}`, { 
          position: 'top-right' 
        });
      } catch (error) {
        toast.error(error.message || 'Error al cambiar el estado', { 
          position: 'top-right' 
        });
      }
    }
  };

  const closeModals = () => {
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedSupplier(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen font-inter flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-text-main mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Search 
                searchTerm={searchTerm} 
                handleSearch={handleSearch} 
                placeholder="Buscar proveedores..." 
              />
              <CreateSupplier 
                onCreate={handleCreateSupplier} 
                suppliers={suppliers} 
              />
            </div>
            
            {filteredSuppliers.length === 0 ? (
              <div className="text-center py-12">
                <i className="bi bi-inbox text-6xl text-gray-300"></i>
                <p className="mt-4 text-gray-500">
                  {searchTerm 
                    ? 'No se encontraron proveedores que coincidan con tu búsqueda' 
                    : 'No hay proveedores registrados'}
                </p>
              </div>
            ) : (
              <>
                <SuppliersTable
                  suppliers={paginatedSuppliers}
                  onEdit={(supplier) => {
                    setSelectedSupplier(supplier);
                    setShowEditModal(true);
                  }}
                  onDelete={handleDeleteSupplier}
                  onView={(supplier) => {
                    setSelectedSupplier(supplier);
                    setShowDetailModal(true);
                  }}
                  onStatusChange={handleStatusChange}
                />
                {totalPages > 1 && (
                  <Paginator
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      {showEditModal && selectedSupplier && (
        <EditSupplier
          supplier={selectedSupplier}
          isOpen={showEditModal}
          onClose={closeModals}
          onSave={handleEditSupplier}
          suppliers={suppliers}
        />
      )}
      {showDetailModal && selectedSupplier && (
        <SupplierDetail
          supplier={selectedSupplier}
          onClose={closeModals}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default SuppliersPage;