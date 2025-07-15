import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { 
  validateServiceForm, 
  validateServiceName, 
  validateServiceDescription, 
  validateServiceDuration, 
  validateServicePrice,
  isNumberInputValid
} from "../../../../../shared/validations";

const AddServices = ({ onClose, onAdd, categories = [], services = [] }) => {
    const activeCategories = categories.filter(cat => cat.isActive);
    const [formData, setFormData] = useState({
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
        setFormData(prev => ({
            ...prev,
            Categoria: activeCategories[0]?.name || ""
        }));
        // eslint-disable-next-line
    }, [categories]);

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
        } else if (type === "file") {
            // Convertir imagen a base64
            const file = files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData((prev) => ({
                        ...prev,
                        imagen: reader.result // base64
                    }));
                };
                reader.readAsDataURL(file);
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value
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
                const servicioErrors = validateServiceName(value, services);
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
        
        const formErrors = validateServiceForm(formData, services);
        setErrors(formErrors);
        
        if (Object.keys(formErrors).length === 0) {
            const newService = {
                id: Date.now().toString(),
                name: formData.Servicio,
                Categoria: formData.Categoria,
                Descripcion: formData.Descripcion,
                duracion: formData.duracion,
                precio: formData.precio,
                estado: formData.estado,
                imagen: formData.imagen // base64
            };
            
            onAdd(newService);
            setFormData({
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
            toast.success('Servicio agregado exitosamente!', {
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
                                    onKeyDown={handleKeyDown}
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
