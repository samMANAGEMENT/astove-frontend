import React, { useState, useEffect } from 'react';
import { X, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { Modal, Button, Input, Spinner } from './ui';
import { pagosService, type ServicioPendiente, type CreatePagoSemanalData } from '../lib/services/pagosService';
import { toast } from 'react-toastify';

interface PagoSemanalModalProps {
  isOpen: boolean;
  onClose: () => void;
  empleado: {
    empleado_id: number;
    nombre: string;
    apellido: string;
    total_pagar: number;
    saldo_pendiente: number;
    pagos_realizados: number;
  } | null;
  onPagoRealizado: () => void;
}

const PagoSemanalModal: React.FC<PagoSemanalModalProps> = ({
  isOpen,
  onClose,
  empleado,
  onPagoRealizado
}) => {
  const [tipoPago, setTipoPago] = useState<'total' | 'parcial'>('total');
  const [monto, setMonto] = useState('');
  const [serviciosPendientes, setServiciosPendientes] = useState<ServicioPendiente[]>([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingServicios, setIsLoadingServicios] = useState(false);

  useEffect(() => {
    if (isOpen && empleado) {
      cargarServiciosPendientes();
      setMonto(empleado.saldo_pendiente.toString());
    }
  }, [isOpen, empleado]);

  const cargarServiciosPendientes = async () => {
    if (!empleado) return;
    
    setIsLoadingServicios(true);
    try {
      const servicios = await pagosService.getServiciosPendientesEmpleado(empleado.empleado_id);
      setServiciosPendientes(servicios);
    } catch (error) {
      toast.error('Error al cargar servicios pendientes');
    } finally {
      setIsLoadingServicios(false);
    }
  };

  const handleTipoPagoChange = (tipo: 'total' | 'parcial') => {
    setTipoPago(tipo);
    if (tipo === 'total') {
      setMonto(empleado?.saldo_pendiente.toString() || '');
      setServiciosSeleccionados([]);
    } else {
      setMonto('');
      setServiciosSeleccionados([]);
    }
  };

  const handleServicioToggle = (servicioId: number) => {
    setServiciosSeleccionados(prev => {
      const newSelection = prev.includes(servicioId)
        ? prev.filter(id => id !== servicioId)
        : [...prev, servicioId];
      
      // Calcular monto total de servicios seleccionados
      const montoTotal = serviciosPendientes
        .filter(s => newSelection.includes(s.id))
        .reduce((sum, s) => sum + s.monto_empleado, 0);
      
      setMonto(montoTotal.toString());
      return newSelection;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!empleado || !monto || Number(monto) <= 0) {
      toast.error('Por favor ingresa un monto válido');
      return;
    }

    if (tipoPago === 'parcial' && serviciosSeleccionados.length === 0) {
      toast.error('Por favor selecciona al menos un servicio');
      return;
    }

    setIsLoading(true);
    try {
      const data: CreatePagoSemanalData = {
        empleado_id: empleado.empleado_id,
        monto: Number(monto),
        tipo_pago: tipoPago,
        servicios_incluidos: tipoPago === 'parcial' ? serviciosSeleccionados : undefined
      };

      await pagosService.crearPagoSemanal(data);
      toast.success('Pago registrado exitosamente');
      onPagoRealizado();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Error al registrar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  const montoTotalSeleccionado = serviciosPendientes
    .filter(s => serviciosSeleccionados.includes(s.id))
    .reduce((sum, s) => sum + s.monto_empleado, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pago Semanal" size="lg">
      {!empleado ? (
        <div className="text-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del empleado */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 text-blue-700 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                {empleado.nombre[0]}{empleado.apellido[0]}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{empleado.nombre} {empleado.apellido}</h3>
                <p className="text-sm text-gray-600">
                  Saldo pendiente: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(empleado.saldo_pendiente)}
                  {empleado.pagos_realizados > 0 && (
                    <span className="text-blue-600 ml-2">
                      (Ya pagado: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(empleado.pagos_realizados)})
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Tipo de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Pago</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTipoPagoChange('total')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  tipoPago === 'total'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-500'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`w-5 h-5 ${tipoPago === 'total' ? 'text-blue-700' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <div className={`font-medium ${tipoPago === 'total' ? 'text-blue-700' : 'text-gray-500'}`}>Pago Total</div>
                    <div className={`text-sm ${tipoPago === 'total' ? 'text-blue-600' : 'text-gray-400'}`}>Todo el pendiente</div>
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => handleTipoPagoChange('parcial')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  tipoPago === 'parcial'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-500'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className={`w-5 h-5 ${tipoPago === 'parcial' ? 'text-orange-700' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <div className={`font-medium ${tipoPago === 'parcial' ? 'text-orange-700' : 'text-gray-500'}`}>Pago Parcial</div>
                    <div className={`text-sm ${tipoPago === 'parcial' ? 'text-orange-600' : 'text-gray-400'}`}>Servicios específicos</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monto a Pagar</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0"
                className="pl-10"
                disabled={tipoPago === 'total'}
              />
            </div>
            {tipoPago === 'parcial' && (
              <p className="text-sm text-gray-500 mt-1">
                Selecciona los servicios que quieres incluir en este pago
              </p>
            )}
          </div>

          {/* Servicios pendientes (solo para pago parcial) */}
          {tipoPago === 'parcial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Servicios Pendientes</label>
              {isLoadingServicios ? (
                <div className="flex justify-center py-4">
                  <Spinner size="md" />
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {serviciosPendientes.map((servicio) => (
                    <div
                      key={servicio.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        serviciosSeleccionados.includes(servicio.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleServicioToggle(servicio.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{servicio.servicio_nombre}</div>
                          <div className="text-sm text-gray-600">
                            Cantidad: {servicio.cantidad} | {servicio.porcentaje_empleado}% | {new Date(servicio.fecha).toLocaleDateString('es-CO')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-700">
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(servicio.monto_empleado)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(servicio.monto_servicio)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {serviciosSeleccionados.length > 0 && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-700">Total seleccionado:</span>
                    <span className="font-bold text-green-700">
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(montoTotalSeleccionado)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !monto || Number(monto) <= 0} className="flex items-center gap-2">
              {isLoading && <Spinner size="sm" />}
              Registrar Pago
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default PagoSemanalModal; 