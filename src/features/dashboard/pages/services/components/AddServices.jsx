import React, { useState, useEffect } from "react";

const AddServices = ({ onClose, onAdd, categories = [] }) => {
    const activeCategories = categories.filter(cat => cat.isActive);
    const [form, setForm] = useState({
        Servicio: "",
        Categoria: activeCategories[0]?.name || "",
        Descripcion: "",
        duracion: "",
        precio: "",
        estado: "Activo",
        imagen: null
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setForm(prev => ({
            ...prev,
            Categoria: activeCategories[0]?.name || ""
        }));
        // eslint-disable-next-line
    }, [categories]);

    const validate = () => {
        const newErrors = {};
        if (!form.Servicio.trim()) newErrors.Servicio = 'El nombre del servicio es obligatorio';
        if (!form.Categoria) newErrors.Categoria = 'La categoría es obligatoria';
        if (!form.Descripcion.trim()) newErrors.Descripcion = 'La descripción es obligatoria';
        if (!form.duracion || isNaN(form.duracion) || Number(form.duracion) <= 0) newErrors.duracion = 'La duración debe ser un número mayor a 0';
        if (!form.precio || isNaN(form.precio) || Number(form.precio) <= 0) newErrors.precio = 'El precio debe ser un número mayor a 0';
        if (!form.estado) newErrors.estado = 'El estado es obligatorio';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "file" ? files[0] : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
                {/* Header fijo */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
                    <h2 className="text-xl font-bold text-primary m-0">Crear Nuevo Servicio</h2>
                    <button
                        className="text-gray-400 hover:text-primary text-xl font-bold"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        ×
                    </button>
                </div>
                {/* Contenido con scroll */}
                <div className="overflow-y-auto p-8 flex-1">
                    <form id="create-service-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-text-main mb-1">Servicio <span className='text-red-500'>*</span></label>
                                <input
                                    type="text"
                                    name="Servicio"
                                    value={form.Servicio}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                                        errors.Servicio ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {errors.Servicio && <p className="text-red-500 text-xs mt-1">{errors.Servicio}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-main mb-1">Categoría <span className='text-red-500'>*</span></label>
                                <select
                                    name="Categoria"
                                    value={form.Categoria}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                                        errors.Categoria ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                >
                                    {activeCategories.length === 0 && (
                                        <option value="" disabled>No hay categorías activas</option>
                                    )}
                                    {activeCategories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.Categoria && <p className="text-red-500 text-xs mt-1">{errors.Categoria}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-main mb-1">Descripción <span className='text-red-500'>*</span></label>
                                <input
                                    type="text"
                                    name="Descripcion"
                                    value={form.Descripcion}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                                        errors.Descripcion ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {errors.Descripcion && <p className="text-red-500 text-xs mt-1">{errors.Descripcion}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-main mb-1">Duración (min) <span className='text-red-500'>*</span></label>
                                <input
                                    type="number"
                                    name="duracion"
                                    value={form.duracion}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                                        errors.duracion ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {errors.duracion && <p className="text-red-500 text-xs mt-1">{errors.duracion}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-main mb-1">Precio <span className='text-red-500'>*</span></label>
                                <input
                                    type="number"
                                    name="precio"
                                    value={form.precio}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                                        errors.precio ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {errors.precio && <p className="text-red-500 text-xs mt-1">{errors.precio}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-main mb-1">Estado <span className='text-red-500'>*</span></label>
                                <select
                                    name="estado"
                                    value={form.estado}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm bg-gray-100 cursor-not-allowed ${
                                        errors.estado ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    disabled
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                                {errors.estado && <p className="text-red-500 text-xs mt-1">{errors.estado}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-main mb-1">Imagen</label>
                            <input
                                type="file"
                                name="imagen"
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm"
                            />
                        </div>
                    </form>
                </div>
                {/* Footer fijo */}
                <div className="sticky bottom-0 bg-white rounded-b-lg flex justify-end px-8 py-4">
                    <button
                        type="button"
                        className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="create-service-form"
                        className="px-4 py-2 rounded-md font-semibold transition ml-2 text-sm bg-text-main text-white hover:bg-primary-dark"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddServices;
