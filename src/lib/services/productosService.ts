import api from '../axios';

export interface Producto {
  id: number;
  nombre: string;
  categoria_id: number;
  precio_unitario: number;
  costo_unitario: number;
  stock: number;
  ganancia: number;
  ganancia_total: number;
  stock_status: 'success' | 'warning' | 'danger';
  created_at: string;
  updated_at: string;
  categoria?: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
}

export interface CreateProductoData {
  nombre: string;
  categoria_id: number;
  precio_unitario: number;
  costo_unitario: number;
  stock: number;
}

export interface UpdateProductoData extends Partial<CreateProductoData> {}

export interface ProductosResponse {
  data: Producto[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    from: number;
    to: number;
  };
}

export interface EstadisticasProductos {
  total_productos: number;
  total_stock: number;
  valor_total_inventario: number;
  ganancia_total_potencial: number;
  productos_bajo_stock: number;
  productos_stock_optimo: number;
}

const getAll = async (params?: {
  page?: number;
  per_page?: number;
  search?: string;
  categoria_id?: number;
}): Promise<ProductosResponse> => {
  const response = await api.get('/productos/listar-productos', { params });
  return response.data;
};

const getById = async (id: number): Promise<Producto> => {
  const response = await api.get(`/productos/obtener-producto/${id}`);
  return response.data;
};

const create = async (productoData: CreateProductoData): Promise<Producto> => {
  const response = await api.post('/productos/crear-producto', productoData);
  return response.data.data;
};

const update = async (id: number, productoData: UpdateProductoData): Promise<Producto> => {
  const response = await api.put(`/productos/actualizar-producto/${id}`, productoData);
  return response.data.data;
};

const remove = async (id: number): Promise<void> => {
  await api.delete(`/productos/eliminar-producto/${id}`);
};

const getEstadisticas = async (): Promise<EstadisticasProductos> => {
  const response = await api.get('/productos/estadisticas');
  return response.data;
};

const updateStock = async (id: number, cantidad: number): Promise<Producto> => {
  const response = await api.put(`/productos/actualizar-stock/${id}`, { cantidad });
  return response.data.data;
};

export const productosService = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  getEstadisticas,
  updateStock,
};
