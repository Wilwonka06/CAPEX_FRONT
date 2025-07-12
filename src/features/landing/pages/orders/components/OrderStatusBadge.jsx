import PropTypes from 'prop-types';

const statusStyles = {
  'Pendiente pago': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'En preparación': 'bg-blue-100 text-blue-800 border-blue-300',
  'Enviado': 'bg-green-100 text-green-800 border-green-300',
  'Entregado': 'bg-gray-200 text-gray-700 border-gray-300',
};

const OrderStatusBadge = ({ status }) => {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyles[status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>{status}</span>
  );
};

OrderStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

export default OrderStatusBadge; 