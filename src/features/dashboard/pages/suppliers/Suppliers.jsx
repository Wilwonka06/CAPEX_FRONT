import { useState, useEffect } from "react";
import SuppliersTable from "./components/SuppliersTable";
import CreateSupplier from "./components/CreateSupplier";
import EditSupplier from "./components/EditSupplier";
import SupplierDetail from "./components/SupplierDetail";
import Search from "../../../../shared/Search";
import Paginator from "../../../../shared/Paginator";
import LoadingTable from "../../../../shared/components/LoadingTable";
import ConfirmDeleteModal from "../../../../shared/components/ConfirmDeleteModal";
import { filterBySearch } from "../../../../shared/utils/searchHelper";
import suppliersService from "./API/suppliersService";
import toast from 'react-hot-toast';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { setTitle } = useOutletContext();

  useEffect(() => {
    setTitle('Módulo de Proveedores');
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
      toast.error(error.message || 'Error al cargar los proveedores');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar proveedores usando la función helper de búsqueda universal
  useEffect(() => {
    setFilteredSuppliers(filterBySearch(suppliers, searchTerm));
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
    const supplierPromise = (async () => {
      // Limpiar el teléfono para que solo tenga + y números
      const cleanedSupplier = {
        ...newSupplier,
        telefono: newSupplier.telefono.replace(/-/g, '')
      };
      const createdSupplier = await suppliersService.create(cleanedSupplier);
      setSuppliers(prev => [...prev, createdSupplier]);
      return createdSupplier;
    })();

    toast.promise(supplierPromise, {
      loading: 'Creando proveedor...',
      success: 'Proveedor creado exitosamente',
      error: (err) => err.response?.data?.message || err.message || 'Error al crear el proveedor',
    });

    try {
      await supplierPromise;
    } catch (error) {
      // Error ya manejado por toast.promise
    }
  };

  // Editar proveedor
  const handleEditSupplier = async (updatedSupplier) => {
    const supplierPromise = (async () => {
      const updated = await suppliersService.update(updatedSupplier.id, updatedSupplier);
      setSuppliers(prev => 
        prev.map(s => s.id === updated.id ? updated : s)
      );
      // Cerrar el modal y limpiar el estado
      setShowEditModal(false);
      setSelectedSupplier(null);
      return updated;
    })();

    toast.promise(supplierPromise, {
      loading: 'Actualizando proveedor...',
      success: 'Proveedor actualizado exitosamente',
      error: (err) => err.response?.data?.message || err.message || 'Error al actualizar el proveedor',
    });

    try {
      await supplierPromise;
    } catch (error) {
      // Error ya manejado por toast.promise
    }
  };

  // Handler para eliminar proveedor - muestra modal primero
  const handleDeleteSupplier = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setPendingDelete({ id: supplierId, supplier });
      setShowDeleteModal(true);
    }
  };

  // Handler para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    setDeletingId(pendingDelete.id);
    const supplierPromise = (async () => {
      await suppliersService.delete(pendingDelete.id);
      setSuppliers(prev => prev.filter(s => s.id !== pendingDelete.id));
      return true;
    })();

    toast.promise(supplierPromise, {
      loading: 'Eliminando proveedor...',
      success: 'Proveedor eliminado exitosamente',
      error: (err) => err.response?.data?.message || err.message || 'Error al eliminar el proveedor',
    });

    try {
      await supplierPromise;
      setShowDeleteModal(false);
      setPendingDelete(null);
    } catch (error) {
      // Error ya manejado por toast.promise
    } finally {
      setDeletingId(null);
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
      const supplierPromise = (async () => {
        const updated = await suppliersService.toggleStatus(supplierId, newStatus);
        setSuppliers(prev => 
          prev.map(s => s.id === updated.id ? updated : s)
        );
        setSelectedSupplier(null);
        return updated;
      })();

      toast.promise(supplierPromise, {
        loading: 'Cambiando estado...',
        success: `Estado cambiado a ${newStatus ? 'Activo' : 'Inactivo'}`,
        error: (err) => err.response?.data?.message || err.message || 'Error al cambiar el estado',
      });

      try {
        await supplierPromise;
      } catch (error) {
        // Error ya manejado por toast.promise
      }
    }
  };

  const closeModals = () => {
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedSupplier(null);
  };

  // Estado de carga inicial
  const isInitialLoading = loading;

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
            
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
              {filteredSuppliers.length === 0 && !isInitialLoading ? (
                <div className="text-center py-12">
                  <i className="bi bi-inbox text-6xl text-gray-300"></i>
                  <p className="mt-4 text-gray-500">
                    {searchTerm
                      ? 'No se encontraron proveedores que coincidan con tu búsqueda'
                      : 'No hay proveedores registrados'}
                  </p>
                </div>
              ) : (
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
                  loading={isInitialLoading}
                />
              )}
            </div>
            {totalPages > 1 && !isInitialLoading && (
              <Paginator
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
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

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && pendingDelete && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            if (!deletingId) {
              setShowDeleteModal(false);
              setPendingDelete(null);
            }
          }}
          onConfirm={handleConfirmDelete}
          itemName={pendingDelete.supplier.nombre}
          entityType="proveedor"
          loading={deletingId === pendingDelete.id}
        />
      )}
    </div>
  );
};

export default SuppliersPage;