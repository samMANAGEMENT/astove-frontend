import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  subtitle?: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  subtitle,
  className = ''
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          icon: 'bg-blue-100 text-blue-600',
          border: 'border-l-blue-500',
          text: 'text-blue-600'
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          icon: 'bg-green-100 text-green-600',
          border: 'border-l-green-500',
          text: 'text-green-600'
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          icon: 'bg-red-100 text-red-600',
          border: 'border-l-red-500',
          text: 'text-red-600'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          icon: 'bg-yellow-100 text-yellow-600',
          border: 'border-l-yellow-500',
          text: 'text-yellow-600'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          icon: 'bg-purple-100 text-purple-600',
          border: 'border-l-purple-500',
          text: 'text-purple-600'
        };
      case 'gray':
        return {
          bg: 'bg-gray-50',
          icon: 'bg-gray-100 text-gray-600',
          border: 'border-l-gray-500',
          text: 'text-gray-600'
        };
      default:
        return {
          bg: 'bg-blue-50',
          icon: 'bg-blue-100 text-blue-600',
          border: 'border-l-blue-500',
          text: 'text-blue-600'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-l-4 ${colors.border} p-6 hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <span className={trend.isPositive ? 'text-green-500' : 'text-red-500'}>
              {trend.isPositive ? '↗' : '↘'}
            </span>
            <span className="ml-1">
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          </div>
        )}
      </div>
      
      <div className="mb-2">
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-sm font-medium text-gray-600">
          {title}
        </div>
      </div>
      
      {subtitle && (
        <div className="text-xs text-gray-500">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
