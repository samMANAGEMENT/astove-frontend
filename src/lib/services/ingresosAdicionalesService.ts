import axios from '../axios';

export interface IngresoAdicional {
  id: number;
  concepto: string;
  monto: number;
  metodo_pago: 'efectivo' | 'transferencia' | 'mixto';
  monto_efectivo: number;
  monto_transferencia: number;
  tipo: 'accesorio' | 'servicio_ocasional' | 'otro';
  categoria?: string;
  descripcion?: string;
  empleado_id?: number;
  operador_id?: number;
  servicio_realizado_id?: number;
  fecha: string;
  empleado?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  operador?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  servicio_realizado?: {
    id: number;
    servicio?: {
      id: number;
      nombre: string;
      precio: number;
    };
  };
}

export interface CrearIngresoAdicionalData {
  concepto: string;
  monto: number;
  metodo_pago: 'efectivo' | 'transferencia' | 'mixto';
  monto_efectivo: number;
  monto_transferencia: number;
  tipo: 'accesorio' | 'servicio_ocasional' | 'otro';
  categoria?: string;
  descripcion?: string;
  empleado_id?: number;
  operador_id?: number;
  fecha: string;
}

export interface TotalesIngresosAdicionales {
  efectivo: number;
  transferencia: number;
  total_general: number;
  por_tipo: {
    accesorios: number;
    servicios_ocasionales: number;
    otros: number;
  };
  mes: string;
  anio: string;
}

interface CajaMenorTotal {
  total: string;
  ultimo_registro: Ultimoregistro;
}

interface Ultimoregistro {
  id: number;
  monto: string;
  entidad_id: number;
  operador_id: number;
  servicio_id: number;
  metodo_pago: string;
  monto_efectivo: string;
  monto_transferencia: string;
  fecha: string;
  observaciones: null;
  created_at: string;
  updated_at: string;
  entidad: Entidad;
  servicio: Servicio;
}

interface Servicio {
  id: number;
  nombre: string;
  precio: number;
  created_at: string;
  updated_at: string;
  estado: boolean;
  porcentaje_pago_empleado: string;
  entidad_id: number;
}

interface Entidad {
  id: number;
  nombre: string;
  direccion: null;
  estado: boolean;
  created_at: string;
  updated_at: string;
}


class IngresosAdicionalesService {
  async crearIngresoAdicional(data: CrearIngresoAdicionalData): Promise<IngresoAdicional> {
    const response = await axios.post('/servicios/crear-ingreso-adicional', data);
    return response.data;
  }

  async listarIngresosAdicionales(): Promise<IngresoAdicional[]> {
    const response = await axios.get('/servicios/listar-ingresos-adicionales');
    return response.data;
  }

  async totalIngresosAdicionales(): Promise<TotalesIngresosAdicionales> {
    const response = await axios.get('/servicios/total-ingresos-adicionales');
    return response.data;
  }

  async eliminarIngresoAdicional(id: number): Promise<void> {
    const response = await axios.delete(`/servicios/eliminar-ingreso-adicional/${id}`);
    return response.data;
  }

  async estadisticasCompletas(): Promise<any> {
    const response = await axios.get('/servicios/estadisticas-completas');
    return response.data;
  }

  async getCajaMenorTotal(): Promise<string> {
    const response = await axios.get('/caja-menor/listar-cajas');
    return response.data.total;
  }

  async getCajaMenorTotalObjeto(entidadId: number): Promise<CajaMenorTotal> {
    const response = await axios.get(`/caja-menor/listar-cajas/${entidadId}`);
    return response.data;
  }

}

export default new IngresosAdicionalesService(); 