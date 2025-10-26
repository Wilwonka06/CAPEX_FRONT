import PropTypes from 'prop-types';

const LoadingTable = ({ message = "Cargando datos..." }) => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">{message}</span>
    </div>
  );
};

LoadingTable.propTypes = {
  message: PropTypes.string
};

export default LoadingTable;