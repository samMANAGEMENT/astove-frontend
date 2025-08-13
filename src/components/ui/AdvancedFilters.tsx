import React from 'react';
import { Filter, X, RefreshCw } from 'lucide-react';
import { Button } from './index';

interface FilterOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface AdvancedFiltersProps {
  isOpen: boolean;
  onToggle: () => void;
  onClear: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  isOpen,
  onToggle,
  onClear,
  children,
  title = "Filtros Avanzados",
  className = ""
}) => {
  if (!isOpen) return null;

  return (
    <div className={`mt-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-blue-600" />
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onClear}
            className="flex items-center text-sm bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Limpiar
          </Button>
          <Button
            variant="outline"
            onClick={onToggle}
            className="flex items-center text-sm bg-white hover:bg-gray-50"
          >
            <X className="w-4 h-4 mr-1" />
            Cerrar
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
};

interface QuickDateSelectorProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
  className?: string;
}

const QuickDateSelector: React.FC<QuickDateSelectorProps> = ({
  selectedRange,
  onRangeChange,
  className = ""
}) => {
  const dateRanges: FilterOption[] = [
    { value: 'today', label: 'Hoy' },
    { value: 'yesterday', label: 'Ayer' },
    { value: 'last_week', label: 'Última Semana' },
    { value: 'last_month', label: 'Último Mes' },
    { value: 'last_quarter', label: 'Último Trimestre' },
    { value: 'last_year', label: 'Último Año' }
  ];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {dateRanges.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onRangeChange(value)}
          className={`px-4 py-2 text-sm rounded-full transition-all duration-200 font-medium ${
            selectedRange === value
              ? 'bg-blue-500 text-white shadow-md transform scale-105'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-blue-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

interface FilterFieldProps {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const FilterField: React.FC<FilterFieldProps> = ({
  label,
  icon,
  children,
  className = ""
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
};

export { AdvancedFilters, QuickDateSelector, FilterField };
export default AdvancedFilters;
