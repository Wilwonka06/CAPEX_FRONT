const PROFESSIONALS_KEY = 'professionals';

// Función para obtener empleados desde el módulo de empleados existente
const getEmployeesFromStorage = () => {
  const data = localStorage.getItem('capex_employees');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
};

// Función para convertir empleados a formato de profesionales
const convertEmployeesToProfessionals = (employees) => {
  return employees
    .filter(emp => emp.estado) // Solo empleados activos
    .map(emp => ({
      id: emp.id,
      name: `${emp.nombre} ${emp.apellido}`.trim(),
      active: emp.estado,
      role: 'Empleado',
      phone: '',
      email: ''
    }));
};

// Lista inicial de profesionales (fallback)
const initialProfessionals = [
  { id: 1, name: 'Ana Torres', active: true },
  { id: 2, name: 'Carlos Ruiz', active: true },
  { id: 3, name: 'Lucía Gómez', active: true },
];

function saveProfessionalsToStorage(professionals) {
  localStorage.setItem(PROFESSIONALS_KEY, JSON.stringify(professionals));
}

function loadProfessionalsFromStorage() {
  const data = localStorage.getItem(PROFESSIONALS_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
}

export const getProfessionals = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Obtener empleados desde el módulo de empleados existente
      const employees = getEmployeesFromStorage();
      const professionals = convertEmployeesToProfessionals(employees);
      
      // Si no hay empleados activos, usar datos de respaldo
      if (professionals.length === 0) {
        let fallbackProfessionals = loadProfessionalsFromStorage();
        if (!fallbackProfessionals) {
          saveProfessionalsToStorage(initialProfessionals);
          fallbackProfessionals = initialProfessionals;
        }
        resolve(fallbackProfessionals);
      } else {
        resolve(professionals);
      }
    }, 200);
  });
};

export const addProfessional = (professional) => {
  return new Promise((resolve) => {
    getProfessionals().then((professionals) => {
      const newProfessional = { ...professional, id: Date.now() };
      const updatedProfessionals = [...professionals, newProfessional];
      saveProfessionalsToStorage(updatedProfessionals);
      resolve(newProfessional);
    });
  });
};

export const updateProfessional = (updatedProfessional) => {
  return new Promise((resolve) => {
    getProfessionals().then((professionals) => {
      const updatedProfessionals = professionals.map(p => p.id === updatedProfessional.id ? updatedProfessional : p);
      saveProfessionalsToStorage(updatedProfessionals);
      resolve(updatedProfessional);
    });
  });
};

export const deleteProfessional = (professionalId) => {
  return new Promise((resolve) => {
    getProfessionals().then((professionals) => {
      const updatedProfessionals = professionals.filter(p => p.id !== professionalId);
      saveProfessionalsToStorage(updatedProfessionals);
      resolve(professionalId);
    });
  });
}; 