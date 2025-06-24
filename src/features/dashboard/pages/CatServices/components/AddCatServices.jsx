
import React, { useState } from "react";


const AddCatServices = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Añadir Categoria</h2>
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
                    <form action="#" method="post" className="space-y-4">
                        <div>
                            <label htmlFor="categoria" className="block text-sm font-medium text-text-main mb-1">Categoría</label>
                            <input
                                type="text"
                                name="Categoria"
                                id="categoria"
                                className="w-full border border-primary-dark px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label htmlFor="descripcion" className="block text-sm font-medium text-text-main mb-1">Descripción</label>
                            <input
                                type="text"
                                name="Descripcion"
                                id="descripcion"
                                className="w-full border border-primary-dark px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label htmlFor="estado" className="block text-sm font-medium text-text-main mb-1">Estado</label>
                            <select
                                name="estado"
                                id="estado"
                                className="w-full border border-primary-dark px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary" disable
                            >
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>
                    </form>
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            onClick={onClose}
                            className="bg-primary-dark text-white px-4 py-2 rounded hover:bg-primary transition"
                        >
                            Aceptar
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-primary-dark text-white px-4 py-2 rounded hover:bg-primary transition"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AddCatServices
