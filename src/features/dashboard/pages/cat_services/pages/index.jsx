import React from "react";

function CatServices() {
  return (
    <div class="container mx-auto mt-8 px-4">
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-xl font-semibold">Categoria de Servicios</h1>
    <a href="#" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Añadir Categoria</a>
  </div>

  <div class="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
    <table class="min-w-full text-sm text-left border-collapse">
      <thead class="bg-gray-800 text-white">
        <tr>
          <th class="py-2 px-3 border-b border-gray-200">Id</th>
          <th class="py-2 px-3 border-b border-gray-200">Categoria</th>
          <th class="py-2 px-3 border-b border-gray-200">Descripcion</th>
          <th class="py-2 px-3 border-b border-gray-200">Estado</th>
          <th class="py-2 px-3 border-b border-gray-200">Acciones</th>
        </tr>
      </thead>
    </table>
  </div>
</div>

  );
}

export default CatServices;