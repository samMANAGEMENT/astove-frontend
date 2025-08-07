import api from '../axios';

export interface Client {
  id: string;
  name: string;
  business_name: string;
  nit: string;
  address: string;
  phone: string;
  order_start_date: number;
  order_end_date: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  name: string;
  business_name: string;
  nit: string;
  address: string;
  phone: string;
  email: string;
  password: string;
}

export interface UpdateClientData {
  name?: string;
  business_name?: string;
  nit?: string;
  address?: string;
  phone?: string;
  order_start_date?: number;
  order_end_date?: number;
  email?: string;
  password?: string;
}

export const clientService = {
  // Obtener todos los clientes
  getAllClients: async (): Promise<Client[]> => {
    try {
      const response = await api.get('/clients');
      return response.data;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  },

  // Obtener un cliente por ID
  getClientById: async (clientId: string): Promise<Client> => {
    try {
      const response = await api.get(`/clients/${clientId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      throw error;
    }
  },

  // Crear un nuevo cliente
  createClient: async (clientData: CreateClientData): Promise<Client> => {
    try {
      const response = await api.post('/clients', clientData);
      return response.data;
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw error;
    }
  },

  // Actualizar un cliente
  updateClient: async (clientId: string, clientData: UpdateClientData): Promise<Client> => {
    try {
      const response = await api.put(`/clients/${clientId}`, clientData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      throw error;
    }
  },

  // Eliminar un cliente
  deleteClient: async (clientId: string): Promise<void> => {
    try {
      await api.delete(`/clients/${clientId}`);
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      throw error;
    }
  },

  // Buscar clientes (para autocomplete)
  searchClients: async (query: string): Promise<Client[]> => {
    try {
      const response = await api.get(`/clients/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      throw error;
    }
  },
}; 