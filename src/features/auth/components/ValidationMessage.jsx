const ValidationMessage = ({ error, success, className = '' }) => {
  if (!error && !success) return null;

  return (
    <div
      className={`rounded-xl p-3 animate-fade-in transition-all duration-300 ${
        error
          ? 'bg-red-50 border border-red-200'
          : 'bg-green-50 border border-green-200'
      } ${className}`}
    >
      <div className="flex items-center gap-2">
        <i
          className={`${
            error ? 'bi bi-exclamation-triangle text-red-500' : 'bi bi-check-circle text-green-500'
          } text-sm`}
        ></i>
        <span
          className={`text-sm ${
            error ? 'text-red-700' : 'text-green-700'
          }`}
        >
          {error || success}
        </span>
      </div>
    </div>
  );
};

export default ValidationMessage;