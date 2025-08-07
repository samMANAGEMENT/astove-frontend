import React from 'react';
import { Search, Filter } from 'lucide-react';
import Input from './Input';
import Button from './Button';

interface SearchFiltersProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFiltersClick?: () => void;
  searchPlaceholder?: string;
  showFilters?: boolean;
  className?: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchValue = '',
  onSearchChange,
  onFiltersClick,
  searchPlaceholder = 'Buscar...',
  showFilters = true,
  className = '',
}) => {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <div className="flex-1">
        <Input
          type="search"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          icon={Search}
          iconPosition="left"
        />
      </div>
      {showFilters && (
        <Button
          variant="outline"
          icon={Filter}
          onClick={onFiltersClick}
        >
          Filtros
        </Button>
      )}
    </div>
  );
};

export default SearchFilters; 