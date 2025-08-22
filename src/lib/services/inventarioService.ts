import api from '../axios';

export interface Inventario {
  id: number;
  nombre: string;
  cantidad: number;
  costo_unitario: number;
  valor_total: number;
  estado: 'activo' | 'inactivo' | 'agotado';
  estado_calculado: string;
  estado_color: string;
  entidad_id: number;
  creado_por: number;
  created_at: string;
  updated_at: string;
  entidad?: {
    id: number;
    nombre: string;
  };
  creado_por_user?: {
    id: number;
    email: string;
  };
}

export interface CreateInventarioData {
  nombre: string;
  cantidad: number;
  costo_unitario: number;
  estado?: 'activo' | 'inactivo' | 'agotado';
  entidad_id?: number;
}

export interface UpdateInventarioData extends Partial<CreateInventarioData> {}

export interface InventarioResponse {
  data: Inventario[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    from: number;
    to: number;
  };
}

export interface EstadisticasInventario {
  total_articulos: number;
  total_cantidad: number;
  valor_total_inventario: number;
  articulos_agotados: number;
  articulos_activos: number;
  articulos_inactivos: number;
}

export interface InventarioMovimiento {
  id: number;
  inventario_id: number;
  usuario_id: number;
  tipo: 'entrada' | 'salida';
  cantidad_anterior: number;
  cantidad_movimiento: number;
  cantidad_nueva: number;
  created_at: string;
  usuario: {
    id: number;
    email: string;
  };
}

export interface MovimientosResponse {
  data: InventarioMovimiento[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    from: number;
    to: number;
  };
}

const getAll = async (params?: {
  page?: number;
  per_page?: number;
  search?: string;
}): Promise<InventarioResponse> => {
  const response = await api.get('/inventario/listar-inventario', { params });
  return response.data;
};

const getById = async (id: number): Promise<Inventario> => {
  const response = await api.get(`/inventario/obtener-inventario/${id}`);
  return response.data;
};

const create = async (inventarioData: CreateInventarioData): Promise<Inventario> => {
  const response = await api.post('/inventario/crear-inventario', inventarioData);
  return response.data.data;
};

const update = async (id: number, inventarioData: UpdateInventarioData): Promise<Inventario> => {
  const response = await api.put(`/inventario/actualizar-inventario/${id}`, inventarioData);
  return response.data.data;
};

const remove = async (id: number): Promise<void> => {
  await api.delete(`/inventario/eliminar-inventario/${id}`);
};

const getEstadisticas = async (): Promise<EstadisticasInventario> => {
  const response = await api.get('/inventario/estadisticas');
  return response.data;
};

const actualizarStock = async (id: number, cantidad: number, tipo: 'agregar' | 'reducir'): Promise<Inventario> => {
  const response = await api.put(`/inventario/actualizar-stock/${id}`, { cantidad, tipo });
  return response.data.data;
};

const cambiarEstado = async (id: number, estado: string): Promise<Inventario> => {
  const response = await api.put(`/inventario/cambiar-estado/${id}`, { estado });
  return response.data;
};

const getMovimientos = async (
  id: number,
  params?: {
    page?: number;
    per_page?: number;
  }
): Promise<MovimientosResponse> => {
  const response = await api.get(`/inventario/movimientos/${id}`, { params });
  return response.data;
};

export const inventarioService = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  getEstadisticas,
  actualizarStock,
  cambiarEstado,
  getMovimientos
};
