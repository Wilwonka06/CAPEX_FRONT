const EMPLOYEES_KEY = 'employees';

// Empleados de ejemplo iniciales
const initialEmployees = [
  { id: 1, name: 'Ana Torres', role: 'Estilista', active: true, phone: '3001234567', email: 'ana@salon.com', estado: 'Activo' },
  { id: 2, name: 'Carlos Ruiz', role: 'Barbero', active: true, phone: '3009876543', email: 'carlos@salon.com', estado: 'Activo' },
  { id: 3, name: 'Lucía Gómez', role: 'Manicurista', active: false, phone: '3012345678', email: 'lucia@salon.com', estado: 'Inactivo' },
];

function saveEmployeesToStorage(employees) {
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
}

function loadEmployeesFromStorage() {
  const data = localStorage.getItem(EMPLOYEES_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
}

export const getEmployees = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let employees = loadEmployeesFromStorage();
      if (!employees) {
        saveEmployeesToStorage(initialEmployees);
        employees = initialEmployees;
      }
      resolve(employees);
    }, 300);
  });
};

export const addEmployee = (employee) => {
  return new Promise((resolve) => {
    getEmployees().then((employees) => {
      const newEmployee = { ...employee, id: Date.now() };
      const updatedEmployees = [...employees, newEmployee];
      saveEmployeesToStorage(updatedEmployees);
      resolve(newEmployee);
    });
  });
};

export const updateEmployee = (updatedEmployee) => {
  return new Promise((resolve) => {
    getEmployees().then((employees) => {
      const updatedEmployees = employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e);
      saveEmployeesToStorage(updatedEmployees);
      resolve(updatedEmployee);
    });
  });
};

export const deleteEmployee = (employeeId) => {
  return new Promise((resolve) => {
    getEmployees().then((employees) => {
      const updatedEmployees = employees.filter(e => e.id !== employeeId);
      saveEmployeesToStorage(updatedEmployees);
      resolve(employeeId);
    });
  });
}; 