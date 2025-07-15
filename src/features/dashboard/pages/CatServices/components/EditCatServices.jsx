import React, { useState, useEffect } from "react";

const EditCatServices = ({ onClose, category, onEdit, existingCategories = [] }) => {
    const [form, setForm] = useState({
        id: category?.id || null,
        Categoria: category?.name || "",
        Descripcion: category?.description || "",
        estado: category?.isActive ? "Activo" : "Inactivo"
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setForm({
            id: category?.id || null,
            Categoria: category?.name || "",
            Descripcion: category?.description || "",
            estado: category?.isActive ? "Activo" : "Inactivo"
        });
        setErrors({}); // Limpiar errores al cambiar de categoría
    }, [category]);

    // Función para normalizar texto (remover tildes)
    const normalizeText = (text) => {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    };

    const validate = () => {
        const newErrors = {};
        
        if (!form.Categoria.trim()) {
            newErrors.Categoria = 'La categoría es obligatoria';
        } else {
            // Verificar si ya existe una categoría con el mismo nombre (ignorando mayúsculas y tildes)
            // Excluir la categoría actual que se está editando
            const normalizedNewName = normalizeText(form.Categoria.trim());
            const categoryExists = existingCategories.some(existingCategory => 
                existingCategory.id !== form.id && // No comparar con la categoría actual
                normalizeText(existingCategory.name) === normalizedNewName
            );
            
            if (categoryExists) {
                newErrors.Categoria = 'Ya existe una categoría con este nombre';
            }
        }
        
        if (!form.Descripcion.trim()) {
            newErrors.Descripcion = 'La descripción es obligatoria';
        }
        
        if (!form.estado) {
            newErrors.estado = 'El estado es obligatorio';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
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
                            <label htmlFor="categoria" className="block text-sm font-medium text-text-main mb-1">Categoría <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="Categoria"
                                id="categoria"
                                value={form.Categoria}
                                onChange={handleChange}
                                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                                required
                            />
                            {errors.Categoria && <p className="text-red-500 text-xs mt-1">{errors.Categoria}</p>}
                        </div>
                        <div>
                            <label htmlFor="descripcion" className="block text-sm font-medium text-text-main mb-1">Descripción <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="Descripcion"
                                id="descripcion"
                                value={form.Descripcion}
                                onChange={handleChange}
                                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                                required
                            />
                            {errors.Descripcion && <p className="text-red-500 text-xs mt-1">{errors.Descripcion}</p>}
                        </div>
                        <div>
                            <label htmlFor="estado" className="block text-sm font-medium text-text-main mb-1">Estado <span className="text-red-500">*</span></label>
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
                            {errors.estado && <p className="text-red-500 text-xs mt-1">{errors.estado}</p>}
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
