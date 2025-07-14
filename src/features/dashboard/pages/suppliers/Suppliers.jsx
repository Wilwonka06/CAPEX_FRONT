import { useState } from "react";
import SuppliersTable from "./components/SuppliersTable";
import CreateSupplier from "./components/CreateSupplier";
import SearchProduct from '../../../../shared/Search';
import Paginator from "../../../../shared/Paginator";
import { useSuppliers } from "./hooks/useSuppliers";

const SuppliersPage = () => {
  const { suppliers, addSupplier, editSupplier, deleteSupplier, toggleSupplierStatus } = useSuppliers();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Cambio de página
  const handlePageChange = (page) => setCurrentPage(page);

  // Búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Filtrado
  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.telefono.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.isActive ? 'activo' : 'inactivo').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Crear
  const handleCreateSupplier = (newSupplier) => {
    addSupplier(newSupplier);
  };

  // Editar
  const handleEditSupplier = (updatedSupplier) => {
    editSupplier(updatedSupplier);
  };

  // Eliminar
  const handleDeleteSupplier = (supplierId) => {
    deleteSupplier(supplierId);
  };

  // Cambiar estado
  const handleStatusChange = (supplierId) => {
    toggleSupplierStatus(supplierId);
  };

  // Paginación
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Gestión de Proveedores</h1>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchProduct searchTerm={searchTerm} handleSearch={handleSearch} placeholder="Buscar proveedores..." />
              <CreateSupplier onCreate={handleCreateSupplier} />
            </div>
            <SuppliersTable
              suppliers={paginatedSuppliers}
              onEdit={handleEditSupplier}
              onDelete={handleDeleteSupplier}
              onStatusChange={handleStatusChange}
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
                Mostrando {Math.min(filteredSuppliers.length, startIndex + 1)} a {Math.min(filteredSuppliers.length, startIndex + itemsPerPage)} de {filteredSuppliers.length} proveedores.
              </p> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuppliersPage;