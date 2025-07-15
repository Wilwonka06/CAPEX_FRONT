import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { validateCategoryForm, validateCategory, validateCategoryDescription } from "../../../../../shared/validations";

const AddCatServices = ({ onClose, onAdd, existingCategories = [] }) => {
    const [formData, setFormData] = useState({
        Categoria: "",
        Descripcion: "",
        estado: "Activo"
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        let error = '';
        
        switch (name) {
            case 'Categoria':
                const categoriaErrors = validateCategory(value, existingCategories);
                error = categoriaErrors.categoria || '';
                break;
            case 'Descripcion':
                const descripcionErrors = validateCategoryDescription(value);
                error = descripcionErrors.descripcion || '';
                break;
            default:
                break;
        }
        
        if (error) {
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formErrors = validateCategoryForm(formData, existingCategories);
        setErrors(formErrors);
        
        if (Object.keys(formErrors).length === 0) {
          const newCategory = {
            id: Date.now().toString(),
            name: formData.Categoria,
            Descripcion: formData.Descripcion,
            estado: formData.estado
          };
          
          onAdd(newCategory);
          setFormData({
            Categoria: "",
            Descripcion: "",
            estado: "Activo"
          });
          setErrors({});
          
          // Mostrar alerta de éxito
          toast.success('Categoría agregada exitosamente!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          // Cerrar el modal después de mostrar la alerta
          onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-in max-h-[90vh] flex flex-col">
                {/* Header fijo */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
                    <h2 className="text-xl font-bold text-primary m-0">Crear Nueva Categoría</h2>
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
                    <form id="create-category-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-text-main mb-1">Categoría <span className='text-red-500'>*</span></label>
                            <input
                                type="text"
                                name="Categoria"
                                value={formData.Categoria}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                                    errors.Categoria ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.Categoria && <p className="text-red-500 text-xs mt-1">{errors.Categoria}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-main mb-1">Descripción <span className='text-red-500'>*</span></label>
                            <textarea
                                name="Descripcion"
                                value={formData.Descripcion}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm resize-none ${
                                    errors.Descripcion ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                                rows={3}
                            />
                            {errors.Descripcion && <p className="text-red-500 text-xs mt-1">{errors.Descripcion}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-main mb-1">Estado <span className='text-red-500'>*</span></label>
                            <select
                                name="estado"
                                value={formData.estado}
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
                        form="create-category-form"
                        className="px-4 py-2 rounded-md font-semibold transition ml-2 text-sm bg-text-main text-white hover:bg-primary-dark"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCatServices;
