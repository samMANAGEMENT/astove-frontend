import { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';


// Registrar el locale español
registerLocale('es', es);

export const dateConfig = {
  locale: 'es',
  dateFormat: 'dd/MM/yyyy',
  placeholderText: 'Seleccionar fecha',
}; 