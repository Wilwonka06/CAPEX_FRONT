import { useState } from "react";
import CategoryDetail from "./CategoryDetail";
import EditCategory from "./EditCategory";

const CategoryTable = ({ categories, onToggleStatus, onEditCategory, onDeleteCategory }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleViewDetail = (category) => {
    setSelectedCategory(category);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedCategory(null);
  };

  const handleEditFromTable = (category) => {
    setEditingCategory(category);
    setIsEditOpen(true);
  };

  const handleEditFromDetail = (updatedCategory) => {
    if (onEditCategory) {
      onEditCategory(updatedCategory);
    }
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingCategory(null);
  };

  const handleSaveEdit = (updatedCategory) => {
    if (onEditCategory) {
      onEditCategory(updatedCategory);
    }
    handleCloseEdit();
  };

  const handleDeleteFromTable = (category) => {
    if (onDeleteCategory) {
      onDeleteCategory(category.id);
    }
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 hover:bg-gray-100">
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">NOMBRE</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">DESCRIPCIÓN</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ESTADO</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="py-4 px-4 text-sm font-medium text-gray-900">{category.id}</td>
                <td className="py-4 px-4 text-sm font-medium text-gray-900">{category.name}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{category.description}</td>
                <td className="py-4 px-4 text-sm">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onToggleStatus(category.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                        category.isActive ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          category.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.isActive
                          ? ' text-gray-800'
                          : ' text-gray-600 '
                      }`}
                    >
                      {category.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm font-medium text-right">
                  <div className="flex justify-end space-x-2">
                    <button 
                      className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50 hover:border-primary rounded-md flex items-center justify-center transition-colors"
                      onClick={() => handleViewDetail(category)}
                    >
                      <i className="bi bi-eye text-primary text-sm"></i>
                    </button>
                    <button 
                      className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50 hover:border-amber-300 rounded-md flex items-center justify-center transition-colors"
                      onClick={() => handleEditFromTable(category)}
                    >
                      <i className="bi bi-pencil-square text-amber-500 text-sm"></i>
                    </button>
                    <button 
                      className="h-8 w-8 p-0 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-md flex items-center justify-center transition-colors"
                      onClick={() => handleDeleteFromTable(category)}
                    >
                      <i className="bi bi-trash text-red-500 text-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CategoryDetail 
        category={selectedCategory}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onEdit={handleEditFromDetail}
      />

      <EditCategory
        category={editingCategory}
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
      />
    </>
  );
};

export default CategoryTable;