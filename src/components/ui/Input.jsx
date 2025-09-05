import React, { forwardRef } from 'react';
import { Search, Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({ 
  className = '', 
  variant = 'default',
  size = 'md',
  icon = null,
  error = null,
  label = null,
  type = 'text',
  showPasswordToggle = false,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2',
    lg: 'px-4 py-3 text-lg'
  };

  const variantClasses = {
    default: 'bg-surface border-gray-700 focus:ring-primary focus:border-transparent',
    search: 'bg-surface border-gray-700 focus:ring-accent focus:border-transparent pl-10',
    error: 'bg-surface border-red-500 focus:ring-red-500 focus:border-transparent'
  };

  const baseClasses = `w-full border rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 transition-colors ${sizeClasses[size]} ${variantClasses[error ? 'error' : variant]} ${className}`;

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && variant !== 'search' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        {variant === 'search' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-text-secondary" />
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={`${baseClasses} ${icon && variant !== 'search' ? 'pl-10' : ''} ${showPasswordToggle ? 'pr-10' : ''}`}
          {...props}
        />
        
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-text-secondary hover:text-text-primary" />
            ) : (
              <Eye className="w-4 h-4 text-text-secondary hover:text-text-primary" />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
