import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Calendar,
  CreditCard,
  PlusCircle,
} from 'lucide-react';
import { Spinner, Badge, Button } from '../components/ui';
import { useApi } from '../hooks/useApi';
import { useEffect } from 'react';
import { pagosService, type GananciaNeta, type EstadoPagoEmpleado } from '../lib/services/pagosService';
import ingresosAdicionalesService from '../lib/services/ingresosAdicionalesService';
import PagoSemanalModal from '../components/PagoSemanalModal';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Estados para los datos
  const [gananciaNeta, setGananciaNeta] = React.useState<GananciaNeta | null>(null);
  const [estadoPagos, setEstadoPagos] = React.useState<EstadoPagoEmpleado[]>([]);

  const [isLoadingGanancia, setIsLoadingGanancia] = React.useState(true);
  const [isLoadingPagos, setIsLoadingPagos] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = React.useState<EstadoPagoEmpleado | null>(null);
  const [estadisticasCompletas, setEstadisticasCompletas] = React.useState<any>(null);
  const [isLoadingEstadisticas, setIsLoadingEstadisticas] = React.useState(true);

  // Hook para total ganado
  const totalGanadoApi = useApi();
  useEffect(() => {
    totalGanadoApi.get('/servicios/total-ganado');
  }, []);

  const totalGanado = totalGanadoApi.data?.total_ganado ?? null;
  const isLoadingTotal = totalGanadoApi.isLoading;

  // Hook para total a pagar por operador
  const totalPagarApi = useApi();
  useEffect(() => {
    totalPagarApi.get('/servicios/total-pagar-operador');
  }, []);


  // Hook para ganancias por método de pago
  const gananciasMetodoApi = useApi();
  useEffect(() => {
    gananciasMetodoApi.get('/servicios/ganancias-por-metodo-pago');
  }, []);
  const gananciasMetodoData = gananciasMetodoApi.data ?? null;
  const isLoadingGananciasMetodo = gananciasMetodoApi.isLoading;

  // Cargar ganancia neta
  useEffect(() => {
    const loadGananciaNeta = async () => {
      try {
        setIsLoadingGanancia(true);
        const data = await pagosService.getGananciaNeta();
        setGananciaNeta(data);
      } catch (error) {
        console.error('Error al cargar ganancia neta:', error);
      } finally {
        setIsLoadingGanancia(false);
      }
    };

    loadGananciaNeta();
  }, []);

  // Cargar estado de pagos
  useEffect(() => {
    const loadEstadoPagos = async () => {
      try {
        setIsLoadingPagos(true);
        const data = await pagosService.getEstadoPagosEmpleados();
        setEstadoPagos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar estado de pagos:', error);
        setEstadoPagos([]);
      } finally {
        setIsLoadingPagos(false);
      }
    };

    loadEstadoPagos();
  }, []);

  // Cargar estadísticas completas
  useEffect(() => {
    const loadEstadisticasCompletas = async () => {
      try {
        setIsLoadingEstadisticas(true);
        const data = await ingresosAdicionalesService.estadisticasCompletas();
        setEstadisticasCompletas(data);
      } catch (error) {
        console.error('Error al cargar estadísticas completas:', error);
      } finally {
        setIsLoadingEstadisticas(false);
      }
    };

    loadEstadisticasCompletas();
  }, []);

  const handlePagarEmpleado = (empleado: EstadoPagoEmpleado) => {
    setEmpleadoSeleccionado(empleado);
    setIsModalOpen(true);
  };

  const handlePagoRealizado = () => {
    // Recargar datos después del pago
    const loadData = async () => {
      try {
        const [gananciaData, pagosData] = await Promise.all([
          pagosService.getGananciaNeta(),
          pagosService.getEstadoPagosEmpleados()
        ]);
        setGananciaNeta(gananciaData);
        setEstadoPagos(Array.isArray(pagosData) ? pagosData : []);
      } catch (error) {
        console.error('Error al recargar datos:', error);
      }
    };
    loadData();
  };

  const stats = [
    {
      title: 'Ingresos Totales',
      value: totalGanado !== null
        ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalGanado)
        : '--',
      isLoading: isLoadingTotal,
      change: '+12%',
      changeType: 'increase',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      title: 'Ganancia Neta',
      value: gananciaNeta?.ganancia_neta
        ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(gananciaNeta.ganancia_neta)
        : '--',
      isLoading: isLoadingGanancia,
      change: gananciaNeta?.porcentaje_ganancia 
        ? `${gananciaNeta.porcentaje_ganancia.toFixed(1)}%` 
        : '--',
      changeType: 'increase',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Efectivo',
      value: gananciasMetodoData?.efectivo?.total_ingresos
        ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(gananciasMetodoData.efectivo.total_ingresos)
        : '--',
      isLoading: isLoadingGananciasMetodo,
      change: gananciasMetodoData?.efectivo?.porcentaje_del_total 
        ? `${gananciasMetodoData.efectivo.porcentaje_del_total.toFixed(1)}%` 
        : '--',
      changeType: 'neutral',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-600'
    },
    {
      title: 'Transferencia',
      value: gananciasMetodoData?.transferencia?.total_ingresos
        ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(gananciasMetodoData.transferencia.total_ingresos)
        : '--',
      isLoading: isLoadingGananciasMetodo,
      change: gananciasMetodoData?.transferencia?.porcentaje_del_total 
        ? `${gananciasMetodoData.transferencia.porcentaje_del_total.toFixed(1)}%` 
        : '--',
      changeType: 'neutral',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-blue-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bienvenido a tu panel de control</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.isLoading ? <Spinner size="sm" /> : stat.value}
                </div>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'increase' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : stat.changeType === 'decrease' ? (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  ) : (
                    <div className="w-4 h-4 text-gray-400 flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                  )}
                  <span className={`text-sm font-medium ml-1 ${
                    stat.changeType === 'increase' ? 'text-green-600' : 
                    stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                  {stat.changeType !== 'neutral' && (
                    <span className="text-sm text-gray-500 ml-1">vs mes pasado</span>
                  )}
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <div className="text-white">
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pagos Detallados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pagos a Empleados</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="info">{(estadoPagos || []).length} empleados</Badge>
            </div>
          </div>
          {isLoadingPagos ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="space-y-4">
              {(estadoPagos || []).length > 0 ? (
                (estadoPagos || []).map((empleado: EstadoPagoEmpleado) => (
                  <div key={empleado.empleado_id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 text-blue-700 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                          {empleado.nombre[0]}{empleado.apellido[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{empleado.nombre} {empleado.apellido}</div>
                          <div className="text-xs text-gray-500">{empleado.cantidad_servicios} servicios</div>
                          <div className={`text-xs font-medium ${
                            empleado.estado_pago === 'pagado' ? 'text-green-600' :
                            empleado.estado_pago === 'parcial' ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {empleado.estado_pago === 'pagado' ? '✅ Pagado' :
                             empleado.estado_pago === 'parcial' ? '⚠️ Pago Parcial' : '⏳ Pendiente'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-700 text-lg">
                          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(empleado.saldo_pendiente)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Bruto: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(empleado.total_bruto)}
                        </div>
                        <div className="text-xs text-blue-600">
                          Total a pagar: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(empleado.total_pagar)}
                        </div>
                        {empleado.pagos_realizados > 0 && (
                          <div className="text-xs text-orange-600">
                            Ya pagado: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(empleado.pagos_realizados)}
                          </div>
                        )}
                        {empleado.saldo_pendiente > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 text-xs"
                            onClick={() => handlePagarEmpleado(empleado)}
                          >
                            <CreditCard className="w-3 h-3 mr-1" />
                            Pagar
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Detalles de servicios */}
                    <div className="mt-3 space-y-2">
                      {(empleado.detalles_servicios || []).slice(0, 2).map((servicio: any, index: number) => (
                        <div key={index} className="flex justify-between text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                          <span>{servicio.servicio_nombre} (x{servicio.cantidad})</span>
                          <span>{servicio.porcentaje_empleado}%</span>
                        </div>
                      ))}
                      {(empleado.detalles_servicios || []).length > 2 && (
                        <div className="text-xs text-blue-600 text-center">
                          +{(empleado.detalles_servicios || []).length - 2} servicios más
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-6">No hay empleados con pagos pendientes.</div>
              )}
            </div>
          )}
        </div>

        {/* Resumen Financiero */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Resumen Financiero</h3>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {gananciaNeta ? `${gananciaNeta.mes}/${gananciaNeta.anio}` : 'Cargando...'}
              </span>
            </div>
          </div>
          
          {isLoadingGanancia ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="md" />
            </div>
          ) : gananciaNeta ? (
            <div className="space-y-4">
              {/* Ingresos Totales */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Ingresos Totales</div>
                    <div className="text-sm text-gray-500">Este mes</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-700">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(gananciaNeta?.ingresos_totales || 0)}
                  </div>
                </div>
              </div>

              {/* Total a Pagar Empleados */}
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-500 p-2 rounded-lg">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Pagar Empleados</div>
                    <div className="text-sm text-gray-500">Este mes</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-orange-700">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(gananciaNeta?.total_pagar_empleados || 0)}
                  </div>
                </div>
              </div>

              {/* Ganancia Neta */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Ganancia Neta</div>
                    <div className="text-sm text-gray-500">{gananciaNeta?.porcentaje_ganancia?.toFixed(1) || '0.0'}% del total</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-700">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(gananciaNeta?.ganancia_neta || 0)}
                  </div>
                </div>
              </div>

              {/* Métodos de Pago */}
              {gananciasMetodoData && (
                <>
                  {/* Efectivo */}
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-500 p-2 rounded-lg">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Efectivo</div>
                        <div className="text-sm text-gray-500">{gananciasMetodoData?.efectivo?.porcentaje_del_total?.toFixed(1) || '0.0'}% del total</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-700">
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(gananciasMetodoData?.efectivo?.total_ingresos || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Transferencia */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Transferencia</div>
                        <div className="text-sm text-gray-500">{gananciasMetodoData?.transferencia?.porcentaje_del_total?.toFixed(1) || '0.0'}% del total</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-700">
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(gananciasMetodoData?.transferencia?.total_ingresos || 0)}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Barra de progreso */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Ganancia</span>
                  <span>{gananciaNeta?.porcentaje_ganancia?.toFixed(1) || '0.0'}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${gananciaNeta?.porcentaje_ganancia || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-6">No hay datos financieros disponibles.</div>
          )}
        </div>

        {/* Ingresos Adicionales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ingresos Adicionales</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="info">
                {estadisticasCompletas?.ingresos_adicionales_detalle?.total_registros || 0} registros
              </Badge>
            </div>
          </div>
          
          {isLoadingEstadisticas ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="md" />
            </div>
          ) : estadisticasCompletas ? (
            <div className="space-y-4">
              {/* Total Ingresos Adicionales */}
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <PlusCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Total Adicionales</div>
                    <div className="text-sm text-gray-500">Este mes</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-purple-700">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(estadisticasCompletas.resumen_general.ingresos_adicionales)}
                  </div>
                </div>
              </div>

              {/* Desglose por tipo */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Accesorios:</span>
                  <span className="font-semibold text-blue-700">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(estadisticasCompletas.ingresos_adicionales_detalle.accesorios)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Servicios Ocasionales:</span>
                  <span className="font-semibold text-green-700">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(estadisticasCompletas.ingresos_adicionales_detalle.servicios_ocasionales)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Otros:</span>
                  <span className="font-semibold text-orange-700">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(estadisticasCompletas?.ingresos_adicionales_detalle?.otros || 0)}
                  </span>
                </div>
              </div>

              {/* Métodos de pago */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Por Método de Pago</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">💵 Efectivo:</span>
                    <span className="font-semibold text-green-700">
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(estadisticasCompletas?.metodos_pago?.efectivo?.adicionales || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">🏦 Transferencia:</span>
                    <span className="font-semibold text-blue-700">
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(estadisticasCompletas?.metodos_pago?.transferencia?.adicionales || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Porcentaje del total */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>% del total de ingresos</span>
                  <span>
                    {estadisticasCompletas?.resumen_general?.ingresos_totales > 0 
                      ? ((estadisticasCompletas.resumen_general.ingresos_adicionales / estadisticasCompletas.resumen_general.ingresos_totales) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${estadisticasCompletas?.resumen_general?.ingresos_totales > 0 
                        ? (estadisticasCompletas.resumen_general.ingresos_adicionales / estadisticasCompletas.resumen_general.ingresos_totales) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-6">No hay datos de ingresos adicionales disponibles.</div>
          )}
        </div>
      </div>



      {/* Acciones Rápidas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Registrar Servicio', icon: <Activity className="w-5 h-5" />, color: 'bg-blue-500', route: '/servicios/registrar' },
            { label: 'Ingresos Adicionales', icon: <PlusCircle className="w-5 h-5" />, color: 'bg-purple-500', route: '/ingresos-adicionales' },
            { label: 'Ver Operadores', icon: <Users className="w-5 h-5" />, color: 'bg-green-500', route: '/operadores/lista' },
            { label: 'Ver Reportes', icon: <PieChart className="w-5 h-5" />, color: 'bg-orange-500', route: '/reportes/analytics' }
          ].map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.route)}
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <div className={`${action.color} p-2 rounded-lg mb-2`}>
                <div className="text-white">
                  {action.icon}
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal de Pago Semanal */}
      <PagoSemanalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEmpleadoSeleccionado(null);
        }}
        empleado={empleadoSeleccionado}
        onPagoRealizado={handlePagoRealizado}
      />
    </div>
  );
};

export default DashboardPage; 