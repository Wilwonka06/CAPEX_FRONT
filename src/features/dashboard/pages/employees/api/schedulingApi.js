import axios from "axios";

const BASE = "https://capex-back.onrender.com/api/scheduling";

// Obtener todas las programaciones
export const getAllSchedulings = async () => {
  try {
    const res = await axios.get(BASE, { timeout: 12000 });
    const raw = res?.data;

    // Normalización defensiva de la respuesta
    let list = [];
    if (Array.isArray(raw)) {
      list = raw;
    } else if (raw?.data && Array.isArray(raw.data)) {
      list = raw.data;
    } else if (raw?.results && Array.isArray(raw.results)) {
      list = raw.results;
    }

    // Asegurar campos esperados por la UI
    return list.map((item) => ({
      id: item.id_programacion ?? item.id ?? item.idProgramacion ?? item.ID,
      id_usuario: item.id_usuario ?? item.idUsuario ?? item.userId ?? item.employeeId,
      fecha: item.fecha ?? item.date ?? "",
      hora_entrada: item.hora_entrada ?? item.horaEntrada ?? item.startTime ?? "",
      hora_salida: item.hora_salida ?? item.horaSalida ?? item.endTime ?? "",
      createdAt: item.createdAt ?? item.fecha_creacion ?? new Date().toISOString(),
      updatedAt: item.updatedAt ?? item.fecha_actualizacion ?? new Date().toISOString(),
    }));
  } catch (error) {
    console.error("[API] getAllSchedulings ERROR:", error?.message);
    // Fallback vacío para que no quede colgado el loading
    return [];
  }
};

// Obtener programaciones por usuario
export const getSchedulingsByUser = async (userId) => {
  try {
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

    return list.map((item) => ({
      id: item.id_programacion ?? item.id ?? item.idProgramacion ?? item.ID,
      id_usuario: item.id_usuario ?? item.idUsuario ?? item.userId ?? item.employeeId,
      fecha: item.fecha ?? item.date ?? "",
      hora_entrada: item.hora_entrada ?? item.horaEntrada ?? item.startTime ?? "",
      hora_salida: item.hora_salida ?? item.horaSalida ?? item.endTime ?? "",
      createdAt: item.createdAt ?? item.fecha_creacion ?? new Date().toISOString(),
      updatedAt: item.updatedAt ?? item.fecha_actualizacion ?? new Date().toISOString(),
    }));
  } catch (error) {
    console.error("[API] getSchedulingsByUser ERROR:", error?.message);
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
      id: item.id_programacion ?? item.id ?? item.idProgramacion ?? item.ID,
      id_usuario: item.id_usuario ?? item.idUsuario ?? item.userId ?? item.employeeId,
      fecha: item.fecha ?? item.date ?? "",
      hora_entrada: item.hora_entrada ?? item.horaEntrada ?? item.startTime ?? "",
      hora_salida: item.hora_salida ?? item.horaSalida ?? item.endTime ?? "",
      createdAt: item.createdAt ?? item.fecha_creacion ?? new Date().toISOString(),
      updatedAt: item.updatedAt ?? item.fecha_actualizacion ?? new Date().toISOString(),
    };
  } catch (error) {
    console.error("[API] getSchedulingById ERROR:", error?.message);
    return null;
  }
};

// Crear nueva programación
export const createScheduling = async (scheduling) => {
  const payload = {
    id_usuario: scheduling.id_usuario ?? scheduling.idUsuario ?? scheduling.userId ?? scheduling.employeeId,
    fecha: scheduling.fecha ?? scheduling.date,
    hora_entrada: scheduling.hora_entrada ?? scheduling.horaEntrada ?? scheduling.startTime,
    hora_salida: scheduling.hora_salida ?? scheduling.horaSalida ?? scheduling.endTime,
  };

  try {
    console.log("[API] POST Scheduling payload ->", payload);
    const res = await axios.post(BASE, payload);
    console.log("[API] POST Scheduling response ->", res.status, res.data);

    const created = res.data;
    // Normalizar respuesta
    return {
      id: created.id_programacion ?? created.id ?? created.idProgramacion ?? created.ID,
      id_usuario: created.id_usuario ?? created.idUsuario ?? payload.id_usuario,
      fecha: created.fecha ?? created.date ?? payload.fecha,
      hora_entrada: created.hora_entrada ?? created.horaEntrada ?? payload.hora_entrada,
      hora_salida: created.hora_salida ?? created.horaSalida ?? payload.hora_salida,
    };
  } catch (err) {
    console.error(
      "[API] createScheduling ERROR:",
      err.response?.status,
      err.response?.data || err.message
    );
    throw err;
  }
};

// Actualizar programación
export const updateScheduling = async (id, scheduling) => {
  const payload = {
    id_usuario: scheduling.id_usuario ?? scheduling.idUsuario ?? scheduling.userId ?? scheduling.employeeId,
    fecha: scheduling.fecha ?? scheduling.date,
    hora_entrada: scheduling.hora_entrada ?? scheduling.horaEntrada ?? scheduling.startTime,
    hora_salida: scheduling.hora_salida ?? scheduling.horaSalida ?? scheduling.endTime,
  };

  try {
    console.log("[API] PUT Scheduling payload ->", payload);
    const res = await axios.put(`${BASE}/${id}`, payload);
    console.log("[API] PUT Scheduling response ->", res.status, res.data);

    const updated = res.data;
    return {
      id: updated.id_programacion ?? updated.id ?? id,
      id_usuario: updated.id_usuario ?? updated.idUsuario ?? payload.id_usuario,
      fecha: updated.fecha ?? updated.date ?? payload.fecha,
      hora_entrada: updated.hora_entrada ?? updated.horaEntrada ?? payload.hora_entrada,
      hora_salida: updated.hora_salida ?? updated.horaSalida ?? payload.hora_salida,
    };
  } catch (err) {
    console.error(
      "[API] updateScheduling ERROR:",
      err.response?.status,
      err.response?.data || err.message
    );
    throw err;
  }
};

// Eliminar programación
export const deleteScheduling = async (id) => {
  try {
    const res = await axios.delete(`${BASE}/${id}`);
    console.log("[API] DELETE Scheduling response ->", res.status, res.data);
    return res.data;
  } catch (err) {
    console.error(
      "[API] deleteScheduling ERROR:",
      err.response?.status,
      err.response?.data || err.message
    );
    throw err;
  }
};