import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { validateServiceForm, validateServiceName, validateServiceDescription, validateServiceDuration, validateServicePrice } from "../../../../../shared/validations";

const EditServices = ({ onClose, service, onEdit, categories = [], services = [] }) => {
    const activeCategories = categories.filter(cat => cat.isActive);
    const [formData, setFormData] = useState({
        id: service?.id || null,
        Servicio: service?.name || "",
        Categoria: service?.category || activeCategories[0]?.name || "",
        Descripcion: service?.description || "",
        duracion: service?.duration ? service.duration.replace(" min", "") : "",
        precio: service?.price ? service.price.replace(/[^\d]/g, "") : "",
        estado: service?.estado || "Activo",
        imagen: service?.imagen || null
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData({
            id: service?.id || null,
            Servicio: service?.name || "",
            Categoria: service?.category || activeCategories[0]?.name || "",
            Descripcion: service?.description || "",
            duracion: service?.duration ? service.duration.replace(" min", "") : "",
            precio: service?.price ? service.price.replace(/[^\d]/g, "") : "",
            estado: service?.estado || "Activo",
            imagen: service?.imagen || null
        });
        setErrors({}); // Limpiar errores al cambiar de servicio
        // eslint-disable-next-line
    }, [service, categories]);

    const handleKeyDown = (e) => {
        // Prevenir cualquier letra en campos numéricos
        if (e.target.name === 'duracion' || e.target.name === 'precio') {
            // Permitir solo números, backspace, delete, tab, escape, enter
            const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
            const isNumber = /^[0-9]$/.test(e.key);
            
            if (!isNumber && !allowedKeys.includes(e.key)) {
                e.preventDefault();
            }
        }
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        
        // Para campos numéricos, solo permitir números
        if (name === 'duracion' || name === 'precio') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData((prev) => ({
                ...prev,
                [name]: numericValue
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === "file" ? files[0] : value
            }));
        }
        
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        let error = '';
        
        switch (name) {
            case 'Servicio':
                const servicioErrors = validateServiceName(value, services, service);
                error = servicioErrors.servicio || '';
                break;
            case 'Descripcion':
                const descripcionErrors = validateServiceDescription(value);
                error = descripcionErrors.descripcion || '';
                break;
            case 'duracion':
                const duracionErrors = validateServiceDuration(value);
                error = duracionErrors.duracion || '';
                break;
            case 'precio':
                const precioErrors = validateServicePrice(value);
                error = precioErrors.precio || '';
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
        
        const formErrors = validateServiceForm(formData, services, service);
        setErrors(formErrors);
        
        if (Object.keys(formErrors).length === 0) {
            const updatedService = {
                id: formData.id,
                name: formData.Servicio,
                Categoria: formData.Categoria,
                Descripcion: formData.Descripcion,
                duracion: formData.duracion,
                precio: formData.precio,
                estado: formData.estado,
                imagen: formData.imagen
            };
            
            onEdit(updatedService);
            setFormData({
                id: null,
                Servicio: "",
                Categoria: activeCategories[0]?.name || "",
                Descripcion: "",
                duracion: "",
                precio: "",
                estado: "Activo",
                imagen: null
            });
            setErrors({});
            
            // Mostrar alerta de éxito
            toast.success('Servicio actualizado exitosamente!', {
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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
                {/* Header fijo */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
                    <h2 className="text-xl font-bold text-primary m-0">Editar Servicio</h2>
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
                    <form id="edit-service-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-text-main mb-1">Servicio <span className='text-red-500'>*</span></label>
                                <input
                                    type="text"
                                    name="Servicio"
                                    value={formData.Servicio}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onKeyDown={handleKeyDown}
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
                                    value={formData.Categoria}
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
                                    value={formData.Descripcion}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
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
                                    type="text"
                                    name="duracion"
                                    value={formData.duracion}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onKeyDown={handleKeyDown}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                                        errors.duracion ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                    placeholder="Ej: 60"
                                />
                                {errors.duracion && <p className="text-red-500 text-xs mt-1">{errors.duracion}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-main mb-1">Precio <span className='text-red-500'>*</span></label>
                                <input
                                    type="text"
                                    name="precio"
                                    value={formData.precio}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onKeyDown={handleKeyDown}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                                        errors.precio ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                    placeholder="Ej: 50000"
                                />
                                {errors.precio && <p className="text-red-500 text-xs mt-1">{errors.precio}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-main mb-1">Estado <span className='text-red-500'>*</span></label>
                                <select
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                                        errors.estado ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                                {errors.estado && <p className="text-red-500 text-xs mt-1">{errors.estado}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-text-main mb-1">Imagen</label>
                                {formData.imagen && (
                                    <div className="mb-3">
                                        <label className="block text-xs font-medium text-text-main/80 mb-1">Imagen actual:</label>
                                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-text-main text-sm bg-gray-50">
                                            {formData.imagen instanceof File ? formData.imagen.name : 'Imagen cargada'}
                                        </div>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    name="imagen"
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm"
                                />
                                <p className="text-xs text-text-main/60 mt-1">Deja vacío para mantener la imagen actual</p>
                            </div>
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
                        form="edit-service-form"
                        className="px-4 py-2 rounded-md font-semibold transition ml-2 text-sm bg-text-main text-white hover:bg-primary-dark"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditServices
