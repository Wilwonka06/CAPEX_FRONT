import React, { useState } from "react";

const AddServices = ({ onClose, onAdd }) => {
    const [form, setForm] = useState({
        Servicio: "",
        Categoria: "",
        Descripcion: "",
        duracion: "",
        precio: "",
        estado: "Activo",
        imagen: null
    });

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "file" ? files[0] : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            name: form.Servicio,
            category: form.Categoria,
            description: form.Descripcion,
            duration: form.duracion + " min",
            price: form.precio ? "$" + Number(form.precio).toLocaleString() : "",
            estado: form.estado,
            imagen: form.imagen
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-0 relative border border-accent">
                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-primary-dark hover:text-primary text-2xl font-bold focus:outline-none"
                    title="Cerrar"
                >
                    ×
                </button>
                {/* Encabezado con ícono */}
                <div className="flex flex-col items-center pt-8 pb-2">
                    <div className="bg-primary flex items-center justify-center rounded-full w-16 h-16 mb-2">
                        <i className="bi bi-scissors text-white text-3xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-primary-dark mb-2 text-center">Añadir Servicio</h2>
                </div>
                {/* Formulario en dos columnas */}
                <form className="px-8 pb-8" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <label htmlFor="servicio" className="block text-sm font-medium text-text-main mb-1">Servicio</label>
                            <input
                                type="text"
                                name="Servicio"
                                id="Servicio"
                                value={form.Servicio}
                                onChange={handleChange}
                                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                                required
                            />
                        </div>
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
                            <label htmlFor="duracion" className="block text-sm font-medium text-text-main mb-1">Duración (min)</label>
                            <input
                                type="number"
                                name="duracion"
                                id="duracion"
                                value={form.duracion}
                                onChange={handleChange}
                                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="precio" className="block text-sm font-medium text-text-main mb-1">Precio</label>
                            <input
                                type="number"
                                name="precio"
                                id="precio"
                                value={form.precio}
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
                        <div className="md:col-span-2">
                            <label htmlFor="imagen" className="block text-sm font-medium text-text-main mb-1">
                                Imagen
                            </label>
                            <input
                                type="file"
                                id="imagen"
                                name="imagen"
                                onChange={handleChange}
                                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                            />
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

export default AddServices
