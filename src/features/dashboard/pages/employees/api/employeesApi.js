import axios from "axios";

const BASE = "https://capex-back.onrender.com/api/empleados";

// Obtener todos los empleados
export const getEmployees = async () => {
  try {
    const res = await axios.get(BASE, { timeout: 12000 });
    console.log("[API] getEmployees RAW response:", res.data);
    
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

    console.log("[API] getEmployees list before mapping:", list);

    // Asegurar campos esperados por la UI
    const normalized = list.map((item) => {
      console.log("[API] Processing item:", item);
      
      return {
        id: item.id_usuario ?? item.id,
        nombre: item.nombre ?? "",
        apellido: "", // El modelo NO tiene apellido
        documento: item.documento ?? "",
        tipoDocumento: item.tipo_documento ?? "",
        telefono: item.telefono ?? "",
        correo: item.correo ?? "",
        direccion: item.direccion ?? "",
        estado: item.estado ?? "Activo",
        rol: item.roleId === 2 ? "Empleado" : "Otro",
        createdAt: item.createdAt ?? new Date().toISOString(),
        updatedAt: item.updatedAt ?? new Date().toISOString(),
      };
    });

    console.log("[API] getEmployees normalized:", normalized);
    return normalized;
  } catch (error) {
    console.error("[API] getEmployees ERROR:", error?.message);
    console.error("[API] getEmployees ERROR full:", error);
    return [];
  }
};

// Crear nuevo empleado
// Crear nuevo empleado
export const createEmployee = async (employee) => {
  // Asegurar formato de teléfono internacional
  let telefono = employee.telefono ?? employee.phone ?? '';
  
  // Si el teléfono no empieza con +, agregarlo (asumiendo Colombia +57)
  if (telefono && !telefono.startsWith('+')) {
    telefono = `+57${telefono}`;
  }

  const payload = {
    nombre: employee.nombre ?? employee.name,
    documento: employee.documento ?? employee.document,
    tipo_documento: employee.tipo_documento ?? employee.tipoDocumento ?? employee.documentType,
    telefono: telefono,
    correo: employee.correo ?? employee.email,
    direccion: employee.direccion ?? employee.address ?? '',
    estado: employee.estado === 'Activo' ? 'Activo' : 'Inactivo',
  };

  // Validar campos requeridos
  if (!payload.nombre || !payload.documento || !payload.tipo_documento || !payload.telefono || !payload.correo) {
    console.error("[API] createEmployee - Missing required fields:", payload);
    throw new Error("Faltan campos obligatorios");
  }

  // Validar formato de teléfono
  const telefonoRegex = /^\+[0-9]{7,15}$/;
  if (!telefonoRegex.test(payload.telefono)) {
    console.error("[API] createEmployee - Invalid phone format:", payload.telefono);
    throw new Error(`El teléfono debe tener formato internacional (+1234567890). Recibido: ${payload.telefono}`);
  }

  console.log("[API] POST Employee payload ->", payload);

  try {
    const res = await axios.post(BASE, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 12000
    });
    console.log("[API] POST Employee response ->", res.status, res.data);

    const created = res.data;
    return {
      id: created.id_usuario ?? created.id,
      nombre: created.nombre ?? payload.nombre,
      apellido: "",
      documento: created.documento ?? payload.documento,
      tipoDocumento: created.tipo_documento ?? payload.tipo_documento,
      telefono: created.telefono ?? payload.telefono,
      correo: created.correo ?? payload.correo,
      direccion: created.direccion ?? payload.direccion,
      estado: created.estado ?? "Activo",
      rol: "Empleado",
    };
  } catch (err) {
    console.error("[API] createEmployee ERROR:", err.response?.status);
    console.error("[API] Error data:", err.response?.data);
    console.error("[API] Error message:", err.message);
    throw err;
  }
};

// Actualizar empleado
export const updateEmployee = async (id, employee) => {
  const payload = {
    nombre: employee.nombre ?? employee.name,
    documento: employee.documento ?? employee.document,
    tipo_documento: employee.tipoDocumento ?? employee.tipo_documento ?? employee.documentType,
    telefono: employee.telefono ?? employee.phone ?? '',
    correo: employee.correo ?? employee.email,
    direccion: employee.direccion ?? employee.address ?? '',
    estado: employee.estado,
  };

  // Remover campos undefined
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined || payload[key] === null) {
      delete payload[key];
    }
  });

  try {
    console.log("[API] PUT Employee payload ->", payload);
    const res = await axios.put(`${BASE}/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 12000
    });
    console.log("[API] PUT Employee response ->", res.status, res.data);

    const updated = res.data;
    return {
      id: updated.id_usuario ?? updated.id ?? id,
      nombre: updated.nombre ?? payload.nombre,
      apellido: "",
      documento: updated.documento ?? payload.documento,
      tipoDocumento: updated.tipo_documento ?? payload.tipo_documento,
      telefono: updated.telefono ?? payload.telefono,
      correo: updated.correo ?? payload.correo,
      direccion: updated.direccion ?? payload.direccion,
      estado: updated.estado ?? payload.estado,
      rol: "Empleado",
    };
  } catch (err) {
    console.error("[API] updateEmployee ERROR:", err.response?.status, err.response?.data || err.message);
    throw err;
  }
};

// Eliminar empleado
export const deleteEmployee = async (id) => {
  try {
    console.log("[API] DELETE Employee ID ->", id);
    const res = await axios.delete(`${BASE}/${id}`, {
      timeout: 12000
    });
    console.log("[API] DELETE Employee response ->", res.status, res.data);
    return res.data;
  } catch (err) {
    console.error("[API] deleteEmployee ERROR:", err.response?.status, err.response?.data || err.message);
    throw err;
  }
};

// Cambiar estado del empleado
export const toggleEmployeeStatus = async (id, newEstado) => {
  try {
    console.log("[API] PATCH Employee status ->", id, newEstado);
    const res = await axios.patch(`${BASE}/${id}/status`, { 
      estado: newEstado,
      concepto_estado: "Cambio de estado desde la aplicación"
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 12000
    });
    console.log("[API] PATCH Employee response ->", res.status, res.data);

    const updated = res.data;
    return {
      id: updated.id_usuario ?? updated.id ?? id,
      nombre: updated.nombre ?? "",
      apellido: "",
      documento: updated.documento ?? "",
      tipoDocumento: updated.tipo_documento ?? "",
      telefono: updated.telefono ?? "",
      correo: updated.correo ?? "",
      direccion: updated.direccion ?? "",
      estado: updated.estado ?? newEstado,
      rol: "Empleado",
    };
  } catch (err) {
    console.error("[API] toggleEmployeeStatus ERROR:", err.response?.status, err.response?.data || err.message);
    throw err;
  }
};

// Obtener empleado por ID
export const getEmployeeById = async (id) => {
  try {
    const res = await axios.get(`${BASE}/${id}`, { timeout: 12000 });
    const item = res?.data;

    if (!item) return null;

    return {
      id: item.id_usuario ?? item.id,
      nombre: item.nombre ?? "",
      apellido: "",
      documento: item.documento ?? "",
      tipoDocumento: item.tipo_documento ?? "",
      telefono: item.telefono ?? "",
      correo: item.correo ?? "",
      direccion: item.direccion ?? "",
      estado: item.estado ?? "Activo",
      rol: "Empleado",
    };
  } catch (error) {
    console.error("[API] getEmployeeById ERROR:", error?.message);
    return null;
  }
};