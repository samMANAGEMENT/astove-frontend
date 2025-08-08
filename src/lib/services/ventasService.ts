import api from '../axios';

export interface Venta {
  id: number;
  total: number;
  ganancia_total: number;
  empleado_id: number;
  metodo_pago: 'efectivo' | 'transferencia' | 'mixto';
  monto_efectivo: number;
  monto_transferencia: number;
  observaciones?: string;
  fecha: string;
  created_at: string;
  updated_at: string;
  empleado?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  productos?: Array<{
    id: number;
    nombre: string;
    precio_unitario: number;
    costo_unitario: number;
    stock: number;
    pivot: {
      cantidad: number;
      subtotal: number;
    };
  }>;
}

export interface CrearVentaData {
  productoId: number;
  cantidad: number;
  metodoPago: 'efectivo' | 'transferencia' | 'mixto';
  montoEfectivo?: number;
  montoTransferencia?: number;
  observaciones?: string;
}

export interface VentasResponse {
  data: Venta[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    from: number;
    to: number;
  };
}

export interface EstadisticasVentas {
  total_ventas: number;
  total_ganancia: number;
  ventas_hoy: number;
  ganancia_hoy: number;
  ventas_por_metodo: Array<{
    metodo_pago: string;
    total: number;
  }>;
}

const crearVenta = async (ventaData: CrearVentaData): Promise<Venta> => {
  const response = await api.post('/ventas/crear-venta', ventaData);
  return response.data.data;
};

const listarVentas = async (params?: {
  page?: number;
  per_page?: number;
  search?: string;
}): Promise<VentasResponse> => {
  const response = await api.get('/ventas/listar-ventas', { params });
  return response.data;
};

const obtenerVenta = async (id: number): Promise<Venta> => {
  const response = await api.get(`/ventas/obtener-venta/${id}`);
  return response.data;
};

const eliminarVenta = async (id: number): Promise<void> => {
  await api.delete(`/ventas/eliminar-venta/${id}`);
};

const obtenerEstadisticas = async (): Promise<EstadisticasVentas> => {
  const response = await api.get('/ventas/estadisticas');
  return response.data;
};

export const ventasService = {
  crearVenta,
  listarVentas,
  obtenerVenta,
  eliminarVenta,
  obtenerEstadisticas,
};
