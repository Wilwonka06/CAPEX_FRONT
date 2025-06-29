import React, { useState, useEffect } from "react";

const EditCatServices = ({ onClose, category, onEdit }) => {
    const [form, setForm] = useState({
        id: category?.id || null,
        Categoria: category?.name || "",
        Descripcion: category?.description || "",
        estado: category?.isActive ? "Activo" : "Inactivo"
    });

    useEffect(() => {
        setForm({
            id: category?.id || null,
            Categoria: category?.name || "",
            Descripcion: category?.description || "",
            estado: category?.isActive ? "Activo" : "Inactivo"
        });
    }, [category]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onEdit({
            id: form.id,
            name: form.Categoria,
            description: form.Descripcion,
            estado: form.estado
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-0 relative border border-accent">
                
                {/* Encabezado con ícono */}
                <div className="flex flex-col items-center pt-8 pb-2">
                    <div className="bg-primary flex items-center justify-center rounded-full w-16 h-16 mb-2">
                        <i className="bi bi-tags text-white text-3xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-primary-dark mb-2 text-center">Editar Categoría</h2>
                </div>
                {/* Formulario en una columna */}
                <form className="px-8 pb-8" onSubmit={handleSubmit}>
                    <div className="space-y-6 mb-4">
                        <div>
                            <label htmlFor="categoria" className="block text-sm font-medium text-text-main mb-1">Categoría</label>
                            <input
                                type="text"
                                name="Categoria"
                                id="categoria"
                                value={form.Categoria}
                                onChange={handleChange}
                                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="descripcion" className="block text-sm font-medium text-text-main mb-1">Descripción</label>
                            <input
                                type="text"
                                name="Descripcion"
                                id="descripcion"
                                value={form.Descripcion}
                                onChange={handleChange}
                                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="estado" className="block text-sm font-medium text-text-main mb-1">Estado</label>
                            <select
                                name="estado"
                                id="estado"
                                value={form.estado}
                                onChange={handleChange}
                                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                            >
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-100 text-gray-600 px-6 py-2 rounded font-semibold hover:bg-gray-200 transition"
                        >
                            Cerrar
                        </button>
                        <button
                            type="submit"
                            className="bg-primary-dark text-white px-6 py-2 rounded font-semibold hover:bg-primary transition"
                        >
                            Aceptar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditCatServices
