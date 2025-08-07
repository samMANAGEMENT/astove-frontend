import api from '../axios';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  budget: number;
  client_id: string;
  client_name?: string;
  status: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBranchData {
  name: string;
  address: string;
  city: string;
  budget: number;
  client_id: string;
  email: string;
}

export const branchService = {
  // Obtener todas las sucursales del usuario autenticado
  getAllBranches: async (): Promise<Branch[]> => {
    try {
      const response = await api.get('/branches');
      return response.data;
    } catch (error) {
      console.error('Error al obtener sucursales:', error);
      throw error;
    }
  },

  // Obtener sucursales de un cliente específico
  getBranchesByClient: async (clientId: string): Promise<Branch[]> => {
    try {
      const response = await api.get(`/clients/${clientId}/branches`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener sucursales:', error);
      throw error;
    }
  },

  // Crear una nueva sucursal
  createBranch: async (branchData: CreateBranchData): Promise<Branch> => {
    try {
      const response = await api.post('/branches', branchData);
      return response.data;
    } catch (error) {
      console.error('Error al crear sucursal:', error);
      throw error;
    }
  },

  // Actualizar una sucursal
  updateBranch: async (branchId: string, branchData: Partial<CreateBranchData>): Promise<Branch> => {
    try {
      const response = await api.put(`/branches/${branchId}`, branchData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar sucursal:', error);
      throw error;
    }
  },

  // Eliminar una sucursal
  deleteBranch: async (branchId: string): Promise<void> => {
    try {
      await api.delete(`/branches/${branchId}`);
    } catch (error) {
      console.error('Error al eliminar sucursal:', error);
      throw error;
    }
  },

  // Obtener detalles de una sucursal
  getBranchById: async (branchId: string): Promise<Branch> => {
    try {
      const response = await api.get(`/branches/${branchId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener sucursal:', error);
      throw error;
    }
  },
};

export const clientService = {
  // Obtener todos los clientes del usuario autenticado
  getUserClients: async (): Promise<Client[]> => {
    try {
      const response = await api.get('/clients');
      return response.data;
    } catch (error) {
      console.error('Error al obtener clientes del usuario:', error);
      throw error;
    }
  },

  // Buscar clientes del usuario (para el autocomplete)
  searchUserClients: async (query: string): Promise<Client[]> => {
    try {
      const response = await api.get(`/clients/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      throw error;
    }
  },

  // Obtener todos los clientes (método legacy)
  getAllClients: async (): Promise<Client[]> => {
    try {
      const response = await api.get('/clients');
      return response.data;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  },
}; 