import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Calendar,
  CreditCard,
  PlusCircle,
  Building,
  Eye,
  EyeOff
} from 'lucide-react';
import { Spinner, Badge, Button } from '../components/ui';
import { useApi } from '../hooks/useApi';
import { pagosService, type GananciaNeta, type EstadoPagoEmpleado } from '../lib/services/pagosService';
import ingresosAdicionalesService from '../lib/services/ingresosAdicionalesService';
import gastosService from '../lib/services/gastosService';
import entidadesService, { type Entidad } from '../lib/services/entidadesService';
import PagoSemanalModal from '../components/PagoSemanalModal';
import DailyEarningsDashboard from '../components/DailyEarningsDashboard';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedEntidadId, setSelectedEntidadId] = useState<number | null>(null);
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [showGlobalView, setShowGlobalView] = useState(true);
  const [isLoadingEntidades, setIsLoadingEntidades] = useState(true);

  // Estados para los datos
  const [gananciaNeta, setGananciaNeta] = React.useState<GananciaNeta | null>(null);
  const [estadoPagos, setEstadoPagos] = React.useState<EstadoPagoEmpleado[]>([]);
  const [isLoadingGanancia, setIsLoadingGanancia] = React.useState(true);
  const [isLoadingPagos, setIsLoadingPagos] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = React.useState<EstadoPagoEmpleado | null>(null);
  const [estadisticasCompletas, setEstadisticasCompletas] = React.useState<any>(null);
  const [isLoadingEstadisticas, setIsLoadingEstadisticas] = React.useState(true);
  const [totalGastosMes, setTotalGastosMes] = React.useState<number>(0);
  const [isLoadingGastos, setIsLoadingGastos] = React.useState(true);



  // Hook para total a pagar por operador
  const totalPagarApi = useApi();
  useEffect(() => {
    const params = selectedEntidadId && !showGlobalView ? `?entidad_id=${selectedEntidadId}` : '';
    totalPagarApi.get(`/servicios/total-pagar-operador${params}`);
  }, [selectedEntidadId, showGlobalView]);

  // Hook para ganancias por método de pago
  const gananciasMetodoApi = useApi();
  useEffect(() => {
    const params = selectedEntidadId && !showGlobalView ? `?entidad_id=${selectedEntidadId}` : '';
    gananciasMetodoApi.get(`/servicios/ganancias-por-metodo-pago${params}`);
  }, [selectedEntidadId, showGlobalView]);

  const gananciasMetodoData = gananciasMetodoApi.data ?? null;
  const isLoadingGananciasMetodo = gananciasMetodoApi.isLoading;

  // Cargar entidades
  useEffect(() => {
    const loadEntidades = async () => {
      try {
        setIsLoadingEntidades(true);
        const data = await entidadesService.getEntidades();
        setEntidades(data);
      } catch (error) {
        console.error('Error al cargar entidades:', error);
      } finally {
        setIsLoadingEntidades(false);
      }
    };
    loadEntidades();
  }, []);

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

  // Cargar total de gastos del mes
  useEffect(() => {
    const loadTotalGastos = async () => {
      try {
        setIsLoadingGastos(true);
        const data = await gastosService.totalGastosMes();
        setTotalGastosMes(data.total_gastos_mes);
      } catch (error) {
        console.error('Error al cargar total de gastos:', error);
      } finally {
        setIsLoadingGastos(false);
      }
    };
    loadTotalGastos();
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
      value: gananciasMetodoData?.total_general
        ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(gananciasMetodoData.total_general)
        : '--',
      isLoading: isLoadingGananciasMetodo,
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
      change: gananciasMetodoData?.total_general && gananciaNeta?.ganancia_neta
        ? `${((gananciaNeta.ganancia_neta / gananciasMetodoData.total_general) * 100).toFixed(1)}%`
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
    },
    {
      title: 'Gastos del Mes',
      value: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalGastosMes),
      isLoading: isLoadingGastos,
      change: '--',
      changeType: 'neutral',
      icon: <TrendingDown className="w-6 h-6" />,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header con controles de administrador */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrador</h1>
            <p className="text-gray-600 mt-1">
              {showGlobalView ? 'Vista Global - Todas las entidades' : `Entidad: ${entidades.find(e => e.id === selectedEntidadId)?.nombre || 'Seleccionada'}`}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Toggle Vista Global/Específica */}
            <Button
              variant="outline"
              onClick={() => setShowGlobalView(!showGlobalView)}
              className="flex items-center gap-2"
            >
              {showGlobalView ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showGlobalView ? 'Vista Global' : 'Vista Específica'}
            </Button>

            {/* Selector de Entidad (solo cuando no es vista global) */}
            {!showGlobalView && (
              <select
                value={selectedEntidadId || ''}
                onChange={(e) => setSelectedEntidadId(e.target.value ? Number(e.target.value) : null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-black"
                disabled={isLoadingEntidades}
              >
                <option value="">Seleccionar Entidad</option>
                {entidades.map((entidad) => (
                  <option key={entidad.id} value={entidad.id}>
                    {entidad.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Ganancias Diarias */}
      <DailyEarningsDashboard />

      {/* Stats Grid Principal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
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
              <div className={`${stat.color} p-3 rounded-lg ml-4`}>
                <div className="text-white">
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Cards - Layout Mejorado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pagos Detallados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-6">
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
                (estadoPagos || []).slice(0, 5).map((empleado: EstadoPagoEmpleado) => (
                  <div key={empleado.empleado_id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
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
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-6">No hay empleados con pagos pendientes.</div>
              )}
              {(estadoPagos || []).length > 5 && (
                <div className="text-center">
                  <Button variant="outline" size="sm" onClick={() => navigate('/pagos/registrar')}>
                    Ver todos los empleados
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resumen Financiero */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-6">
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

              {/* Gastos Operativos */}
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-500 p-2 rounded-lg">
                    <TrendingDown className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Gastos Operativos</div>
                    <div className="text-sm text-gray-500">Este mes</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-red-700">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalGastosMes)}
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-6">
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
                    {estadisticasCompletas.ingresos_adicionales_detalle.servicios_ocasionales || 0} servicios
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Otros:</span>
                  <span className="font-semibold text-orange-700">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(estadisticasCompletas?.ingresos_adicionales_detalle?.otros || 0)}
                  </span>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Registrar Servicio', icon: <Activity className="w-5 h-5" />, color: 'bg-blue-500', route: '/servicios/registrar' },
            { label: 'Ingresos Adicionales', icon: <PlusCircle className="w-5 h-5" />, color: 'bg-purple-500', route: '/ingresos-adicionales' },
            { label: 'Gastos Operativos', icon: <TrendingDown className="w-5 h-5" />, color: 'bg-red-500', route: '/gastos' },
            { label: 'Ver Operadores', icon: <Users className="w-5 h-5" />, color: 'bg-green-500', route: '/operadores/lista' },
            { label: 'Ver Reportes', icon: <PieChart className="w-5 h-5" />, color: 'bg-orange-500', route: '/reportes/analytics' },
            { label: 'Gestionar Entidades', icon: <Building className="w-5 h-5" />, color: 'bg-indigo-500', route: '/sucursales/lista' },
            { label: 'Ver Pagos', icon: <CreditCard className="w-5 h-5" />, color: 'bg-yellow-500', route: '/pagos/registrar' },
            { label: 'Ver Servicios', icon: <Activity className="w-5 h-5" />, color: 'bg-teal-500', route: '/servicios/lista' }
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

export default AdminDashboardPage;
