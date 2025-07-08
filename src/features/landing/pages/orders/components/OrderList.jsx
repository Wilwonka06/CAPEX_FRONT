import PropTypes from 'prop-types';
import OrderRow from './OrderRow';

const OrderList = ({ orders }) => {
  return (
    <div className="flex flex-col gap-4">
      {orders.map(order => (
        <OrderRow key={order.id} order={order} />
      ))}
    </div>
  );
};

OrderList.propTypes = {
  orders: PropTypes.array.isRequired,
};

export default OrderList; 