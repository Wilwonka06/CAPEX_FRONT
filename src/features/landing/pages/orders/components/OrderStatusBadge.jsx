import PropTypes from 'prop-types';

const OrderStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'pendiente':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          icon: '⏳'
        };
      case 'en proceso':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          icon: '🔄'
        };
      case 'enviado':
        return {
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          borderColor: 'border-purple-200',
          icon: '📦'
        };
      case 'entregado':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          icon: '✅'
        };
      case 'cancelado':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          icon: '❌'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          icon: '❓'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
      <span className="mr-1">{config.icon}</span>
      {status}
    </span>
  );
};

OrderStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

export default OrderStatusBadge; 