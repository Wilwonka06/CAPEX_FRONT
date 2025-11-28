import PasswordEye from '../../../shared/components/PasswordEye';

const FormField = ({
  label,
  type,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  icon,
  error,
  required = false,
  disabled = false,
  showPassword = false,
  onTogglePassword = null,
  className = '',
  options = []
}) => {
  const isPassword = type === 'password' || onTogglePassword !== null;
  const isSelect = type === 'select';

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-semibold text-[#6d3b3b]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <i className={`${icon} text-gray-400 group-focus-within:text-[#ffb76b] transition-colors`}></i>
          </div>
        )}
        {isSelect ? (
          <select
            name={name}
            className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ffb76b] focus:ring-4 focus:ring-[#ffb76b]/10 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
              error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            required={required}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${name}-error` : undefined}
          >
            <option value="">Seleccionar</option>
            {options.map(option => {
              if (typeof option === 'string') {
                return <option key={option} value={option}>{option}</option>;
              }
              const { value, label } = option || {};
              return <option key={value || label} value={value || label}>{label || value}</option>;
            })}
          </select>
        ) : (
          <input
            type={isPassword && !showPassword ? 'password' : type || 'text'}
            name={name}
            className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ffb76b] focus:ring-4 focus:ring-[#ffb76b]/10 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
              error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            required={required}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${name}-error` : undefined}
          />
        )}
        {isPassword && onTogglePassword && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <PasswordEye visible={showPassword} onToggle={onTogglePassword} />
          </div>
        )}
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 animate-shake">
          <div className="flex items-center gap-2">
            <i className="bi bi-exclamation-triangle text-red-500 text-sm"></i>
            <span className="text-red-700 text-sm" id={`${name}-error`}>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormField;