import React from 'react';
import {
  DollarSign,
  Activity,
  Calendar,
  CreditCard,
  Clock,
} from 'lucide-react';
import { Spinner, Badge, Pagination } from '../components/ui';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { pagosService } from '../lib/services/pagosService';

const OperadorDashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Estados para los datos del operador
  const [misPagos, setMisPagos] = React.useState<any[]>([]);
  const [misServicios, setMisServicios] = React.useState<any[]>([]);
  const [isLoadingPagos, setIsLoadingPagos] = React.useState(true);
  const [isLoadingServicios, setIsLoadingServicios] = React.useState(true);

  // Estados para paginación de servicios
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(5);

  // Cargar pagos del operador
  useEffect(() => {
    const loadMisPagos = async () => {
      try {
        setIsLoadingPagos(true);
        const data = await pagosService.getPagosEmpleadosCompleto();
        // Filtrar solo los pagos del operador actual
        const misPagosData = data.filter((pago: any) =>
          pago.empleado_id === user?.operador?.id
        );
        setMisPagos(misPagosData);
      } catch (error) {
        console.error('Error al cargar mis pagos:', error);
      } finally {
        setIsLoadingPagos(false);
      }
    };

    if (user?.operador?.id) {
      loadMisPagos();
    }
  }, [user]);

  // Cargar servicios del operador
  useEffect(() => {
    const loadMisServicios = async () => {
      try {
        setIsLoadingServicios(true);
        if (user?.operador?.id) {
          const data = await pagosService.getServiciosEmpleado(user.operador.id);
          setMisServicios(data);
        }
      } catch (error) {
        console.error('Error al cargar mis servicios:', error);
      } finally {
        setIsLoadingServicios(false);
      }
    };

    if (user?.operador?.id) {
      loadMisServicios();
    }
  }, [user]);

  // Calcular servicios paginados
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentServicios = misServicios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(misServicios.length / itemsPerPage);

  // Resetear página cuando cambian los servicios
  React.useEffect(() => {
    setCurrentPage(1);
  }, [misServicios.length]);

  const stats = [
    {
      title: 'Total Ganado',
      value: misPagos.length > 0
        ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(misPagos[0]?.total_pagar || 0)
        : '$0',
      isLoading: isLoadingPagos,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      title: 'Servicios Realizados',
      value: misServicios.length.toString(),
      isLoading: isLoadingServicios,
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Servicios Pendientes',
      value: misServicios.filter(s => !s.pagado).length.toString(),
      isLoading: isLoadingServicios,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-orange-500'
    },
    {
      title: 'Servicios Pagados',
      value: misServicios.filter(s => s.pagado).length.toString(),
      isLoading: isLoadingServicios,
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Hola {user?.operador?.nombre} {user?.operador?.apellido}
        </h1>
        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
          <span>Bienvenido/a a tu dashboard</span>
        </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mis Servicios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Mis Servicios</h3>
            <Badge variant="info">{misServicios.length} servicios</Badge>
          </div>
          {isLoadingServicios ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="space-y-4">
              {misServicios.length > 0 ? (
                misServicios.map((servicio) => (
                  <div key={servicio.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{servicio.servicio_nombre}</div>
                        <div className="text-sm text-gray-500">
                          Cantidad: {servicio.cantidad} | Fecha: {new Date(servicio.fecha).toLocaleDateString()}
                        </div>
                        <div className={`text-sm font-medium mt-1 ${servicio.pagado ? 'text-green-600' : 'text-orange-600'
                          }`}>
                          {servicio.pagado ? '✅ Pagado' : '⏳ Pendiente de pago'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-700">
                          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(servicio.monto_empleado)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-6">No tienes servicios registrados.</div>
              )}
            </div>
          )}
        </div>

        {/* Resumen de Pagos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Resumen de Pagos</h3>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>

          {isLoadingPagos ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="md" />
            </div>
          ) : misPagos.length > 0 ? (
            <div className="space-y-4">
              {misPagos.map((pago, index) => (
                <div key={index} className="space-y-3">
                  {/* Total a Pagar */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Total a Pagar</div>
                        <div className="text-sm text-gray-500">Este mes</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-700">
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(pago.total_pagar)}
                      </div>
                    </div>
                  </div>

                  {/* Lista completa de servicios con paginación */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Todos los Servicios:</h4>

                    {currentServicios.length > 0 ? (
                      <>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {currentServicios.map((servicio: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{servicio.servicio_nombre}</div>
                                <div className="text-xs text-gray-500">
                                  Cantidad: {servicio.cantidad} | Fecha: {new Date(servicio.fecha).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="font-semibold text-blue-700">
                                  {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(servicio.monto_empleado)}
                                </div>
                                <div className="text-xs text-gray-500">{servicio.porcentaje_empleado}%</div>
                              </div>
                              <div className="ml-3">
                                <Badge
                                  variant={servicio.pagado ? "success" : "warning"}
                                  className="text-xs"
                                >
                                  {servicio.pagado ? '✅ Pagado' : '⏳ Pendiente'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Paginación */}
                        {totalPages > 1 && (
                          <div className="mt-4">
                            <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={setCurrentPage}
                              totalItems={misServicios.length}
                              itemsPerPage={itemsPerPage}
                              showInfo={false}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-500 text-center py-4">No hay servicios para mostrar en esta página.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-6">No tienes pagos pendientes.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperadorDashboardPage; 