import axios from "axios";

const BASE = "https://capex-back.onrender.com/api/scheduling";

// Obtener todas las programaciones
export const getAllSchedulings = async () => {
  try {
    const res = await axios.get(BASE, { timeout: 12000 });
    console.log("[Employees-SchedulingAPI] getAllSchedulings RAW:", res.data);
    
    const raw = res?.data;

    let list = [];
    if (Array.isArray(raw)) {
      list = raw;
    } else if (raw?.data && Array.isArray(raw.data)) {
      list = raw.data;
    } else if (raw?.results && Array.isArray(raw.results)) {
      list = raw.results;
    }

    return list.map((item) => ({
      id: item.id_programacion ?? item.id,
      id_usuario: item.id_usuario,
      fecha: item.fecha_inicio,
      hora_entrada: item.hora_entrada,
      hora_salida: item.hora_salida,
      // Campos adicionales para compatibilidad con components
      fechaInicio: item.fecha_inicio,
      fechaFin: item.fecha_inicio,
      horaInicio: item.hora_entrada,
      horaFin: item.hora_salida,
      dias: [],
      repeticion: 'No se repite',
      empleadoId: item.id_usuario,
      createdAt: item.createdAt ?? new Date().toISOString(),
      updatedAt: item.updatedAt ?? new Date().toISOString(),
    }));
  } catch (error) {
    console.error("[Employees-SchedulingAPI] getAllSchedulings ERROR:", error?.message);
    return [];
  }
};

// Obtener programaciones por usuario
export const getSchedulingsByUser = async (userId) => {
  try {
    console.log("[Employees-SchedulingAPI] getSchedulingsByUser for userId:", userId);
    const res = await axios.get(`${BASE}/usuario/${userId}`, { timeout: 12000 });
    const raw = res?.data;

    let list = [];
    if (Array.isArray(raw)) {
      list = raw;
    } else if (raw?.data && Array.isArray(raw.data)) {
      list = raw.data;
    } else if (raw?.results && Array.isArray(raw.results)) {
      list = raw.results;
    }

    console.log("[Employees-SchedulingAPI] getSchedulingsByUser list:", list);

    return list.map((item) => ({
      id: item.id_programacion ?? item.id,
      id_usuario: item.id_usuario,
      fecha: item.fecha_inicio,
      hora_entrada: item.hora_entrada,
      hora_salida: item.hora_salida,
      fechaInicio: item.fecha_inicio,
      fechaFin: item.fecha_inicio,
      horaInicio: item.hora_entrada,
      horaFin: item.hora_salida,
      dias: [],
      repeticion: 'No se repite',
      empleadoId: item.id_usuario,
    }));
  } catch (error) {
    console.error("[Employees-SchedulingAPI] getSchedulingsByUser ERROR:", error?.message);
    return [];
  }
};

// Obtener programación por ID
export const getSchedulingById = async (id) => {
  try {
    const res = await axios.get(`${BASE}/${id}`, { timeout: 12000 });
    const item = res?.data;

    if (!item) return null;

    return {
      id: item.id_programacion ?? item.id,
      id_usuario: item.id_usuario,
      fecha: item.fecha_inicio,
      hora_entrada: item.hora_entrada,
      hora_salida: item.hora_salida,
      fechaInicio: item.fecha_inicio,
      fechaFin: item.fecha_inicio,
      horaInicio: item.hora_entrada,
      horaFin: item.hora_salida,
      dias: [],
      repeticion: 'No se repite',
      empleadoId: item.id_usuario,
    };
  } catch (error) {
    console.error("[Employees-SchedulingAPI] getSchedulingById ERROR:", error?.message);
    return null;
  }
};

