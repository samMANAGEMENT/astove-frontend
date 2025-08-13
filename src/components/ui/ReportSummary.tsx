import React from 'react';
import { Card, Badge } from './index';
import type { LucideIcon } from 'lucide-react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Target,
  BarChart3,
  Clock
} from 'lucide-react';

interface ReportSummaryProps {
  summary: Record<string, any>;
  title: string;
  period: string;
  className?: string;
}

const ReportSummary: React.FC<ReportSummaryProps> = ({
  summary,
  title,
  period,
  className = ""
}) => {
  const getSummaryItemConfig = (key: string, value: any) => {
    const isMonetary = key.includes('ingresos') || key.includes('monto') || key.includes('total') || key.includes('pagos') || key.includes('ganancia');
    const isPositive = key.includes('ganancia') && typeof value === 'number' && value >= 0;
    const isNegative = key.includes('gastos') || (key.includes('ganancia') && typeof value === 'number' && value < 0);

    let icon: LucideIcon = Activity;
    let color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' = 'blue';
    let formattedValue = value;

    const getColorClasses = (color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray') => {
      switch (color) {
        case 'green': return 'bg-green-100 text-green-600';
        case 'red': return 'bg-red-100 text-red-600';
        case 'yellow': return 'bg-yellow-100 text-yellow-600';
        case 'purple': return 'bg-purple-100 text-purple-600';
        case 'gray': return 'bg-gray-100 text-gray-600';
        case 'blue': return 'bg-blue-100 text-blue-600';
        default: return 'bg-blue-100 text-blue-600';
      }
    };

    if (isMonetary) {
      formattedValue = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    } else if (typeof value === 'number') {
      formattedValue = new Intl.NumberFormat('es-CO').format(value);
    }

    // Configurar icono y color según el tipo de dato
    if (key.includes('ingresos')) {
      icon = TrendingUp;
      color = 'green';
    } else if (key.includes('gastos')) {
      icon = TrendingDown;
      color = 'red';
    } else if (key.includes('ganancia')) {
      icon = Target;
      color = isPositive ? 'green' : 'red';
    } else if (key.includes('operadores') || key.includes('empleados')) {
      icon = Users;
      color = 'blue';
    } else if (key.includes('servicios')) {
      icon = BarChart3;
      color = 'purple';
    } else if (key.includes('porcentaje')) {
      icon = Target;
      color = 'yellow';
    }

    return {
      icon,
      color,
      formattedValue,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      isMonetary,
      isPositive,
      isNegative,
      getColorClasses
    };
  };

  const summaryItems = Object.entries(summary).map(([key, value]) => {
    const config = getSummaryItemConfig(key, value);
    return { key, value, ...config };
  });

  // Ordenar items: ganancias primero, luego ingresos, luego gastos, luego otros
  const sortedItems = summaryItems.sort((a, b) => {
    const priority = { ganancia: 0, ingresos: 1, gastos: 2, pagos: 3 };
    const aPriority = Object.keys(priority).find(k => a.key.includes(k)) || 'other';
    const bPriority = Object.keys(priority).find(k => b.key.includes(k)) || 'other';
    return (priority[aPriority as keyof typeof priority] || 4) - (priority[bPriority as keyof typeof priority] || 4);
  });

  return (
    <div className={className}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <Badge variant="outline" className="text-sm">
            <Clock className="w-3 h-3 mr-1" />
            {period}
          </Badge>
        </div>
        <p className="text-gray-600">Resumen de métricas principales del reporte</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sortedItems.map((item) => (
          <Card key={item.key} className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${item.getColorClasses(item.color)}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-xs">
                {item.label.split(' ').slice(0, 2).join(' ')}
              </Badge>
            </div>

            <div className="mb-2">
              <div className={`text-2xl font-bold mb-1 ${item.isPositive ? 'text-green-600' :
                  item.isNegative ? 'text-red-600' :
                    'text-gray-900'
                }`}>
                {item.formattedValue}
              </div>
              <div className="text-sm text-gray-600">{item.label}</div>
            </div>

            {item.isMonetary && (
              <div className="text-xs text-gray-500">
                {item.isPositive ? 'Ganancia' : item.isNegative ? 'Gasto' : 'Valor monetario'}
              </div>
            )}
          </Card>
        ))}
      </div>

      {summaryItems.length === 0 && (
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay datos de resumen disponibles</p>
        </div>
      )}
    </div>
  );
};

export default ReportSummary;
