import apiClient from '../axios';

export interface Operador {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  cargo_id: number;
  entidad_id: number;
}

export interface Agenda {
  id: number;
  operador_id: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  operador?: Operador;
  horarios?: Horario[];
  created_at: string;
  updated_at: string;
}

export interface Horario {
  id: number;
  agenda_id: number;
  titulo: string;
  hora_inicio: string;
  hora_fin: string;
  dia_semana: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
  color: string;
  notas?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrearAgendaData {
  operador_id: number;
  nombre: string;
  descripcion?: string;
  activa?: boolean;
}

export interface CrearHorarioData {
  agenda_id: number;
  titulo: string;
  hora_inicio: string;
  hora_fin: string;
  dia_semana: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
  color?: string;
  notas?: string;
  activo?: boolean;
}

export interface Cita {
  id: number;
  agenda_id: number;
  horario_id: number;
  cliente_nombre: string;
  cliente_telefono?: string;
  cliente_email?: string;
  servicio: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'confirmada' | 'pendiente' | 'cancelada' | 'completada';
  notas?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CrearCitaData {
  agenda_id: number;
  horario_id: number;
  cliente_nombre: string;
  cliente_telefono?: string;
  cliente_email?: string;
  servicio: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado?: 'confirmada' | 'pendiente' | 'cancelada' | 'completada';
  notas?: string;
}

class AgendaService {
  async getAll(): Promise<Agenda[]> {
    const response = await apiClient.get('/agenda/listar-agendas');
    return response.data;
  }

  async getById(id: number): Promise<Agenda> {
    const response = await apiClient.get(`/agenda/obtener-agenda/${id}`);
    return response.data;
  }

  async create(data: CrearAgendaData): Promise<Agenda> {
    const response = await apiClient.post('/agenda/crear-agenda', data);
    return response.data;
  }

  async update(id: number, data: Partial<CrearAgendaData>): Promise<Agenda> {
    const response = await apiClient.put(`/agenda/modificar-agenda/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/agenda/eliminar-agenda/${id}`);
    return response.data;
  }

  async createHorario(data: CrearHorarioData): Promise<Horario> {
    const response = await apiClient.post('/agenda/crear-horario', data);
    return response.data;
  }

  async updateHorario(id: number, data: Partial<CrearHorarioData>): Promise<Horario> {
    const response = await apiClient.put(`/agenda/modificar-horario/${id}`, data);
    return response.data;
  }

  async deleteHorario(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/agenda/eliminar-horario/${id}`);
    return response.data;
  }

  async getHorariosByAgenda(agendaId: number): Promise<Horario[]> {
    const response = await apiClient.get(`/agenda/horarios-agenda/${agendaId}`);
    return response.data;
  }

  async consultarEspaciosDisponibles(agendaId: number, fecha?: string): Promise<any> {
    const params = fecha ? `?fecha=${fecha}` : '';
    const response = await apiClient.get(`/agenda/consultar-espacios/${agendaId}${params}`);
    return response.data;
  }

  async obtenerCalendarioAgenda(agendaId: number, mes?: number, anio?: number): Promise<any> {
    const params = new URLSearchParams();
    if (mes) params.append('mes', mes.toString());
    if (anio) params.append('anio', anio.toString());
    
    const response = await apiClient.get(`/agenda/calendario/${agendaId}?${params.toString()}`);
    return response.data;
  }

  async crearCita(data: CrearCitaData): Promise<Cita> {
    const response = await apiClient.post('/agenda/crear-cita', data);
    return response.data;
  }

  async actualizarCita(id: number, data: Partial<CrearCitaData>): Promise<Cita> {
    const response = await apiClient.put(`/agenda/actualizar-cita/${id}`, data);
    return response.data;
  }

  async eliminarCita(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/agenda/eliminar-cita/${id}`);
    return response.data;
  }

  async obtenerDisponibilidadTiempoReal(fecha?: string): Promise<any> {
    const params = fecha ? `?fecha=${fecha}` : '';
    const response = await apiClient.get(`/agenda/disponibilidad-tiempo-real${params}`);
    return response.data;
  }
}

export default new AgendaService();
