import { useState, useEffect, useCallback, useRef } from 'react';
import { pagosService } from '../lib/services/pagosService';

interface DailyEarningsData {
  fecha: string;
  resumen_diario: {
    ingresos_totales: number;
    ingresos_servicios: number;
    ingresos_adicionales: number;
    ingresos_ventas: number;
    total_pagar_empleados: number;
    ganancia_neta: number;
    porcentaje_ganancia: number;
  };
  metodos_pago: {
    efectivo: { total: number; servicios: number; adicionales: number; ventas: number };
    transferencia: { total: number; servicios: number; adicionales: number; ventas: number };
  };
  ingresos_adicionales_detalle: {
    accesorios: number;
    servicios_ocasionales: number;
    otros: number;
    total_registros: number;
  };
  ventas_productos: {
    total_ventas: number;
    ganancia_ventas: number;
    cantidad_ventas: number;
    efectivo: number;
    transferencia: number;
  };
  servicios_por_empleado: Array<{
    empleado_id: number;
    nombre: string;
    apellido: string;
    cantidad_servicios: number;
    total_pagar: number;
    servicios: Array<{
      servicio_nombre: string;
      cantidad: number;
      precio_unitario: number;
      porcentaje_empleado: number;
      total_servicio: number;
      metodo_pago: string;
    }>;
  }>;
  estadisticas: {
    total_servicios: number;
    cantidad_empleados: number;
    promedio_por_servicio: number;
    total_ventas_productos: number;
    promedio_por_venta: number;
  };
}

interface UseDailyEarningsReturn {
  data: DailyEarningsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useDailyEarnings = (fecha: string): UseDailyEarningsReturn => {
  const [data, setData] = useState<DailyEarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, { data: DailyEarningsData; timestamp: number }>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  const fetchData = useCallback(async () => {
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      // Verificar cache
      const cached = cacheRef.current.get(fecha);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setData(cached.data);
        setIsLoading(false);
        return;
      }

      const result = await pagosService.getGananciasDiarias(fecha);
      
      // Guardar en cache
      cacheRef.current.set(fecha, { data: result, timestamp: now });
      
      setData(result);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error al cargar ganancias diarias:', err);
        setError(err.message || 'Error al cargar datos');
      }
    } finally {
      setIsLoading(false);
    }
  }, [fecha]);

  const refetch = useCallback(() => {
    // Limpiar cache para esta fecha
    cacheRef.current.delete(fecha);
    fetchData();
  }, [fecha, fetchData]);

  useEffect(() => {
    fetchData();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Limpiar cache antiguo periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of cacheRef.current.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          cacheRef.current.delete(key);
        }
      }
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, []);

  return { data, isLoading, error, refetch };
};
