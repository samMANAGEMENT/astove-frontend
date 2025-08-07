import api from "../axios";

export interface Zone {
    id: string;
    name: string;
    description: string;
    created_by: string;
    created_at: string;
    update_at?: string;
    client_id: string;
}

export interface CreateZoneData {
    name: string;
    description: string;
    client_id: string;
}

export interface UpdateZoneData {
    name: string;
    description: string;
}

export const ZoneService = {
    //Obetener todas las zonas
    getAllZones: async (): Promise<Zone[]> => {
        try {
            const response = await api.get('/zones');
            return response.data;
        } catch (error) {
            console.log('Error al obtener zonas:', error);
            throw error;
        }
    },
    //Obetner una zona por ID
    getZoneById: async (zoneId: string): Promise<Zone> => {
        try {
            const response = await api.get(`/zones/${zoneId}`);
            return response.data;
        } catch (error) {
            console.log('Error al obtener zona:', error)
            throw error;
        }
    },
    //Crear una nueva zona
    createZone: async (zoneData: CreateZoneData): Promise<Zone> => {
        try {
            const response = await api.post('/zones', zoneData);
            return response.data;
        } catch (error) {
            console.error('Error al crear zona:', error);
            throw error;
        }
    },

    // Actualizar una zona
    updateZone: async (zoneId: string, zoneData: UpdateZoneData): Promise<Zone> => {
        try {
            const response = await api.put(`/zones/${zoneId}`, zoneData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar zona:', error);
            throw error;
        }
    },

    // Eliminar una zona
    deleteZone: async (zoneId: string): Promise<void> => {
        try {
            await api.delete(`/zones/${zoneId}`);
        } catch (error) {
            console.error('Error al eliminar zona:', error);
            throw error;
        }
    },

    // Buscar zonas (para autocomplete)
    searchZones: async (query: string): Promise<Zone[]> => {
        try {
            const response = await api.get(`/zones/search?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            console.error('Error al buscar zonas:', error);
            throw error;
        }
    },
};