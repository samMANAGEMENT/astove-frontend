import api from '../axios';

export interface Pago {
  id: number;
  empleado_id: number;
  monto: number;
  fecha: string;
  estado: boolean;
  created_at: string;
  updated_at: string;
  empleado: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

export interface CreatePagoData {
  empleado_id: number;
  monto: number;
  fecha: string; // formato: DD-MM-YYYY
  estado: boolean;
}

const getAll = async (): Promise<Pago[]> => {
  const response = await api.get('/pagos/listar-pagos');
  return response.data;
};

const create = async (pagoData: CreatePagoData): Promise<Pago> => {
  const response = await api.post('/pagos/crear-pago', pagoData);
  return response.data;
};

export const pagosService = {
  getAll,
  create,
};

export default pagosService; 