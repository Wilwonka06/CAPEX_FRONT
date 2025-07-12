const STORAGE_KEY = 'capex_customers';

const initialCustomers = [
  { id: 1, documentType: "CC", documentNumber: "1234567890", firstName: "Juan", lastName: "Pérez", email: "juan.perez@email.com", phone: "3101234567", address: "Calle 1 #2-3", status: "Activo" },
  { id: 2, documentType: "CE", documentNumber: "0987654321", firstName: "María", lastName: "González", email: "maria.gonzalez@email.com", phone: "3157894561", address: "Carrera 4 #5-6", status: "Activo" },
  { id: 3, documentType: "CC", documentNumber: "5678901234", firstName: "Carlos", lastName: "Rodríguez", email: "carlos.rodriguez@email.com", phone: "3203216547", address: "Av. 7 #8-9", status: "Inactivo" },
  { id: 4, documentType: "TI", documentNumber: "4321098765", firstName: "Ana", lastName: "Martínez", email: "ana.martinez@email.com", phone: "3112345678", address: "Calle 10 #11-12", status: "Activo" },
  { id: 5, documentType: "CC", documentNumber: "9876543210", firstName: "Pedro", lastName: "Sánchez", email: "pedro.sanchez@email.com", phone: "3145678901", address: "Carrera 13 #14-15", status: "Activo" },
  { id: 6, documentType: "CE", documentNumber: "2345678901", firstName: "Laura", lastName: "López", email: "laura.lopez@email.com", phone: "3167890123", address: "Av. 16 #17-18", status: "Inactivo" },
];

function loadCustomers() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : initialCustomers;
}

function saveCustomers(customers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

const CustomerService = {
  getAll() {
    return loadCustomers();
  },
  findByDocument(documentNumber) {
    return loadCustomers().find(c => c.documentNumber === documentNumber);
  },
  add(customer) {
    const customers = loadCustomers();
    const exists = customers.find(c => c.documentNumber === customer.documentNumber);
    if (exists) return exists;
    const newCustomer = { ...customer, id: Date.now(), status: 'Activo' };
    customers.push(newCustomer);
    saveCustomers(customers);
    return newCustomer;
  },
  update(documentNumber, data) {
    const customers = loadCustomers();
    const idx = customers.findIndex(c => c.documentNumber === documentNumber);
    if (idx !== -1) {
      customers[idx] = { ...customers[idx], ...data };
      saveCustomers(customers);
      return customers[idx];
    }
    return null;
  }
};

export default CustomerService; 