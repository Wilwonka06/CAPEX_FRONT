import PropTypes from 'prop-types';

const LoadingSpinner = ({ size = 'h-32 w-32', color = 'border-primary' }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className={`animate-spin rounded-full ${size} border-b-2 ${color}`}></div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.string,
  color: PropTypes.string
};

export default LoadingSpinner;