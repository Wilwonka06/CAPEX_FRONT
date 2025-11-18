import React from 'react';
import PropTypes from 'prop-types';
import TruncatedText from '../../../../../shared/components/TruncatedText';
import StatusToggle from './StatusToggle';
import ActionButtons from './ActionButtons';

const RoleRow = ({ role, onView, onEdit, onDelete, onStatusChange }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="py-3 px-3 text-xs font-medium text-gray-900">
        <TruncatedText
          text={role.name ?? role.nombre ?? ''}
          maxLength={25}
          maxWidth="max-w-[180px]"
        />
      </td>
      
      <td className="py-3 px-3 text-xs text-gray-600">
        <TruncatedText
          text={role.description ?? role.descripcion ?? ''}
          maxLength={40}
          maxWidth="max-w-[250px]"
        />
      </td>
      
      <td className="py-3 px-3 text-xs">
        {onStatusChange && (
          <StatusToggle role={role} onStatusChange={onStatusChange} />
        )}
        {!onStatusChange && (
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
            role.estado === 'Activo' || role.estado === 'activo'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {role.estado === 'Activo' || role.estado === 'activo' ? 'Activo' : 'Inactivo'}
          </span>
        )}
      </td>
      
      <td className="py-3 px-3 text-xs font-medium text-right">
        <ActionButtons 
          role={role} 
          onView={onView} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      </td>
    </tr>
  );
};

RoleRow.propTypes = {
  role: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    nombre: PropTypes.string,
    description: PropTypes.string,
    descripcion: PropTypes.string,
    estado: PropTypes.string,
  }).isRequired,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
};

export default RoleRow;
