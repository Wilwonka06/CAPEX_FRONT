// Servicio para manejar citas en el módulo de Venta de Servicios
import { API_CONFIG, getAuthHeaders } from '../../../../../shared/config/api.js';

const BASE_URL = API_CONFIG.BASE_URL;

/**
 * Obtiene todas las citas en estado "En ejecución" para mostrar en venta de servicios
 */
export const getCitasEnEjecucion = async () => {
  try {
    const response = await fetch(`${BASE_URL}/citas`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const citas = await response.json();
    
    // Filtrar solo las citas en estado "En ejecución"
    const citasEnEjecucion = citas.filter(cita => 
      cita.estado && cita.estado.toLowerCase() === 'en ejecucion'
    );

    // Transformar las citas al formato esperado por el componente SaleServices
    return citasEnEjecucion.map(transformarCitaAVentaServicio);
  } catch (error) {
    console.error('Error al obtener citas en ejecución:', error);
    throw new Error('Error al cargar las citas en ejecución');
  }
};

/**
 * Obtiene una cita específica por ID
 */
export const getCitaById = async (citaId) => {
  try {
    const response = await fetch(`${BASE_URL}/citas/${citaId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const cita = await response.json();
    return transformarCitaAVentaServicio(cita);
  } catch (error) {
    console.error('Error al obtener cita:', error);
    throw new Error('Error al cargar la cita');
  }
};

/**
 * Busca citas por término de búsqueda
 */
export const buscarCitas = async (termino) => {
  try {
    const response = await fetch(`${BASE_URL}/citas/buscar?q=${encodeURIComponent(termino)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const citas = await response.json();
    
    // Filtrar solo las citas en estado "En ejecución"
    const citasEnEjecucion = citas.filter(cita => 
      cita.estado && cita.estado.toLowerCase() === 'en ejecucion'
    );

    return citasEnEjecucion.map(transformarCitaAVentaServicio);
  } catch (error) {
    console.error('Error al buscar citas:', error);
    throw new Error('Error al buscar citas');
  }
};

/**
 * Inicia un servicio en una cita (cambia estado a "En ejecución")
 */
export const iniciarServicio = async (citaId) => {
  try {
    const response = await fetch(`${BASE_URL}/citas/${citaId}/iniciar-servicio`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const resultado = await response.json();
    return resultado;
  } catch (error) {
    console.error('Error al iniciar servicio:', error);
    throw new Error('Error al iniciar el servicio');
  }
};

/**
 * Actualiza el estado de una cita
 */
export const actualizarEstadoCita = async (citaId, nuevoEstado) => {
  try {
    const response = await fetch(`${BASE_URL}/citas/${citaId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ estado: nuevoEstado }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const resultado = await response.json();
    return resultado;
  } catch (error) {
    console.error('Error al actualizar estado de cita:', error);
    throw new Error('Error al actualizar el estado de la cita');
  }
};

/**
 * Transforma una cita del backend al formato esperado por SaleServices
 */
const transformarCitaAVentaServicio = (cita) => {
  // Calcular totales de servicios
  const totalServices = (cita.servicios || []).reduce((sum, servicio) => {
    return sum + (servicio.precio || 0) * (servicio.cantidad || 1);
  }, 0);

  // Calcular totales de productos (si los hay)
  const totalProducts = (cita.productos || []).reduce((sum, producto) => {
    return sum + (producto.precio || 0) * (producto.cantidad || 1);
  }, 0);

  const totalGeneral = totalServices + totalProducts;

  return {
    id: cita.id,
    clientName: cita.cliente?.nombre || cita.cliente_nombre || 'Cliente no especificado',
    status: cita.estado || 'En ejecucion',
    date: formatearFecha(cita.fecha_cita || cita.fecha),
    time: formatearHora(cita.hora_cita || cita.hora),
    dineroProporcionado: cita.dinero_proporcionado || 0,
    devolucion: Math.max(0, (cita.dinero_proporcionado || 0) - totalGeneral),
    servicios: (cita.servicios || []).map(servicio => ({
      id: servicio.id || servicio.servicio_id,
      name: servicio.nombre || servicio.servicio_nombre || 'Servicio',
      quantity: servicio.cantidad || 1,
      price: servicio.precio || 0,
      subtotal: (servicio.precio || 0) * (servicio.cantidad || 1),
      employee: {
        name: servicio.empleado?.nombre || servicio.empleado_nombre || 'Empleado no asignado'
      }
    })),
    productos: (cita.productos || []).map(producto => ({
      id: producto.id || producto.producto_id,
      name: producto.nombre || producto.producto_nombre || 'Producto',
      quantity: producto.cantidad || 1,
      price: producto.precio || 0,
      subtotal: (producto.precio || 0) * (producto.cantidad || 1)
    })),
    totalServices,
    totalProducts,
    totalGeneral,
    // Información adicional de la cita
    citaId: cita.id,
    observaciones: cita.observaciones || '',
    fechaCreacion: cita.fecha_creacion || cita.created_at
  };
};

/**
 * Formatea una fecha al formato DD/MM/YYYY
 */
const formatearFecha = (fecha) => {
  if (!fecha) return new Date().toLocaleDateString('es-ES');
  
  try {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES');
  } catch (error) {
    return new Date().toLocaleDateString('es-ES');
  }
};

/**
 * Formatea una hora al formato HH:MM AM/PM
 */
const formatearHora = (hora) => {
  if (!hora) return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  
  try {
    // Si la hora viene en formato HH:MM:SS, tomar solo HH:MM
    const timeString = hora.includes(':') ? hora.split(':').slice(0, 2).join(':') : hora;
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
};

