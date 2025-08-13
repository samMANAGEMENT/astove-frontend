import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'file' | 'datetime-local' | 'date';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  className?: string;
  name?: string;
  id?: string;
  required?: boolean;
  min?: string;
  max?: string;
  step?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  className = '',
  name,
  id,
  required = false,
  min,
  max,
  step,
}) => {
  const baseClasses = 'w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-gray-900';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '';
  const iconClasses = Icon ? (iconPosition === 'left' ? 'pl-10 pr-4' : 'pl-4 pr-10') : 'px-4';
  
  const classes = `${baseClasses} ${iconClasses} py-2 ${disabledClasses} ${className}`;

  return (
    <div className="relative">
      {Icon && iconPosition === 'left' && (
        <Icon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={classes}
        name={name}
        id={id}
        required={required}
        min={min}
        max={max}
        step={step}
      />
      {Icon && iconPosition === 'right' && (
        <Icon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
      )}
    </div>
  );
};

export default Input; 