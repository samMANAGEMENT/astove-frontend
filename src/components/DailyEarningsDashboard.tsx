import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  CreditCard,
  PlusCircle,
  Package
} from 'lucide-react';
import { Spinner, Badge, Button, Modal } from './ui';
import { useDailyEarnings } from '../hooks/useDailyEarnings';
import { formatDateForAPI } from '../lib/dateConfig';


interface DailyEarningsDashboardProps {
  className?: string;
}

const DailyEarningsDashboard: React.FC<DailyEarningsDashboardProps> = ({ className = '' }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<any | null>(null);
  // Usar el hook personalizado
  const fechaString = formatDateForAPI(selectedDate);
  const { data: dailyData, isLoading } = useDailyEarnings(fechaString);

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Función para formatear fecha
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Navegación de fechas
  const goToPreviousDay = useCallback(() => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  }, [selectedDate]);

  const goToNextDay = useCallback(() => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  }, [selectedDate]);

  const goToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  const abrirModalEmpleado = (empleado: any) => {
    setEmpleadoSeleccionado(empleado);
    setIsModalOpen(true);
  };

  const cerrarModalEmpleado = () => {
    setEmpleadoSeleccionado(null);
    setIsModalOpen(false);
  };

  const stats = useMemo(() => [
    {
      title: 'Ingresos Totales',
      value: dailyData?.resumen_diario?.ingresos_totales || 0,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200'
    },
    {
      title: 'Ganancia Neta',
      value: dailyData?.resumen_diario?.ganancia_neta || 0,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Ventas Productos',
      value: dailyData?.ventas_productos?.total_ventas || 0,
      icon: <Package className="w-6 h-6" />,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-200'
    },
    {
      title: 'Servicios Realizados',
      value: dailyData?.estadisticas?.total_servicios || 0,
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200'
    }
  ], [dailyData]);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow duration-200 ${className}`}>
      {/* Header con navegación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3 md:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Ganancias Diarias</h3>
          </div>
          <Badge variant="info" className="whitespace-nowrap text-xs md:text-sm self-start sm:self-auto">
            {formatDate(selectedDate)}
          </Badge>
        </div>

        <div className="flex items-center justify-center sm:justify-end space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={goToPreviousDay}
            className="p-2 md:p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={goToToday}
            className="px-2 md:px-3 text-xs md:text-sm"
          >
            Hoy
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={goToNextDay}
            className="p-2 md:p-2"
            disabled={selectedDate.toDateString() === new Date().toDateString()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8 md:py-12">
          <Spinner size="lg" />
        </div>
      ) : dailyData ? (
        <>
          {/* Stats Grid Compacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            {stats.map((stat, index) => (
              <div key={index} className={`${stat.bgColor} rounded-lg border ${stat.borderColor} p-3 md:p-4 hover:shadow-sm transition-all duration-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 mb-1 truncate">{stat.title}</p>
                    <div className={`text-base md:text-lg font-bold ${stat.textColor} mb-1 break-words`}>
                      {stat.title === 'Servicios Realizados'
                        ? stat.value
                        : formatCurrency(stat.value)
                      }
                    </div>
                    {stat.title === 'Ganancia Neta' && dailyData.resumen_diario?.porcentaje_ganancia && (
                      <p className="text-xs text-gray-500 truncate">
                        {dailyData.resumen_diario.porcentaje_ganancia.toFixed(1)}% del total
                      </p>
                    )}
                  </div>
                  <div className={`${stat.color} p-2 rounded-lg ml-2 flex-shrink-0`}>
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Métodos de Pago, Ingresos Adicionales y Ventas de Productos - Layout Compacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
                Métodos de Pago
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">💵 Efectivo:</span>
                  <span className="font-semibold text-green-700">
                    {formatCurrency(dailyData.metodos_pago?.efectivo?.total || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">🏦 Transferencia:</span>
                  <span className="font-semibold text-blue-700">
                    {formatCurrency(dailyData.metodos_pago?.transferencia?.total || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
                <PlusCircle className="w-4 h-4 mr-2 text-purple-600" />
                Ingresos Adicionales
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Accesorios:</span>
                  <span className="font-semibold text-blue-700">
                    {formatCurrency(dailyData.ingresos_adicionales_detalle?.accesorios || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Servicios Ocasionales:</span>
                  <span className="font-semibold text-green-700">
                    {dailyData.ingresos_adicionales_detalle?.servicios_ocasionales || 0} servicios
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Otros:</span>
                  <span className="font-semibold text-orange-700">
                    {formatCurrency(dailyData.ingresos_adicionales_detalle?.otros || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2 text-indigo-600" />
                Ventas de Productos
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total Ventas:</span>
                  <span className="font-semibold text-indigo-700">
                    {formatCurrency(dailyData.ventas_productos?.total_ventas || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Ganancia:</span>
                  <span className="font-semibold text-green-700">
                    {formatCurrency(dailyData.ventas_productos?.ganancia_ventas || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Cantidad:</span>
                  <span className="font-semibold text-blue-700">
                    {dailyData.ventas_productos?.cantidad_ventas || 0} ventas
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Servicios por Empleado - Versión Compacta */}
          {dailyData.servicios_por_empleado && dailyData.servicios_por_empleado.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
              <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2 text-blue-600" />
                Servicios por Empleado
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dailyData.servicios_por_empleado.map((empleado: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-gray-100 hover:shadow-sm transition-shadow duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
                          {empleado.nombre[0]}{empleado.apellido[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                            {empleado.nombre} {empleado.apellido}
                          </div>
                          <div className="text-xs text-gray-500">
                            {empleado.cantidad_servicios} servicios
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="font-semibold text-green-700 text-sm">
                          {formatCurrency(empleado.total_pagar)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Bruto: {formatCurrency(empleado.total_bruto || 0)}
                        </div>
                      </div>
                    </div>

                    {/* Detalles de servicios - Solo los primeros 2 */}
                    <div className="space-y-1">
                      {empleado.servicios.slice(0, 2).map((servicio: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            <span className="truncate">{servicio.servicio_nombre} (x{servicio.cantidad})</span>
                            <span className="font-medium">{formatCurrency(servicio.total_servicio)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 px-2">
                            <span>Bruto: {formatCurrency(servicio.total_bruto_servicio || 0)}</span>
                            <span>{servicio.porcentaje_empleado}%</span>
                          </div>
                        </div>
                      ))}
                      {empleado.servicios.length > 2 && (
                        <button
                          onClick={() => abrirModalEmpleado(empleado)}
                          className="text-xs text-blue-600 text-center hover:underline"
                        >
                          +{empleado.servicios.length - 2} servicios más
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Modal
            isOpen={isModalOpen}
            onClose={cerrarModalEmpleado}
            title={empleadoSeleccionado ? `Servicios de ${empleadoSeleccionado.nombre} ${empleadoSeleccionado.apellido}` : ''}
            size="lg"
          >
            {empleadoSeleccionado && (
              <div className="space-y-2">
                {empleadoSeleccionado.servicios.map((servicio: any, idx: number) => (
                  <div key={idx} className="p-2 border rounded-lg bg-gray-50">
                    <div className="flex justify-between text-sm font-medium text-gray-800">
                      <span>{servicio.servicio_nombre} (x{servicio.cantidad})</span>
                      <span>{formatCurrency(servicio.total_servicio)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Bruto: {formatCurrency(servicio.total_bruto_servicio || 0)}</span>
                      <span>{servicio.porcentaje_empleado}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Modal>


          {/* Barra de progreso de ganancia - Compacta */}
          <div className="bg-gray-50 rounded-lg p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 md:mb-3 gap-2">
              <h4 className="text-xs md:text-sm font-semibold text-gray-700">Porcentaje de Ganancia</h4>
              <span className="text-base md:text-lg font-bold text-blue-600">
                {dailyData.resumen_diario?.porcentaje_ganancia?.toFixed(1) || '0.0'}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(dailyData.resumen_diario?.porcentaje_ganancia || 0, 100)}%`
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 md:py-12">
          <BarChart3 className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 md:mb-4" />
          <h3 className="text-sm md:text-base font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
          <p className="text-xs md:text-sm text-gray-500">No se encontraron ganancias para esta fecha</p>
        </div>
      )}
    </div>
  );
};

export default DailyEarningsDashboard;
