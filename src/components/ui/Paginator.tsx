import React from "react";
import Button from "./Button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginatorProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Paginator: React.FC<PaginatorProps> = ({ page, totalPages, onPageChange, className = "" }) => {
  if (totalPages <= 1) return null;

  // Generar array de páginas a mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Si hay muchas páginas, mostrar un rango inteligente
      let start = Math.max(1, page - 2);
      let end = Math.min(totalPages, page + 2);
      
      // Ajustar para mostrar siempre maxVisiblePages
      if (end - start + 1 < maxVisiblePages) {
        if (start === 1) {
          end = Math.min(totalPages, start + maxVisiblePages - 1);
        } else {
          start = Math.max(1, end - maxVisiblePages + 1);
        }
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-center space-x-2 mt-4 ${className}`}>
      {/* Primera página */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={page === 1}
        className="px-2"
      >
        <ChevronsLeft className="w-4 h-4" />
      </Button>
      
      {/* Página anterior */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-2"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      {/* Números de página */}
      {pageNumbers.map((pageNum) => (
        <Button
          key={pageNum}
          variant={pageNum === page ? "primary" : "outline"}
          size="sm"
          onClick={() => onPageChange(pageNum)}
          className="px-3 min-w-[40px]"
        >
          {pageNum}
        </Button>
      ))}
      
      {/* Página siguiente */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-2"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
      
      {/* Última página */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
        className="px-2"
      >
        <ChevronsRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default Paginator; 