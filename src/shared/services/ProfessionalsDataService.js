const PROFESSIONALS_KEY = 'professionals';

// Lista inicial de profesionales (mock)
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
      let professionals = loadProfessionalsFromStorage();
      if (!professionals) {
        saveProfessionalsToStorage(initialProfessionals);
        professionals = initialProfessionals;
      }
      resolve(professionals);
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