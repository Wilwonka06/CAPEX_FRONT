export const DOC_TYPES_CODES = ['RC','TI','CC','TE','CE','NIT','PP','PEP','DIE','NUIP','FOREIGN_NIT'];

export const DOC_TYPE_LABELS = {
  RC: 'Registro civil',
  TI: 'Tarjeta de identidad',
  CC: 'Cédula de ciudadanía',
  TE: 'Tarjeta de extranjería',
  CE: 'Cédula de extranjería',
  NIT: 'Número de identificación tributaria',
  PP: 'Pasaporte',
  PEP: 'Permiso especial de permanencia',
  DIE: 'Documento de identificación extranjero',
  NUIP: 'NUIP',
  FOREIGN_NIT: 'NIT de otro país'
};

export const getDocOptions = () => DOC_TYPES_CODES.map(code => ({ value: code, label: `${code} - ${DOC_TYPE_LABELS[code]}` }));

const LABEL_TO_CODE = {
  'registro civil': 'RC',
  'tarjeta de identidad': 'TI',
  'cédula de ciudadanía': 'CC',
  'cedula de ciudadania': 'CC',
  'tarjeta de extranjería': 'TE',
  'tarjeta de extranjeria': 'TE',
  'cédula de extranjería': 'CE',
  'cedula de extranjeria': 'CE',
  'número de identificación tributaria': 'NIT',
  'pasaporte': 'PP',
  'permiso especial de permanencia': 'PEP',
  'documento de identificación extranjero': 'DIE',
  'nuip': 'NUIP',
  'nit de otro país': 'FOREIGN_NIT'
};

export function codeFromLabel(labelOrCode) {
  if (!labelOrCode) return '';
  const clean = String(labelOrCode).trim();
  if (DOC_TYPES_CODES.includes(clean)) return clean;
  const norm = clean.toLowerCase();
  return LABEL_TO_CODE[norm] || clean;
}

export function labelFromAny(valueOrLabel) {
  if (!valueOrLabel) return '';
  const code = codeFromLabel(valueOrLabel);
  return DOC_TYPE_LABELS[code] || String(valueOrLabel);
}

// Convert front-end extended codes to backend-accepted codes
export function toBackendDocCode(code) {
  const c = codeFromLabel(code);
  const map = {
    RC: 'CC',
    TI: 'TI',
    CC: 'CC',
    TE: 'CE',
    CE: 'CE',
    NIT: 'NIT',
    PP: 'PAS',
    PEP: 'CC',
    DIE: 'CE',
    NUIP: 'TI',
    FOREIGN_NIT: 'NIT'
  };
  return map[c] || c;
}