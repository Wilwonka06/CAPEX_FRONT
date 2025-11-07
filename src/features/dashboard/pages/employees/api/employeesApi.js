import apiRequest from '../../../../../shared/config/apiConfig';

const BASE = "/empleados";

// Obtener todos los empleados
export const getEmployees = async () => {
  try {
    const raw = await apiRequest.get(BASE, { timeout: 12000 });

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
    return list.map((item) => {
      // Reconstruir nombre completo si viene separado
      const nombreCompleto = item.nombre || 
                            (item.primer_nombre && item.apellido 
                              ? `${item.primer_nombre} ${item.apellido}`.trim()
                              : item.primer_nombre || item.name || "");
      
      return {
        id: item.id_empleado ?? item.id_usuario ?? item.id ?? item.idEmpleado ?? item.ID,
        nombre: nombreCompleto,
        documento: item.documento ?? item.document ?? "",
        tipo_documento: item.tipo_documento ?? item.tipoDocumento ?? item.documentType ?? "",
        telefono: item.telefono ?? item.phone ?? "",
        correo: item.correo ?? item.email ?? "",
        direccion: item.direccion ?? item.address ?? "",
        estado: item.estado ?? (item.isActive === false ? "Inactivo" : "Activo"),
        createdAt: item.createdAt ?? item.fecha_creacion ?? new Date().toISOString(),
        updatedAt: item.updatedAt ?? item.fecha_actualizacion ?? new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error("[API] getEmployees ERROR:", error?.message);
    return [];
  }
};

// Obtener empleado por ID
export const getEmployeeById = async (id) => {
  try {
    if (!id) {
      throw new Error('ID del empleado es requerido');
    }

    const item = await apiRequest.get(`${BASE}/${id}`, { timeout: 12000 });

    if (!item) return null;

    return {
      id: item.id_empleado ?? item.id ?? item.idEmpleado ?? item.ID,
      nombre: item.nombre ?? item.name ?? "",
      documento: item.documento ?? item.document ?? "",
      tipo_documento: item.tipo_documento ?? item.tipoDocumento ?? item.documentType ?? "",
      telefono: item.telefono ?? item.phone ?? "",
      correo: item.correo ?? item.email ?? "",
      direccion: item.direccion ?? item.address ?? "",
      estado: item.estado ?? "Activo",
    };
  } catch (error) {
    console.error("[API] getEmployeeById ERROR:", error?.message);
    return null;
  }
};

// Crear nuevo empleado
export const createEmployee = async (employee) => {
  console.log("📥 DATOS RECIBIDOS en createEmployee:", employee);
  
  const payload = {
    nombre: employee.nombre ?? employee.name,
    documento: employee.documento ?? employee.document,
    tipo_documento: employee.tipo_documento ?? employee.tipoDocumento ?? employee.documentType,
    telefono: employee.telefono ?? employee.phone,
    correo: employee.correo ?? employee.email,
    direccion: employee.direccion ?? employee.address ?? '',
    estado: employee.estado ?? "Activo",
    // NO enviamos contrasena ni roleId, el backend los maneja automáticamente
  };

  console.log("🔍 PAYLOAD FINAL QUE SE ENVÍA AL BACKEND:", payload);
  console.log("📊 VALIDACIÓN DE CAMPOS:");
  console.log("  - nombre:", payload.nombre, "tipo:", typeof payload.nombre);
  console.log("  - documento:", payload.documento, "tipo:", typeof payload.documento);
  console.log("  - tipo_documento:", payload.tipo_documento, "tipo:", typeof payload.tipo_documento);
  console.log("  - telefono:", payload.telefono, "tipo:", typeof payload.telefono);
  console.log("  - correo:", payload.correo, "tipo:", typeof payload.correo);
  console.log("  - direccion:", payload.direccion, "tipo:", typeof payload.direccion);
  console.log("  - estado:", payload.estado, "tipo:", typeof payload.estado);

  try {
    console.log("[API] POST Employee payload ->", payload);
    const created = await apiRequest.post(BASE, payload);
    console.log("[API] POST Employee response ->", created);
    
    // Normalizar respuesta
    return {
      id: created.id_empleado ?? created.id_usuario ?? created.id ?? created.idEmpleado ?? created.ID,
      nombre: created.nombre ?? created.name ?? payload.nombre,
      documento: created.documento ?? created.document ?? payload.documento,
      tipo_documento: created.tipo_documento ?? created.tipoDocumento ?? payload.tipo_documento,
      telefono: created.telefono ?? created.phone ?? payload.telefono,
      correo: created.correo ?? created.email ?? payload.correo,
      direccion: created.direccion ?? created.address ?? payload.direccion,
      estado: created.estado ?? "Activo",
    };
  } catch (err) {
    console.error("❌ ERROR COMPLETO:", err);
    console.error("❌ ERROR RESPONSE:", err.response);
    console.error("❌ ERROR DATA:", err.response?.data);
    console.error("❌ ERROR STATUS:", err.response?.status);
    console.error("❌ ERROR MESSAGE:", err.message);
    console.error(
      "[API] createEmployee ERROR:",
      err.response?.status,
      err.response?.data || err.message
    );
    throw err;
  }
};

// Actualizar empleado
// Actualizar empleado
export const updateEmployee = async (id, employee) => {
  const payload = {
    nombre: employee.nombre ?? employee.name,
    documento: employee.documento ?? employee.document,
    tipo_documento: employee.tipo_documento ?? employee.tipoDocumento ?? employee.documentType,
    telefono: employee.telefono ?? employee.phone,
    correo: employee.correo ?? employee.email,
    direccion: employee.direccion ?? employee.address ?? '',
    estado: employee.estado ?? "Activo",
  };

  try {
    console.log("🔵 [API] PUT Employee payload ->", payload);
    const updated = await apiRequest.put(`${BASE}/${id}`, payload);
    console.log("✅ [API] PUT Employee response ->", updated);
    
    return {
      id: updated.id_empleado ?? updated.id_usuario ?? updated.id ?? id,
      nombre: updated.nombre ?? updated.name ?? payload.nombre,
      documento: updated.documento ?? updated.document ?? payload.documento,
      tipo_documento: updated.tipo_documento ?? updated.tipoDocumento ?? payload.tipo_documento,
      telefono: updated.telefono ?? updated.phone ?? payload.telefono,
      correo: updated.correo ?? updated.email ?? payload.correo,
      direccion: updated.direccion ?? updated.address ?? payload.direccion,
      estado: updated.estado ?? "Activo",
    };
  } catch (err) {
    console.error("❌ [API] updateEmployee ERROR:", err.response?.status, err.response?.data || err.message);
    throw err;
  }
};

// Eliminar empleado
export const deleteEmployee = async (id) => {
  try {
    if (!id) {
      throw new Error('ID del empleado es requerido');
    }

    const res = await apiRequest.delete(`${BASE}/${id}`);
    console.log("[API] DELETE Employee response ->", res);
    return res;
  } catch (err) {
    console.error(
      "[API] deleteEmployee ERROR:",
      err.response?.status,
      err.response?.data || err.message
    );
    throw err;
  }
};

// Cambiar estado del empleado (toggle)
export const toggleEmployeeStatus = async (id, newStatus) => {
  try {
    console.log("[API] PATCH change employee status for ID:", id, "New status:", newStatus);
    const res = await apiRequest.patch(`${BASE}/${id}/status`, { estado: newStatus });
    console.log("[API] PATCH response ->", res);
    return res;
  } catch (err) {
    console.error(
      "[API] toggleEmployeeStatus ERROR:",
      err.response?.status,
      err.response?.data || err.message
    );
    throw err;
  }
};

// Obtener empleados activos (útil para dropdowns)
export const getActiveEmployees = async () => {
  try {
    const raw = await apiRequest.get(`${BASE}?status=activo`, { timeout: 12000 });

    let list = [];
    if (Array.isArray(raw)) {
      list = raw;
    } else if (raw?.data && Array.isArray(raw.data)) {
      list = raw.data;
    }

    return list.map((item) => ({
      id: item.id_empleado ?? item.id ?? item.idEmpleado ?? item.ID,
      nombre: item.nombre ?? item.name ?? "",
      documento: item.documento ?? item.document ?? "",
      tipo_documento: item.tipo_documento ?? item.tipoDocumento ?? "",
      telefono: item.telefono ?? item.phone ?? "",
      correo: item.correo ?? item.email ?? "",
      direccion: item.direccion ?? item.address ?? "",
      estado: item.estado ?? "Activo",
    }));
  } catch (error) {
    console.error("[API] getActiveEmployees ERROR:", error?.message);
    return [];
  }
};

// Buscar empleados
export const searchEmployees = async (query) => {
  try {
    if (!query || query.trim() === '') {
      throw new Error('Término de búsqueda es requerido');
    }

    const raw = await apiRequest.get(`${BASE}/search`, {
      params: { q: query.trim() },
      timeout: 12000
    });

    let list = [];
    if (Array.isArray(raw)) {
      list = raw;
    } else if (raw?.data && Array.isArray(raw.data)) {
      list = raw.data;
    }

    return list.map((item) => ({
      id: item.id_empleado ?? item.id ?? item.idEmpleado ?? item.ID,
      nombre: item.nombre ?? item.name ?? "",
      documento: item.documento ?? item.document ?? "",
      tipo_documento: item.tipo_documento ?? item.tipoDocumento ?? "",
      telefono: item.telefono ?? item.phone ?? "",
      correo: item.correo ?? item.email ?? "",
      direccion: item.direccion ?? item.address ?? "",
      estado: item.estado ?? "Activo",
    }));
  } catch (error) {
    console.error("[API] searchEmployees ERROR:", error?.message);
    return [];
  }
};