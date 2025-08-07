import React from "react";
import Button from "./Button";

interface PaginatorProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Paginator: React.FC<PaginatorProps> = ({ page, totalPages, onPageChange, className = "" }) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center space-x-2 mt-4 ${className}`}>
      <Button
        variant="outline"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        Anterior
      </Button>
      <span className="px-2 text-sm text-gray-700">
        Página {page} de {totalPages}
      </span>
      <Button
        variant="outline"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Siguiente
      </Button>
    </div>
  );
};

export default Paginator; 