// Crear nueva programación
export const createScheduling = async (scheduling) => {
  console.log("[Employees-SchedulingAPI] createScheduling input:", scheduling);

  // IMPORTANTE: El orden importa - buscar fecha_inicio PRIMERO
  const payload = {
    id_usuario: parseInt(scheduling.id_usuario ?? scheduling.empleadoId),
    fecha_inicio: scheduling.fecha_inicio ?? scheduling.fechaInicio ?? scheduling.fecha,
    hora_entrada: scheduling.hora_entrada ?? scheduling.horaInicio,
    hora_salida: scheduling.hora_salida ?? scheduling.horaFin,
  };

  // Validar que todos los campos estén presentes
  if (!payload.id_usuario || !payload.fecha_inicio || !payload.hora_entrada || !payload.hora_salida) {
    console.error("[Employees-SchedulingAPI] Missing required fields:", payload);
    throw new Error("Faltan campos obligatorios: id_usuario, fecha_inicio, hora_entrada, hora_salida");
  }

  console.log("[Employees-SchedulingAPI] createScheduling payload:", payload);

  try {
    const res = await axios.post(BASE, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 12000
    });
    
    console.log("[Employees-SchedulingAPI] createScheduling response:", res.data);

    const created = res.data;
    return {
      id: created.id_programacion ?? created.id,
      id_usuario: created.id_usuario ?? payload.id_usuario,
      fecha: created.fecha_inicio ?? payload.fecha_inicio,
      hora_entrada: created.hora_entrada ?? payload.hora_entrada,
      hora_salida: created.hora_salida ?? payload.hora_salida,
      fechaInicio: created.fecha_inicio ?? payload.fecha_inicio,
      fechaFin: created.fecha_inicio ?? payload.fecha_inicio,
      horaInicio: created.hora_entrada ?? payload.hora_entrada,
      horaFin: created.hora_salida ?? payload.hora_salida,
      dias: [],
      repeticion: 'No se repite',
      empleadoId: created.id_usuario ?? payload.id_usuario,
    };
  } catch (err) {
    console.error("[Employees-SchedulingAPI] createScheduling ERROR:", err.response?.status);
    console.error("[Employees-SchedulingAPI] Error data:", err.response?.data);
    console.error("[Employees-SchedulingAPI] Error message:", err.message);
    throw err;
  }
};

// Actualizar programación
export const updateScheduling = async (id, scheduling) => {
  console.log("[Employees-SchedulingAPI] updateScheduling input:", { id, scheduling });

  const payload = {
    id_usuario: parseInt(scheduling.id_usuario ?? scheduling.empleadoId),
    fecha_inicio: scheduling.fecha_inicio ?? scheduling.fechaInicio ?? scheduling.fecha,
    hora_entrada: scheduling.hora_entrada ?? scheduling.horaInicio,
    hora_salida: scheduling.hora_salida ?? scheduling.horaFin,
  };

  // Validar campos
  if (!payload.id_usuario || !payload.fecha_inicio || !payload.hora_entrada || !payload.hora_salida) {
    console.error("[Employees-SchedulingAPI] Missing required fields:", payload);
    throw new Error("Faltan campos obligatorios para actualizar");
  }

  console.log("[Employees-SchedulingAPI] updateScheduling payload:", payload);

  try {
    const res = await axios.put(`${BASE}/${id}`, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 12000
    });
    
    console.log("[Employees-SchedulingAPI] updateScheduling response:", res.data);

    const updated = res.data;
    return {
      id: updated.id_programacion ?? updated.id ?? id,
      id_usuario: updated.id_usuario ?? payload.id_usuario,
      fecha: updated.fecha_inicio ?? payload.fecha_inicio,
      hora_entrada: updated.hora_entrada ?? payload.hora_entrada,
      hora_salida: updated.hora_salida ?? payload.hora_salida,
      fechaInicio: updated.fecha_inicio ?? payload.fecha_inicio,
      fechaFin: updated.fecha_inicio ?? payload.fecha_inicio,
      horaInicio: updated.hora_entrada ?? payload.hora_entrada,
      horaFin: updated.hora_salida ?? payload.hora_salida,
      dias: [],
      repeticion: 'No se repite',
      empleadoId: updated.id_usuario ?? payload.id_usuario,
    };
  } catch (err) {
    console.error("[Employees-SchedulingAPI] updateScheduling ERROR:", err.response?.status);
    console.error("[Employees-SchedulingAPI] Error data:", err.response?.data);
    console.error("[Employees-SchedulingAPI] Error message:", err.message);
    throw err;
  }
};

// Eliminar programación
export const deleteScheduling = async (id) => {
  try {
    console.log("[Employees-SchedulingAPI] deleteScheduling ID:", id);
    const res = await axios.delete(`${BASE}/${id}`, { timeout: 12000 });
    console.log("[Employees-SchedulingAPI] deleteScheduling response:", res.data);
    return res.data;
  } catch (err) {
    console.error("[Employees-SchedulingAPI] deleteScheduling ERROR:", err.response?.status);
    console.error("[Employees-SchedulingAPI] Error data:", err.response?.data);
    console.error("[Employees-SchedulingAPI] Error message:", err.message);
    throw err;
  }
};