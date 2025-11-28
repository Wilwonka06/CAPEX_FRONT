export function testAggregatedPrivileges() {
  const adminPrivs = {
    'Gestión de Usuarios': { Visualizar: true, Crear: true, Editar: true, Eliminar: true },
    'Productos': { Visualizar: true, Crear: true, Editar: true, Eliminar: true },
  };
  const employeePrivs = {
    'Productos': { Visualizar: true, Crear: false, Editar: true, Eliminar: false },
    'Citas': { Visualizar: true, Crear: true, Editar: true, Eliminar: false },
  };

  const aggregate = (list) => {
    const out = {};
    for (const p of list) {
      for (const m of Object.keys(p)) {
        out[m] = out[m] || { Visualizar: false, Crear: false, Editar: false, Eliminar: false };
        out[m].Visualizar = out[m].Visualizar || p[m].Visualizar === true || p[m].Read === true;
        out[m].Crear = out[m].Crear || p[m].Crear === true || p[m].Create === true;
        out[m].Editar = out[m].Editar || p[m].Editar === true || p[m].Edit === true;
        out[m].Eliminar = out[m].Eliminar || p[m].Eliminar === true || p[m].Delete === true;
      }
    }
    return out;
  };

  const agg = aggregate([adminPrivs, employeePrivs]);
  console.assert(agg['Gestión de Usuarios'].Crear === true, 'Admin debe crear en Gestión de Usuarios');
  console.assert(agg['Productos'].Eliminar === true, 'Admin debe eliminar en Productos');
  console.assert(agg['Citas'].Crear === true, 'Empleado debe crear en Citas');
}

// Ejecutar si se importa directamente en entorno de desarrollo
try { if (import.meta?.env?.DEV) testAggregatedPrivileges(); } catch {}
