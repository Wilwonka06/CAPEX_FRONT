
import AddCatServices from './components/AddCatServices'
import EditCatServices from './components/EditCatServices'
import React, { useState } from "react";


const CatServices = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="container mx-auto mt-8 px-4">
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-xl font-semibold text-text-main">Categoria de Servicios</h1>
    </div>
    <div className="flex justify-between mb-4">
      <input
        type="text"
        placeholder="Buscar categoría..."
        className="border border-primary-dark px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <button
        onClick={() => setIsAddModalOpen(true)}
        className="bg-primary-dark text-white px-4 py-2 rounded hover:bg-primary transition"
      >
        Añadir Categoria
      </button>

    </div>


    <div className="overflow-x-auto border border-background rounded-lg shadow-sm">
      <table className="min-w-full text-sm text-left border-collapse">
        <thead className="bg-primary-dark text-white">
          <tr>
            <th className="py-2 px-3 border-b border-background">Id</th>
            <th className="py-2 px-3 border-b border-background">Categoria</th>
            <th className="py-2 px-3 border-b border-background">Descripcion</th>
            <th className="py-2 px-3 border-b border-background">Estado</th>
            <th className="py-2 px-3 border-b border-background">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-background text-text-main">
          <td className="py-2 px-3 border-b border-background">1</td>
          <td className="py-2 px-3 border-b border-background">Servicio de Corte</td>
          <td className="py-2 px-3 border-b border-background">Corte de cabello para hombres y mujeres</td>
          <td className="py-2 px-3 border-b border-background text-green-600 font-medium">Activo</td>
          <td className="py-2 px-3 border-b border-background flex gap-2">
            <button onClick={() => setIsEditModalOpen(true)} className="bg-primary-dark text-white px-2 py-1 rounded hover:bg-primary transition text-sm">
              Editar
            </button>
            <button className="bg-accent text-white px-2 py-1 rounded hover:bg-accent-light transition text-sm">
              Eliminar
            </button>
          </td>

        </tbody>
      </table>
    </div>
    {isAddModalOpen && <AddCatServices onClose={() => setIsAddModalOpen(false)} />}
    {isEditModalOpen && <EditCatServices onClose={() => setIsEditModalOpen(false)} />}

  </div>
  )
}

export default CatServices