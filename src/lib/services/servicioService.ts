import api from '../axios';

export interface Servicio {
  id: number;
  nombre: string;
  precio: number;
  estado: boolean;
  porcentaje_pago_empleado: string;
  created_at: string;
  updated_at: string;
}

const getAll = async (): Promise<Servicio[]> => {
  const response = await api.get('/servicios/listar-servicio');
  return response.data;
};

interface CreateServicioData {
  nombre: string;
  precio: number;
  estado: boolean;
  porcentaje_pago_empleado: number;
}

const createService = async (data: CreateServicioData): Promise<Servicio> => {
  const response = await api.post('/servicios/crear-servicio', data);
  return response.data;
};

export const servicioService = {
  getAll,
  createService,
  updateService: async (id: number, data: CreateServicioData): Promise<Servicio> => {
    const response = await api.put(`/servicios/modificar-servicio/${id}`, data);
    return response.data;
  },
  deleteServicioRealizado: async (id: number): Promise<{ message: string; id: number }> => {
    const response = await api.delete(`/servicios/eliminar-servicio-realizado/${id}`);
    return response.data;
  },
};

export default servicioService;