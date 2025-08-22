import axios from '../axios';

export interface Entidad {
  id: number;
  nombre: string;
  direccion?: string;
  estado: boolean;
  created_at: string;
  updated_at: string;
}

class EntidadesService {
  async getEntidades(): Promise<Entidad[]> {
    const response = await axios.get('/entidad/listar-entidades');
    return response.data.entidades || [];
  }
}

export default new EntidadesService(); 