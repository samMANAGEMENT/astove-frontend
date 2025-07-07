import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Handshake,
} from 'lucide-react';
import { Spinner } from '../components/ui';
import { useApi } from '../hooks/useApi';
import { useEffect } from 'react';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

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
  const totalPagarList = totalPagarApi.data ?? [];
  const isLoadingTotalPagar = totalPagarApi.isLoading;

  const stats = [
    {
      title: 'Total Ganado',
      value: isLoadingTotal
        ? <Spinner size="sm" />
        : totalGanado !== null
          ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalGanado)
          : '--',
      change: '1',
      changeType: 'increase',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      title: 'Lorem Lorem',
      value: '0',
      change: '0',
      changeType: '0',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Lorem Lorem',
      value: '0',
      change: '0',
      changeType: '0',
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Lorem Lorem',
      value: '0',
      change: '0',
      changeType: '0',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-orange-500'
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
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {isLoadingTotal ? <Spinner size="sm" /> : (totalGanado !== null
                    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalGanado)
                    : '--')}
                </p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'increase' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ml-1 ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">Que el mes pasado</span>
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
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cantidad a pagar</h3>
          {isLoadingTotalPagar ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {Array.isArray(totalPagarList) && totalPagarList.length > 0 ? (
                totalPagarList.map((empleado: any) => (
                  <div key={empleado.empleado_id} className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 text-blue-700 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                        {empleado.nombre[0]}{empleado.apellido[0]}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{empleado.nombre} {empleado.apellido}</div>
                        <div className="text-xs text-gray-500">ID: {empleado.empleado_id}</div>
                      </div>
                    </div>
                    <div className="font-semibold text-green-700 text-lg">
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(empleado.total_pagar)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-6">No hay datos para mostrar.</div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Crear Usuario', icon: <Users className="w-5 h-5" />, color: 'bg-blue-500', route: '/usuarios/lista' },
              { label: 'Crear Sucursal', icon: <Handshake className="w-5 h-5" />, color: 'bg-green-500', route: '/sucursales/lista' },
              { label: 'Configuración', icon: <Activity className="w-5 h-5" />, color: 'bg-purple-500', route: '/settings' },
              { label: 'Ver Analytics', icon: <DollarSign className="w-5 h-5" />, color: 'bg-orange-500', route: '/analytics' }
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
      </div>
    </div>
  );
};

export default DashboardPage; 