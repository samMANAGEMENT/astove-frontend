/**
 * Utilidades para el formato de moneda en pesos colombianos (COP)
 */

/**
 * Formatea un número como moneda en pesos colombianos
 * @param amount - Cantidad a formatear
 * @param options - Opciones adicionales de formato
 * @returns String formateado en formato COP
 */
export const formatCurrency = (
  amount: number, 
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
  } = {}
): string => {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    showSymbol = true
  } = options;

  return new Intl.NumberFormat('es-CO', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'COP',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
};

/**
 * Formatea un número como moneda sin el símbolo de moneda
 * @param amount - Cantidad a formatear
 * @returns String formateado sin símbolo de moneda
 */
export const formatAmount = (amount: number): string => {
  return formatCurrency(amount, { showSymbol: false });
};

/**
 * Parsea un string de moneda a número
 * @param currencyString - String de moneda (ej: "$1,234.56")
 * @returns Número parseado
 */
export const parseCurrency = (currencyString: string): number => {
  // Remover símbolos de moneda y separadores de miles
  const cleanString = currencyString.replace(/[^\d.,]/g, '');
  
  // Reemplazar coma por punto para decimales
  const normalizedString = cleanString.replace(',', '.');
  
  return parseFloat(normalizedString) || 0;
};

/**
 * Valida si un valor es un monto válido
 * @param value - Valor a validar
 * @returns true si es válido, false en caso contrario
 */
export const isValidAmount = (value: any): boolean => {
  if (typeof value === 'number') {
    return value >= 0 && isFinite(value);
  }
  
  if (typeof value === 'string') {
    const parsed = parseCurrency(value);
    return parsed >= 0 && isFinite(parsed);
  }
  
  return false;
};
