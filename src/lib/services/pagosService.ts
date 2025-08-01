import api from '../axios';

export interface PagoEmpleado {
  empleado_id: number;
  nombre: string;
  apellido: string;
  total_pagar: number;
}

export interface PagoEmpleadoCompleto {
  empleado_id: number;
  nombre: string;
  apellido: string;
  total_bruto: number;
  total_pagar: number;
  cantidad_servicios: number;
  detalles_servicios: DetalleServicio[];
}

export interface EstadoPagoEmpleado {
  empleado_id: number;
  nombre: string;
  apellido: string;
  total_bruto: number;
  total_pagar: number;
  pagos_realizados: number;
  saldo_pendiente: number;
  estado_pago: 'pagado' | 'parcial' | 'pendiente';
  cantidad_servicios: number;
  detalles_servicios: DetalleServicio[];
}

export interface PagoHistorico {
  id: number;
  empleado_id: number;
  empleado: {
    id: number;
    nombre: string;
    apellido: string;
  };
  monto: number;
  fecha: string;
  estado: boolean;
  tipo_pago: 'total' | 'parcial';
  monto_pendiente_antes: number;
  monto_pendiente_despues: number;
  semana_pago: string | null;
  created_at: string;
}

export interface DetalleServicio {
  servicio_id: number;
  servicio_nombre: string;
  cantidad: number;
  porcentaje_empleado: number;
  monto_servicio: number;
  monto_empleado: number;
}

export interface ServicioPendiente {
  id: number;
  servicio_nombre: string;
  cantidad: number;
  fecha: string;
  porcentaje_empleado: number;
  monto_servicio: number;
  monto_empleado: number;
}

export interface CreatePagoSemanalData {
  empleado_id: number;
  monto: number;
  tipo_pago: 'total' | 'parcial';
  servicios_incluidos?: number[];
}

export interface GananciaNeta {
  ingresos_totales: number;
  total_pagar_empleados: number;
  ganancia_neta: number;
  porcentaje_ganancia: number;
  mes: string;
  anio: string;
}

const getPagosEmpleados = async (): Promise<PagoEmpleado[]> => {
  const response = await api.get('/servicios/total-pagar-operador');
  return response.data;
};

const getPagosEmpleadosCompleto = async (): Promise<PagoEmpleadoCompleto[]> => {
  const response = await api.get('/servicios/total-pagar-operador-completo');
  return response.data;
};

const getGananciaNeta = async (): Promise<GananciaNeta> => {
  const response = await api.get('/servicios/ganancia-neta');
  return response.data;
};

const getServiciosPendientesEmpleado = async (empleadoId: number): Promise<ServicioPendiente[]> => {
  const response = await api.get(`/pagos/servicios-pendientes/${empleadoId}`);
  return response.data;
};

const getServiciosEmpleado = async (empleadoId: number): Promise<any[]> => {
  const response = await api.get(`/pagos/servicios-empleado/${empleadoId}`);
  return response.data;
};

const crearPagoSemanal = async (data: CreatePagoSemanalData): Promise<any> => {
  const response = await api.post('/pagos/crear-pago-semanal', data);
  return response.data;
};

const getTotalGanado = async (): Promise<{ total_ganado: number }> => {
  const response = await api.get('/servicios/total-ganado');
  return response.data;
};

const getEstadoPagosEmpleados = async (): Promise<EstadoPagoEmpleado[]> => {
  const response = await api.get('/pagos/estado-empleados');
  return response.data;
};

const getAllPagos = async (): Promise<PagoHistorico[]> => {
  const response = await api.get('/pagos/listar-pagos');
  return response.data;
};

export const pagosService = {
  getPagosEmpleados,
  getPagosEmpleadosCompleto,
  getGananciaNeta,
  getTotalGanado,
  getServiciosPendientesEmpleado,
  getServiciosEmpleado,
  crearPagoSemanal,
  getEstadoPagosEmpleados,
  getAllPagos,
};

export default pagosService; 