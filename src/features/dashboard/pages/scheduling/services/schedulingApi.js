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
      fecha: item.fecha_inicio ?? item.fecha ?? item.date ?? "",
      hora_entrada: item.hora_inicio ?? item.hora_entrada ?? item.horaEntrada ?? item.startTime ?? "",
      hora_salida: item.hora_fin ?? item.hora_salida ?? item.horaSalida ?? item.endTime ?? "",
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
      fecha: item.fecha_inicio ?? item.fecha ?? item.date ?? "",
      hora_entrada: item.hora_inicio ?? item.hora_entrada ?? item.horaEntrada ?? item.startTime ?? "",
      hora_salida: item.hora_fin ?? item.hora_salida ?? item.horaSalida ?? item.endTime ?? "",
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
      fecha: item.fecha_inicio ?? item.fecha ?? item.date ?? "",
      hora_entrada: item.hora_inicio ?? item.hora_entrada ?? item.horaEntrada ?? item.startTime ?? "",
      hora_salida: item.hora_fin ?? item.hora_salida ?? item.horaSalida ?? item.endTime ?? "",
      createdAt: item.createdAt ?? item.fecha_creacion ?? new Date().toISOString(),
      updatedAt: item.updatedAt ?? item.fecha_actualizacion ?? new Date().toISOString(),
    };
  } catch (error) {
    console.error("[API] getSchedulingById ERROR:", error?.message);
    return null;
  }
};

// Buscar programaciones
export const searchSchedulings = async (query) => {
  try {
    const res = await axios.get(`${BASE}/search`, {
      params: { q: query },
      timeout: 12000
    });
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
      fecha: item.fecha_inicio ?? item.fecha ?? item.date ?? "",
      hora_entrada: item.hora_inicio ?? item.hora_entrada ?? item.horaEntrada ?? item.startTime ?? "",
      hora_salida: item.hora_fin ?? item.hora_salida ?? item.horaSalida ?? item.endTime ?? "",
      createdAt: item.createdAt ?? item.fecha_creacion ?? new Date().toISOString(),
      updatedAt: item.updatedAt ?? item.fecha_actualizacion ?? new Date().toISOString(),
    }));
  } catch (error) {
    console.error("[API] searchSchedulings ERROR:", error?.message);
    return [];
  }
};

// Crear nueva programación
export const createScheduling = async (scheduling) => {
  // El backend solo requiere estos 4 campos según el modelo Sequelize
  const payload = {
    id_usuario: parseInt(scheduling.id_usuario ?? scheduling.idUsuario ?? scheduling.userId ?? scheduling.employeeId),
    fecha_inicio: scheduling.fecha_inicio ?? scheduling.fechaInicio ?? scheduling.fecha ?? scheduling.startDate,
    hora_entrada: scheduling.hora_entrada ?? scheduling.horaInicio ?? scheduling.hora_inicio ?? scheduling.startTime,
    hora_salida: scheduling.hora_salida ?? scheduling.horaFin ?? scheduling.hora_fin ?? scheduling.endTime,
  };

  // Validar que todos los campos requeridos estén presentes
  if (!payload.id_usuario || !payload.fecha_inicio || !payload.hora_entrada || !payload.hora_salida) {
    console.error("[API] Missing required fields:", payload);
    throw new Error("Faltan campos obligatorios: id_usuario, fecha_inicio, hora_entrada, hora_salida");
  }

  console.log("[API] createScheduling called with:", JSON.stringify(scheduling, null, 2));
  console.log("[API] Final payload being sent:", JSON.stringify(payload, null, 2));

  try {
    const res = await axios.post(BASE, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 12000
    });
    console.log("[API] POST Scheduling response ->", res.status, JSON.stringify(res.data, null, 2));

    const created = res.data;
    // Normalizar respuesta
    return {
      id: created.id_programacion ?? created.id ?? created.idProgramacion ?? created.ID,
      id_usuario: created.id_usuario ?? created.idUsuario ?? payload.id_usuario,
      fecha: created.fecha_inicio ?? created.fecha ?? payload.fecha_inicio,
      hora_entrada: created.hora_entrada ?? created.hora_inicio ?? payload.hora_entrada,
      hora_salida: created.hora_salida ?? created.hora_fin ?? payload.hora_salida,
    };
  } catch (err) {
    console.error("[API] createScheduling ERROR:");
    console.error("Status:", err.response?.status);
    console.error("Data:", JSON.stringify(err.response?.data, null, 2));
    console.error("Message:", err.message);
    console.error("Request payload was:", JSON.stringify(payload, null, 2));
    throw err;
  }
};

// Actualizar programación
export const updateScheduling = async (id, scheduling) => {
  // El backend solo acepta estos 4 campos según el modelo Sequelize
  const payload = {
    id_usuario: parseInt(scheduling.id_usuario ?? scheduling.idUsuario ?? scheduling.userId ?? scheduling.employeeId),
    fecha_inicio: scheduling.fecha ?? scheduling.fecha_inicio ?? scheduling.fechaInicio ?? scheduling.date,
    hora_entrada: scheduling.hora_entrada ?? scheduling.horaEntrada ?? scheduling.startTime,
    hora_salida: scheduling.hora_salida ?? scheduling.horaSalida ?? scheduling.endTime,
  };

  // Validar que todos los campos requeridos estén presentes
  if (!payload.id_usuario || !payload.fecha_inicio || !payload.hora_entrada || !payload.hora_salida) {
    console.error("[API] Missing required fields for update:", payload);
    throw new Error("Faltan campos obligatorios para actualizar");
  }

  try {
    console.log("[API] PUT Scheduling payload ->", JSON.stringify(payload, null, 2));
    const res = await axios.put(`${BASE}/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 12000
    });
    console.log("[API] PUT Scheduling response ->", res.status, JSON.stringify(res.data, null, 2));

    const updated = res.data;
    return {
      id: updated.id_programacion ?? updated.id ?? id,
      id_usuario: updated.id_usuario ?? updated.idUsuario ?? payload.id_usuario,
      fecha: updated.fecha_inicio ?? updated.fecha ?? payload.fecha_inicio,
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