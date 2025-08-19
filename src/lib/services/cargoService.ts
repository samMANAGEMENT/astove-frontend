import api from '../axios';

export interface Cargo {
  id: number;
  nombre: string;
  sueldo_base: string;
  created_at: string;
  updated_at: string;
}

const getAll = async (): Promise<Cargo[]> => {
  const response = await api.get('/cargo/listar-cargo');
  return response.data;
};

export const cargoService = {
  getAll,
};

export default cargoService;
