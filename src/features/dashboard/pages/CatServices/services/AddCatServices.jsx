
import React, { useState } from "react";


const AddCatServices = ({onClose}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Añadir Categoria</h2>
        <div>
            <form action="#" method="post">
                <input type="text" name="Categoria" id="" />
                <input type="text" name="Descripcion" id="" />
                <select name="estado" id="">
                    <option value="---">Activo</option>
                    <option value="---">Inactivo</option>
                </select>
            </form>
        </div>
        <button
          onClick={onClose}
          className="bg-primary-dark text-white px-4 py-2 rounded hover:bg-primary mt-4"
        >
          Aceptar
        </button>
        <button
          onClick={onClose}
          className="bg-primary-dark text-white px-4 py-2 rounded hover:bg-primary mt-4"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}

export default AddCatServices
