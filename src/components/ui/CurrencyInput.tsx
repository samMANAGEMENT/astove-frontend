import React, { useState, useEffect } from 'react';
import Input from './Input';
import { formatCurrency } from '../../lib/utils';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  min?: number;
  step?: number;
  error?: string;
  showPreview?: boolean;
  className?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder = "0",
  label,
  required = false,
  min = 0,
  step = 100,
  error,
  showPreview = true,
  className = ""
}) => {
  const [displayValue, setDisplayValue] = useState(value.toString());

  useEffect(() => {
    setDisplayValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    const numericValue = parseFloat(inputValue) || 0;
    onChange(numericValue);
  };

  const handleBlur = () => {
    // Formatear el valor al salir del campo
    const numericValue = parseFloat(displayValue) || 0;
    setDisplayValue(numericValue.toString());
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <Input
          type="number"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          min={min.toString()}
          step={step.toString()}
          required={required}
          className="pr-12"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-gray-500 text-sm">COP</span>
        </div>
      </div>
      
      {showPreview && value > 0 && (
        <p className="text-sm text-gray-600 mt-1">
          {formatCurrency(value)}
        </p>
      )}
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default CurrencyInput;
