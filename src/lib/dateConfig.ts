import { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';


// Registrar el locale español
registerLocale('es', es);

export const dateConfig = {
  locale: 'es',
  dateFormat: 'dd/MM/yyyy',
  placeholderText: 'Seleccionar fecha',
};

/**
 * Convierte una fecha a formato YYYY-MM-DD en la zona horaria local
 * Evita problemas de conversión UTC que pueden causar cambios de día
 */
export const formatDateForAPI = (date: Date): string => {
  return date.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD en zona horaria local
};

/**
 * Convierte una fecha string a formato YYYY-MM-DD en la zona horaria local
 */
export const formatDateStringForAPI = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-CA');
}; 