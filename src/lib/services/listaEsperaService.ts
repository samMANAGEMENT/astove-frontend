import apiClient from '../axios';

export interface PersonaListaEspera {
  id: number;
  nombre: string;
  servicio: string;
  telefono?: string;
  notas?: string;
  fecha: string;
  created_at: string;
  updated_at: string;
}

export interface CrearPersonaListaEsperaData {
  nombre: string;
  servicio: string;
  telefono?: string;
  notas?: string;
  fecha: string;
}

const listaEsperaService = {
  // Obtener lista de espera por fecha
  async getByFecha(fecha: string): Promise<PersonaListaEspera[]> {
    const response = await apiClient.get(`/lista-espera/personas-por-fecha/${fecha}`);
    return response.data.data;
  },

  // Crear nueva persona en lista de espera
  async create(data: CrearPersonaListaEsperaData): Promise<PersonaListaEspera> {
    const response = await apiClient.post('/lista-espera/crear-persona', data);
    return response.data.data;
  },

  // Actualizar persona en lista de espera
  async update(id: number, data: Partial<CrearPersonaListaEsperaData>): Promise<PersonaListaEspera> {
    const response = await apiClient.put(`/lista-espera/modificar-persona/${id}`, data);
    return response.data.data;
  },

  // Eliminar persona de lista de espera
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/lista-espera/eliminar-persona/${id}`);
  },

  // Obtener todas las personas en lista de espera
  async getAll(): Promise<PersonaListaEspera[]> {
    const response = await apiClient.get('/lista-espera/listar-personas');
    return response.data.data;
  },
};

export default listaEsperaService;
