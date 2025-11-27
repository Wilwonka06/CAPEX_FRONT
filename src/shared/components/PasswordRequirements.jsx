import { useEffect, useState } from 'react';

const PasswordRequirements = ({ password }) => {
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    const pwd = password || '';
    setRequirements({
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[@$!%*?&]/.test(pwd)
    });
  }, [password]);

  const allMet = Object.values(requirements).every(Boolean);

  return (
    <div className="mt-2 text-sm">
      <p className="font-medium mb-1 text-gray-700">Requisitos de la contraseña:</p>
      <ul className="space-y-1">
        <li className={`flex items-center gap-2 ${requirements.length ? 'text-green-600' : 'text-gray-500'}`}>
          <i className={`bi ${requirements.length ? 'bi-check-circle-fill' : 'bi-x-circle'}`}></i>
          <span>Mínimo 8 caracteres</span>
        </li>
        <li className={`flex items-center gap-2 ${requirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
          <i className={`bi ${requirements.uppercase ? 'bi-check-circle-fill' : 'bi-x-circle'}`}></i>
          <span>Al menos una mayúscula</span>
        </li>
        <li className={`flex items-center gap-2 ${requirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
          <i className={`bi ${requirements.lowercase ? 'bi-check-circle-fill' : 'bi-x-circle'}`}></i>
          <span>Al menos una minúscula</span>
        </li>
        <li className={`flex items-center gap-2 ${requirements.number ? 'text-green-600' : 'text-gray-500'}`}>
          <i className={`bi ${requirements.number ? 'bi-check-circle-fill' : 'bi-x-circle'}`}></i>
          <span>Al menos un número</span>
        </li>
        <li className={`flex items-center gap-2 ${requirements.special ? 'text-green-600' : 'text-gray-500'}`}>
          <i className={`bi ${requirements.special ? 'bi-check-circle-fill' : 'bi-x-circle'}`}></i>
          <span>Al menos un carácter especial (@$!%*?&)</span>
        </li>
      </ul>
      {allMet && (
        <div className="mt-2 text-green-600 font-medium flex items-center gap-2 animate-pulse">
          <i className="bi bi-shield-check"></i>
          <span>¡Contraseña segura!</span>
        </div>
      )}
    </div>
  );
};

export default PasswordRequirements;
