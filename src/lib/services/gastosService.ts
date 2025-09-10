import axios from '../axios';

export interface Gasto {
  id: number;
  entidad_id: number;
  descripcion: string;
  monto: number;
  fecha: string;
  metodo_pago: string;
  created_at: string;
  updated_at: string;
  entidad?: {
    id: number;
    nombre: string;
  };
}

export interface CrearGastoData {
  descripcion: string;
  monto: number;
  fecha: string;
  metodo_pago: string;
}

export interface GastosResponse {
  data: Gasto[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    from: number;
    to: number;
  };
}

export interface EstadisticasGastos {
  total_gastos_mes: number;
  total_gastos_anio: number;
  gastos_recientes: Gasto[];
  mes: number;
  anio: number;
}

const crearGasto = async (gastoData: CrearGastoData): Promise<Gasto> => {
  const response = await axios.post('/gastos/crear', gastoData);
  return response.data.data;
};

const listarGastos = async (params?: {
  page?: number;
  per_page?: number;
  search?: string;
}): Promise<GastosResponse> => {
  const response = await axios.get('/gastos/listar', { params });
  return response.data.data;
};

const obtenerGasto = async (id: number): Promise<Gasto> => {
  const response = await axios.get(`/gastos/obtener/${id}`);
  return response.data.data;
};

const actualizarGasto = async (id: number, gastoData: CrearGastoData): Promise<Gasto> => {
  const response = await axios.put(`/gastos/actualizar/${id}`, gastoData);
  return response.data.data;
};

const eliminarGasto = async (id: number): Promise<void> => {
  await axios.delete(`/gastos/eliminar/${id}`);
};

const obtenerEstadisticas = async (): Promise<EstadisticasGastos> => {
  const response = await axios.get('/gastos/estadisticas');
  return response.data.data;
};

const totalGastosMes = async (): Promise<{ total_gastos_mes: number }> => {
  const response = await axios.get('/gastos/total-mes');
  return response.data.data;
};

const gastosService = {
  crearGasto,
  listarGastos,
  obtenerGasto,
  actualizarGasto,
  eliminarGasto,
  obtenerEstadisticas,
  totalGastosMes
};

export default gastosService;
