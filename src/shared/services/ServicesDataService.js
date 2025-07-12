const SERVICES_KEY = 'services';

// Servicios de ejemplo iniciales
const initialServices = [
  { id: 1, name: 'Corte de cabello', category: 'Peluquería', duration: 30, price: 25000, active: true, description: 'Corte clásico para hombre o mujer', estado: 'Activo' },
  { id: 2, name: 'Manicura Completa', category: 'Uñas', duration: 45, price: 35000, active: true, description: 'Manicura profesional con esmaltado', estado: 'Activo' },
  { id: 3, name: 'Masaje Relajante', category: 'Bienestar', duration: 60, price: 80000, active: false, description: 'Masaje corporal relajante', estado: 'Inactivo' },
  { id: 4, name: 'Depilación Láser', category: 'Estética', duration: 20, price: 150000, active: true, description: 'Depilación láser definitiva', estado: 'Activo' },
  { id: 5, name: 'Limpieza Facial', category: 'Cuidado Facial', duration: 50, price: 60000, active: true, description: 'Limpieza profunda de cutis', estado: 'Activo' },
  { id: 6, name: 'Tratamiento Capilar', category: 'Peluquería', duration: 40, price: 75000, active: false, description: 'Tratamiento nutritivo para el cabello', estado: 'Inactivo' },
];

function saveServicesToStorage(services) {
  localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
}

function loadServicesFromStorage() {
  const data = localStorage.getItem(SERVICES_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
}

export const getServices = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let services = loadServicesFromStorage();
      if (!services) {
        saveServicesToStorage(initialServices);
        services = initialServices;
      }
      resolve(services);
    }, 300);
  });
};

export const addService = (service) => {
  return new Promise((resolve) => {
    getServices().then((services) => {
      const newService = { ...service, id: Date.now() };
      const updatedServices = [...services, newService];
      saveServicesToStorage(updatedServices);
      resolve(newService);
    });
  });
};

export const updateService = (updatedService) => {
  return new Promise((resolve) => {
    getServices().then((services) => {
      const updatedServices = services.map(s => s.id === updatedService.id ? updatedService : s);
      saveServicesToStorage(updatedServices);
      resolve(updatedService);
    });
  });
};

export const deleteService = (serviceId) => {
  return new Promise((resolve) => {
    getServices().then((services) => {
      const updatedServices = services.filter(s => s.id !== serviceId);
      saveServicesToStorage(updatedServices);
      resolve(serviceId);
    });
  });
}; 