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
}

export default new IngresosAdicionalesService(); 