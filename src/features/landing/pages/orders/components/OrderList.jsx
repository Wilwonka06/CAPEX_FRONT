import PropTypes from 'prop-types';
import OrderRow from './OrderRow';

const OrderList = ({ orders, onStatusChange }) => {
  return (
    <div className="flex flex-col gap-4">
      {orders.map(order => (
        <OrderRow key={order.id} order={order} onStatusChange={onStatusChange} />
      ))}
    </div>
  );
};

OrderList.propTypes = {
  orders: PropTypes.array.isRequired,
  onStatusChange: PropTypes.func,
};

export default OrderList;