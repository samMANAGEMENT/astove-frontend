import api from '../axios';

export interface Operador {
  id: number;
  nombre: string;
  apellido: string;
  entidad_id: number;
  telefono: string;
  cargo_id: number;
  created_at: string;
  updated_at: string;
  entidades: {
    id: number;
    nombre: string;
    direccion: string | null;
    estado: boolean;
    created_at: string;
    updated_at: string;
  };
  cargo: {
    id: number;
    nombre: string;
    sueldo_base: string;
    created_at: string;
    updated_at: string;
  };
  usuario: {
    id: number;
    name: string;
    email: string;
  } | null;
}

const getAll = async (): Promise<Operador[]> => {
  const response = await api.get('/operadores/listar-operador');
  return response.data;
};

interface CreateOperadorData {
  nombre: string;
  apellido: string;
  entidad_id: number;
  telefono: string;
  cargo_id: number;
}

const createOperador = async (data: CreateOperadorData): Promise<Operador> => {
  const response = await api.post('/operadores/crear-operador', data);
  return response.data;
};

export const operadoresService = {
  getAll,
  createOperador,
  updateOperador: async (id: number, data: CreateOperadorData): Promise<Operador> => {
    const response = await api.put(`/operadores/modificar-operador/${id}`, data);
    return response.data;
  },
};

export default operadoresService; 